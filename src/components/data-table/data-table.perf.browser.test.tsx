import '../../styles/storybook.css'
import { Profiler, type ProfilerOnRenderCallback } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { DataTable, type DataTableProps } from './data-table'
import type { DataTableColumn } from './features'

// Real-browser measurements on wide, long grids. Each test logs its numbers
// (`PERF …`) and guards the properties that make the grid fast: what must not
// re-render, and how much of the grid is in the DOM.

type Row = { id: string; values: number[] }

let cellRenders = 0
const columns: Array<DataTableColumn<Row>> = Array.from({ length: 100 }, (_, c) => ({
  id: `c${c}`,
  header: `Column ${c}`,
  accessorFn: (row: Row) => row.values[c],
  cell: (info) => {
    cellRenders++
    return String(info.getValue())
  },
}))
const makeRows = (count: number): Row[] =>
  Array.from({ length: count }, (_, i) => ({ id: String(i), values: Array.from({ length: 100 }, (_, c) => i * 100 + c) }))
const rows1k = makeRows(1_000)
const rows10k = makeRows(10_000)

let commits = 0
let commitMs = 0
const onRender: ProfilerOnRenderCallback = (_id, _phase, actualDuration) => {
  commits++
  commitMs += actualDuration
}

function mount(props: Partial<DataTableProps<Row>>) {
  const started = performance.now()
  const view = render(
    <div style={{ width: 1200 }}>
      <Profiler id="grid" onRender={onRender}>
        <DataTable aria-label="Records" columns={columns} data={rows1k} getRowId={(row) => row.id} height={560} {...(props as object)} />
      </Profiler>
    </div>,
  )
  return { ...view, mountMs: performance.now() - started }
}

function reset() {
  cellRenders = 0
  commits = 0
  commitMs = 0
}

/** The glide after a header drop (150ms), with room to spare. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 250))
const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)))

afterEach(() => {
  cleanup()
  reset()
})

describe('performance (Chromium)', () => {
  it('mounts 1,000 × 100 and 10,000 × 100 with a window of rows', () => {
    reset()
    const small = mount({})
    const cells1k = small.container.querySelectorAll('[role="gridcell"]').length
    console.log(`PERF mount 1000x100: ${small.mountMs.toFixed(0)}ms, ${cells1k} cells, ${commits} commits`)
    cleanup()
    reset()
    const big = mount({ data: rows10k })
    const cells10k = big.container.querySelectorAll('[role="gridcell"]').length
    console.log(`PERF mount 10000x100: ${big.mountMs.toFixed(0)}ms, ${cells10k} cells, ${commits} commits`)
    // Row and column virtualization: the DOM holds a window, not the data.
    expect(cells1k).toBeLessThan(600)
    expect(cells10k).toBe(cells1k)
  })

  it('resizing re-renders no cell without column virtualization', async () => {
    const { container } = mount({ resizable: true, columnVirtualization: false })
    await frame()
    reset()
    const handle = container.querySelector<HTMLElement>('[role="columnheader"][data-col="c1"] [role="separator"]')!
    const box = handle.getBoundingClientRect()
    act(() => {
      handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: box.x + 2, clientY: box.y + 2 }))
    })
    for (let i = 1; i <= 30; i++) {
      act(() => {
        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: box.x + 2 + i * 4, clientY: box.y + 2 }))
      })
    }
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    })
    expect(cellRenders).toBe(0)
  })

  it('resizing re-renders rows only when columns enter or leave the view (column virtualization)', async () => {
    const { container } = mount({ resizable: true })
    await frame()
    reset()
    const handle = container.querySelector<HTMLElement>('[role="columnheader"][data-col="c1"] [role="separator"]')!
    const box = handle.getBoundingClientRect()
    const started = performance.now()
    act(() => {
      handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: box.x + 2, clientY: box.y + 2 }))
    })
    for (let i = 1; i <= 30; i++) {
      act(() => {
        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: box.x + 2 + i * 4, clientY: box.y + 2 }))
      })
    }
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    })
    const total = performance.now() - started
    console.log(
      `PERF resize 30 moves: ${total.toFixed(0)}ms total, ${(total / 30).toFixed(1)}ms/move, ${commits} commits, ${commitMs.toFixed(0)}ms React, ${cellRenders} cell renders`,
    )
    // At most one re-render of the window per column entering or leaving — never one per move.
    expect(cellRenders).toBeLessThan(container.querySelectorAll('[role="gridcell"]').length * 3)
  })

  it('dragging a header re-renders React twice (start, drop) and moves the column', async () => {
    const { container } = mount({ reorderable: true })
    await frame()
    reset()
    const header = container.querySelector<HTMLElement>('[role="columnheader"][data-col="c3"]')!
    const box = header.getBoundingClientRect()
    const started = performance.now()
    act(() => {
      header.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse', clientX: box.x + 20, clientY: box.y + 10 }))
    })
    let moveCommits = -1
    let moveCells = -1
    for (let i = 1; i <= 30; i++) {
      act(() => {
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: box.x + 20 - i * 25, clientY: box.y + 10 }))
      })
      if (i === 1) {
        moveCommits = commits
        moveCells = cellRenders
      }
    }
    const duringMoves = commits - moveCommits
    // The drag's start renders every column once (column virtualization); the moves render nothing.
    const cellsDuringDrag = cellRenders - moveCells
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup', {}))
    })
    const total = performance.now() - started
    // The columns glide into place, then the order commits.
    await settle()
    const order = [...container.querySelectorAll<HTMLElement>('[role="columnheader"]')].slice(0, 4).map((h) => h.dataset.col)
    console.log(
      `PERF drag 30 moves: ${total.toFixed(0)}ms total, ${commits} commits (${duringMoves} after the first move), ${moveCells} cell renders at the start, ${cellsDuringDrag} during the moves, order ${order.join(',')}`,
    )
    expect(duringMoves).toBe(0)
    expect(cellsDuringDrag).toBe(0)
    expect(order[0]).toBe('c3')
  })

  it('scrolling 10,000 rows renders only the rows that come into view', async () => {
    const { container } = mount({ data: rows10k })
    await frame()
    const list = container.querySelectorAll<HTMLElement>('[role="rowgroup"]')[1]!
    reset()
    const started = performance.now()
    for (let i = 1; i <= 20; i++) {
      list.scrollTop = i * 4_000
      await frame()
    }
    const total = performance.now() - started
    console.log(`PERF scroll 20 jumps: ${total.toFixed(0)}ms (${(total / 20).toFixed(1)}ms/frame), ${cellRenders} cell renders`)
    reset()
    const wheelStarted = performance.now()
    for (let i = 1; i <= 60; i++) {
      list.scrollTop += 120
      await frame()
    }
    const wheel = performance.now() - wheelStarted
    console.log(`PERF scroll 60 wheel steps (120px): ${(wheel / 60).toFixed(1)}ms/frame, ${cellRenders} cell renders`)
    expect(container.querySelectorAll('[role="row"][aria-rowindex]').length).toBeLessThan(40)
  })

  it('column virtualization: scrolling sideways renders the columns in view, aligned, at fixed widths', async () => {
    const { container } = mount({})
    await frame()
    const body = container.querySelectorAll<HTMLElement>('[role="rowgroup"]')[1]!
    const widthOf = (id: string) =>
      new RegExp(`\\.dt-c-${id}\\{flex:([^}]*)\\}`).exec(container.querySelector('style[data-widths]')!.textContent!)?.[1]
    const before = widthOf('c80')
    const firstRow = () => container.querySelector('[role="row"][aria-rowindex="2"]')!
    expect(firstRow().querySelector('[data-col="c80"]')).toBeNull()

    body.scrollLeft = body.scrollWidth
    await frame()
    await frame()
    const cell = firstRow().querySelector<HTMLElement>('[data-col="c99"]')!
    const header = container.querySelector<HTMLElement>('[role="columnheader"][data-col="c99"]')!
    expect(cell.getAttribute('aria-colindex')).toBe('100')
    expect(header.getAttribute('aria-colindex')).toBe('100')
    expect(Math.round(cell.getBoundingClientRect().left)).toBe(Math.round(header.getBoundingClientRect().left))
    // Widths were measured once for every column: scrolling one into view doesn't change it.
    expect(widthOf('c80')).toBe(before)
    expect(container.querySelectorAll('[role="columnheader"]').length).toBeLessThan(30)
    expect(document.getElementById(container.querySelector('[role="grid"]')!.getAttribute('aria-activedescendant')!)).not.toBeNull()
  })

  it('column virtualization: scrolling sideways restyles nothing on the grid', async () => {
    // A variable set on the root is inherited by every cell: changing one
    // restyles the whole grid. Scrolling only adds and removes cells, and
    // leaves the width rules alone.
    const { container } = mount({ columns: columns.map((column) => ({ ...column, size: 120 })) })
    await frame()
    const grid = container.querySelector<HTMLElement>('[role="grid"]')!
    const body = container.querySelectorAll<HTMLElement>('[role="rowgroup"]')[1]!
    const rootStyle = grid.getAttribute('style')
    const widths = grid.querySelector('style[data-widths]')!.textContent
    for (let step = 1; step <= 10; step++) {
      body.scrollLeft = step * 500
      body.dispatchEvent(new Event('scroll'))
      await frame()
    }
    expect(container.querySelector('[role="columnheader"][data-col="c45"]')).not.toBeNull()
    expect(grid.getAttribute('style')).toBe(rootStyle)
    expect(grid.querySelector('style[data-widths]')!.textContent).toBe(widths)
  })

  it('column virtualization: a drag retains its column without mounting every column', async () => {
    const { container } = mount({ reorderable: true })
    await frame()
    const header = container.querySelector<HTMLElement>('[role="columnheader"][data-col="c2"]')!
    const box = header.getBoundingClientRect()
    act(() => {
      header.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse', clientX: box.x + 20, clientY: box.y + 10 }))
    })
    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: box.x + 30, clientY: box.y + 10 }))
    })
    // While dragging every column is in the DOM.
    expect(container.querySelectorAll('[role="columnheader"]').length).toBeLessThan(30)
    for (let i = 1; i <= 10; i++) {
      act(() => {
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: box.x + 30 + i * 40, clientY: box.y + 10 }))
      })
    }
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup', {}))
    })
    await settle()
    await frame()
    const order = [...container.querySelectorAll<HTMLElement>('[role="columnheader"]')].map((h) => h.dataset.col)
    expect(order.indexOf('c2')).toBeGreaterThan(2)
    expect(container.querySelectorAll('[role="columnheader"]').length).toBeLessThan(100)
    // No cell or header keeps a slide (`translate:`); react-window's row positioning (`transform`) is not one.
    expect(container.querySelectorAll('[role="gridcell"][style*="translate:"], [role="columnheader"][style*="translate:"]').length).toBe(0)
  })
})
