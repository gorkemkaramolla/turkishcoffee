import '../../styles/storybook.css'
import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { DataTable } from './data-table'
import type { DataTableColumn } from './features'

// Layout that only a real browser can check: sticky positioning and the
// header strip following the body's horizontal scroll.

/** Whether this browser's scrollbars take space (classic) rather than overlay the content (headless Firefox). */
function classicScrollbars(): boolean {
  const probe = document.createElement('div')
  probe.style.cssText = 'overflow:scroll;width:100px;height:100px;position:absolute'
  document.body.append(probe)
  const width = probe.offsetWidth - probe.clientWidth
  probe.remove()
  return width > 0
}

type Row = { id: string; values: number[] }
const columns: Array<DataTableColumn<Row>> = Array.from({ length: 20 }, (_, c) => ({
  id: `c${c}`,
  header: `Column ${c}`,
  accessorFn: (row: Row) => row.values[c],
}))
const rows: Row[] = Array.from({ length: 60 }, (_, i) => ({ id: String(i), values: Array.from({ length: 20 }, (_, c) => i * 20 + c) }))

const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)))

async function keys(grid: HTMLElement, key: string, times = 1, init: KeyboardEventInit = {}) {
  for (let i = 0; i < times; i++) {
    grid.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }))
    await frame()
  }
  await frame()
}

function within(outer: DOMRect, inner: DOMRect) {
  return inner.top >= outer.top - 1 && inner.bottom <= outer.bottom + 1 && inner.left >= outer.left - 1 && inner.right <= outer.right + 1
}

afterEach(cleanup)

describe('layout (Chromium)', () => {
  it('the header sticks to the top of the page while the rows scroll past', async () => {
    const { container } = render(
      <div style={{ width: 900 }}>
        <div style={{ height: 300 }} />
        <DataTable aria-label="Records" columns={columns} data={rows} getRowId={(row) => row.id} />
        <div style={{ height: 2000 }} />
      </div>,
    )
    await frame()
    const strip = container.querySelector<HTMLElement>('[role="grid"] > [role="rowgroup"]')!
    window.scrollTo(0, 1200)
    await frame()
    expect(Math.round(strip.getBoundingClientRect().top)).toBe(0)
    window.scrollTo(0, 0)
  })

  it('stickyHeader={{ top }} leaves room for a fixed bar; false turns it off', async () => {
    const { container, rerender } = render(
      <div style={{ width: 900 }}>
        <DataTable aria-label="Records" columns={columns} data={rows} getRowId={(row) => row.id} stickyHeader={{ top: 64 }} />
        <div style={{ height: 2000 }} />
      </div>,
    )
    await frame()
    const strip = () => container.querySelector<HTMLElement>('[role="grid"] > [role="rowgroup"]')!
    window.scrollTo(0, 800)
    await frame()
    expect(Math.round(strip().getBoundingClientRect().top)).toBe(64)

    rerender(
      <div style={{ width: 900 }}>
        <DataTable aria-label="Records" columns={columns} data={rows} getRowId={(row) => row.id} stickyHeader={false} />
        <div style={{ height: 2000 }} />
      </div>,
    )
    await frame()
    expect(strip().getBoundingClientRect().top).toBeLessThan(0)
    window.scrollTo(0, 0)
  })

  it('the header follows the body when it scrolls sideways (normal and virtualized)', async () => {
    for (const height of [undefined, 400]) {
      const { container } = render(
        <div style={{ width: 600 }}>
          <DataTable aria-label="Records" columns={columns} data={rows} getRowId={(row) => row.id} height={height} />
        </div>,
      )
      await frame()
      const body = container.querySelectorAll<HTMLElement>('[role="grid"] > [role="rowgroup"]')[1]!
      body.scrollLeft = 700
      body.dispatchEvent(new Event('scroll'))
      await frame()
      const header = container.querySelector<HTMLElement>('[role="columnheader"][data-col="c10"]')!
      const cell = container.querySelector<HTMLElement>('[role="row"][aria-rowindex="2"] [data-col="c10"]')!
      expect(Math.round(header.getBoundingClientRect().left)).toBe(Math.round(cell.getBoundingClientRect().left))
      cleanup()
    }
  })

  it('keyboard navigation reaches rows and columns that virtualization had not rendered', async () => {
    const wide: Array<DataTableColumn<Row>> = Array.from({ length: 80 }, (_, c) => ({
      id: `w${c}`,
      header: `Wide ${c}`,
      accessorFn: (row: Row) => row.values[c % 20],
    }))
    const many: Row[] = Array.from({ length: 1000 }, (_, i) => ({ id: String(i), values: Array.from({ length: 20 }, (_, c) => i * 20 + c) }))
    const { container } = render(
      // Narrower than the test viewport (414px): the page itself must not need scrolling.
      <div style={{ width: 400 }}>
        <DataTable aria-label="Records" columns={wide} data={many} getRowId={(row) => row.id} height={400} />
      </div>,
    )
    await frame()
    const grid = container.querySelector<HTMLElement>('[role="grid"]')!
    const body = container.querySelectorAll<HTMLElement>('[role="grid"] > [role="rowgroup"]')[1]!
    grid.focus()
    const activeCell = () => document.getElementById(grid.getAttribute('aria-activedescendant')!)

    await keys(grid, 'ArrowDown', 40)
    let cell = activeCell()
    expect(cell?.closest('[role="row"]')?.getAttribute('aria-rowindex')).toBe('41')
    expect(within(body.getBoundingClientRect(), cell!.getBoundingClientRect())).toBe(true)

    await keys(grid, 'ArrowRight', 60)
    cell = activeCell()
    expect(cell?.getAttribute('aria-colindex')).toBe('61')
    expect(within(body.getBoundingClientRect(), cell!.getBoundingClientRect())).toBe(true)

    await keys(grid, 'End', 1, { ctrlKey: true })
    cell = activeCell()
    expect(cell?.closest('[role="row"]')?.getAttribute('aria-rowindex')).toBe('1001')
    expect(cell?.getAttribute('aria-colindex')).toBe('80')
    expect(within(body.getBoundingClientRect(), cell!.getBoundingClientRect())).toBe(true)
    expect(document.activeElement).toBe(grid)
  })

  it('columns wider than the page scroll inside the table, in a grid or flex parent: the page never widens', async () => {
    const wide = Object.fromEntries(columns.map((column) => [column.id!, 300]))
    for (const display of ['grid', 'flex']) {
      const { container } = render(
        <div style={{ width: 600, display, flexDirection: 'column' }}>
          <DataTable aria-label="Records" columns={columns} data={rows} getRowId={(row) => row.id} resizable initialState={{ columnSizing: wide }} />
        </div>,
      )
      await frame()
      const parent = container.firstElementChild as HTMLElement
      const body = container.querySelectorAll<HTMLElement>('[role="grid"] > [role="rowgroup"]')[1]!
      expect(Math.round(container.querySelector('[role="grid"]')!.getBoundingClientRect().width), display).toBeLessThanOrEqual(600)
      expect(parent.scrollWidth, display).toBeLessThanOrEqual(600)
      expect(body.scrollWidth, display).toBeGreaterThan(5000)
      cleanup()
    }
  })

  describe('resizing while the columns fit: the table keeps the frame width', () => {
    type Person = { id: string; name: string; email: string; phone: string; status: string }
    const people: Person[] = Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      name: `Person ${i}`,
      email: `person${i}@example.com`,
      phone: '5395455259',
      status: 'Active',
    }))
    const fitColumns: Array<DataTableColumn<Person>> = [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'phone', header: 'Phone' },
      { accessorKey: 'status', header: 'Status' },
      { id: 'actions', header: '', size: 64, enableResizing: false, cell: () => '…' },
    ]
    const setup = async () => {
      const { container } = render(
        <div style={{ width: 1000, display: 'grid' }}>
          <DataTable aria-label="Records" columns={fitColumns} data={people} getRowId={(row) => row.id} resizable />
        </div>,
      )
      await frame()
      await frame()
      const grid = container.querySelector<HTMLElement>('[role="grid"]')!
      const body = container.querySelectorAll<HTMLElement>('[role="grid"] > [role="rowgroup"]')[1]!
      const headers = () => [...container.querySelectorAll<HTMLElement>('[role="columnheader"]')]
      const rowWidth = () => Math.round(headers().reduce((sum, header) => sum + header.getBoundingClientRect().width, 0))
      const handle = (id: string) =>
        container.querySelector<HTMLElement>(`[role="columnheader"][data-col="${id}"] [role="separator"]`)
      return { grid, body, headers, rowWidth, handle }
    }
    const drag = async (handle: HTMLElement, dx: number) => {
      const box = handle.getBoundingClientRect()
      const x = box.x + box.width / 2
      const y = box.y + box.height / 2
      act(() => {
        handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y }))
      })
      for (let i = 1; i <= 20; i++) {
        act(() => {
          document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x + (dx * i) / 20, clientY: y }))
        })
      }
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x + dx, clientY: y }))
      })
      await frame()
    }

    it('dragging an edge far right stops at the frame; the neighbours give way', async () => {
      const { body, rowWidth, handle } = await setup()
      const inner = body.clientWidth
      expect(rowWidth()).toBe(inner)
      await drag(handle('name')!, 2000)
      expect(rowWidth()).toBe(inner)
      expect(body.scrollWidth).toBeLessThanOrEqual(body.clientWidth)
    })

    it("the last resizable column's edge sits on the frame: no handle", async () => {
      const { handle } = await setup()
      expect(handle('status')).toBeNull()
      expect(handle('phone')).not.toBeNull()
    })

    it('a double-click fits the column to its content and the row still fills the frame', async () => {
      const { body, rowWidth, handle, headers } = await setup()
      const email = () => headers().find((header) => header.dataset.col === 'email')!.getBoundingClientRect().width
      const before = email()
      act(() => {
        handle('email')!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
      })
      await frame()
      expect(email()).toBeLessThan(before)
      expect(rowWidth()).toBe(body.clientWidth)
    })
  })

  describe('dragging a header: the neighbours move with it', () => {
    const setup = async () => {
      const { container } = render(
        <div style={{ width: 1200 }}>
          <DataTable aria-label="Records" columns={columns.slice(0, 6)} data={rows.slice(0, 5)} getRowId={(row) => row.id} reorderable />
        </div>,
      )
      await frame()
      const header = (id: string) => container.querySelector<HTMLElement>(`[role="columnheader"][data-col="${id}"]`)!
      const cell = (id: string) => container.querySelector<HTMLElement>(`[role="row"][aria-rowindex="2"] [data-col="${id}"]`)!
      const order = () => [...container.querySelectorAll<HTMLElement>('[role="columnheader"]')].map((h) => h.dataset.col)
      const translate = (element: HTMLElement) => Number.parseFloat(element.style.translate || '0')
      return { header, cell, order, translate }
    }
    const press = (element: HTMLElement) => {
      const box = element.getBoundingClientRect()
      const at = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
      act(() => {
        element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse', clientX: at.x, clientY: at.y }))
      })
      return {
        to: (dx: number) =>
          act(() => {
            window.dispatchEvent(new PointerEvent('pointermove', { clientX: at.x + dx, clientY: at.y }))
          }),
        release: () =>
          act(() => {
            window.dispatchEvent(new PointerEvent('pointerup', {}))
          }),
      }
    }
    const settle = () => new Promise((resolve) => setTimeout(resolve, 250))

    it('a neighbour slides in proportion to how far the dragged column covers it — no jump at the midpoint', async () => {
      const { header, cell, translate } = await setup()
      const width = header('c2').getBoundingClientRect().width
      const drag = press(header('c3'))
      const seen: number[] = []
      for (const share of [0.1, 0.3, 0.45, 0.55, 0.7, 0.9]) {
        drag.to(-width * share)
        await frame()
        seen.push(translate(cell('c2')) / width)
        // Header and body of the neighbour move together; the dragged cells follow the pointer.
        expect(translate(header('c2'))).toBe(translate(cell('c2')))
        expect(Math.round(translate(cell('c3')))).toBe(Math.round(-width * share))
      }
      for (const [index, share] of [0.1, 0.3, 0.45, 0.55, 0.7, 0.9].entries()) expect(seen[index]).toBeCloseTo(share, 1)
      drag.release()
      await settle()
    })

    for (const virtualized of [false, true]) {
      it(`the drop never flashes the old order (${virtualized ? 'virtualized rows and columns' : 'plain'}): every frame shows the column on its way, or landed`, async () => {
        const many: Array<DataTableColumn<Row>> = Array.from({ length: virtualized ? 100 : 6 }, (_, c) => ({
          id: `c${c}`,
          header: `Column ${c}`,
          accessorFn: (row: Row) => row.values[c % 20],
        }))
        const { container } = render(
          <div style={{ width: 400 }}>
            <DataTable aria-label="Records"
              columns={many}
              data={virtualized ? Array.from({ length: 300 }, (_, i) => ({ id: String(i), values: rows[i % 60]!.values })) : rows.slice(0, 5)}
              getRowId={(row) => row.id}
              height={virtualized ? 300 : undefined}
              reorderable
            />
          </div>,
        )
        await frame()
        await frame()
        const header = (id: string) => container.querySelector<HTMLElement>(`[role="columnheader"][data-col="${id}"]`)!
        const left = () =>
          Math.round(container.querySelector<HTMLElement>('[role="row"][aria-rowindex="2"] [data-col="c2"]')!.getBoundingClientRect().left)
        const width = header('c1').getBoundingClientRect().width
        const home = left()
        const drag = press(header('c2'))
        drag.to(-width * 0.8)
        await frame()
        const atRelease = left()
        drag.release()
        const seen: number[] = []
        const started = performance.now()
        await new Promise<void>((resolve) => {
          const sample = () => {
            seen.push(left())
            if (performance.now() - started < 400) requestAnimationFrame(sample)
            else resolve()
          }
          requestAnimationFrame(sample)
        })
        const order = [...container.querySelectorAll<HTMLElement>('[role="columnheader"]')].slice(0, 3).map((h) => h.dataset.col)
        expect(order).toEqual(['c0', 'c2', 'c1'])
        const landed = left()
        for (const at of seen) {
          expect(at, `frames ${seen.join(',')} (home ${home})`).not.toBe(home)
          expect(at).toBeGreaterThanOrEqual(Math.min(landed, atRelease) - 1)
          expect(at).toBeLessThanOrEqual(Math.max(landed, atRelease) + 1)
        }
      })
    }

    it('between any two tasks after the release, the grid is either gliding or reordered — never back in the old order', async () => {
      const { header, order } = await setup()
      const width = header('c2').getBoundingClientRect().width
      const drag = press(header('c3'))
      drag.to(-width * 0.8)
      drag.release()
      // Poll between tasks (a message per task), where the browser may paint.
      const states = new Set<string>()
      await new Promise<void>((resolve) => {
        const channel = new MessageChannel()
        const started = performance.now()
        channel.port1.onmessage = () => {
          const moved = document.querySelector('[role="gridcell"][style*="translate:"], [role="columnheader"][style*="translate:"]')
          const reordered = order().indexOf('c3') < order().indexOf('c2')
          states.add(reordered ? 'reordered' : moved ? 'gliding' : 'old order, nothing moved')
          if (performance.now() - started < 400) channel.port2.postMessage(null)
          else resolve()
        }
        channel.port2.postMessage(null)
      })
      expect([...states]).not.toContain('old order, nothing moved')
      expect(states.has('reordered')).toBe(true)
    })

    it('a dashed outline marks where it will land: its own slot until it passes half a column, then that column\'s', async () => {
      const { header, cell } = await setup()
      const width = header('c2').getBoundingClientRect().width
      const ownLeft = cell('c3').getBoundingClientRect().left
      const neighbourLeft = cell('c2').getBoundingClientRect().left
      const drag = press(header('c3'))
      const outline = () => document.querySelector<HTMLElement>('[role="grid"] > div.border-dashed')!
      drag.to(-width * 0.3)
      // It appears with the drag's first render and is placed on the next frame.
      await frame()
      expect(Math.abs(outline().getBoundingClientRect().left - ownLeft)).toBeLessThanOrEqual(1)
      drag.to(-width * 0.7)
      // It slides there (150ms).
      await settle()
      expect(Math.abs(outline().getBoundingClientRect().left - neighbourLeft)).toBeLessThanOrEqual(1)
      expect(Math.abs(outline().getBoundingClientRect().width - cell('c3').getBoundingClientRect().width)).toBeLessThanOrEqual(1)
      drag.release()
      await settle()
      expect(document.querySelector('[role="grid"] > div.border-dashed')).toBeNull()
    })

    it('released past half: it drops there after gliding; before half: it glides back', async () => {
      const { header, order } = await setup()
      const width = header('c2').getBoundingClientRect().width
      let drag = press(header('c3'))
      drag.to(-width * 0.4)
      drag.release()
      await settle()
      expect(order().slice(0, 4)).toEqual(['c0', 'c1', 'c2', 'c3'])

      drag = press(header('c3'))
      drag.to(-width * 0.6)
      drag.release()
      // Still gliding: the order changes only once the columns are in place.
      expect(order().slice(0, 4)).toEqual(['c0', 'c1', 'c2', 'c3'])
      await settle()
      expect(order().slice(0, 4)).toEqual(['c0', 'c1', 'c3', 'c2'])
      expect(document.querySelectorAll('[role="gridcell"][style*="translate:"], [role="columnheader"][style*="translate:"]').length).toBe(0)
    })
  })

  it.skipIf(!classicScrollbars())('scrolled all the way right with a classic (space-taking) scrollbar, the header still lines up with the cells', async () => {
    {
      for (const height of [400, undefined]) {
        const { container } = render(
          <div style={{ width: 600 }}>
            <DataTable aria-label="Records" columns={columns} data={rows} getRowId={(row) => row.id} height={height} />
          </div>,
        )
        await frame()
        await frame()
        const body = container.querySelectorAll<HTMLElement>('[role="grid"] > [role="rowgroup"]')[1]!
        body.scrollLeft = body.scrollWidth
        body.dispatchEvent(new Event('scroll'))
        await frame()
        const header = container.querySelector<HTMLElement>('[role="columnheader"][data-col="c19"]')!
        const cell = container.querySelector<HTMLElement>('[role="row"][aria-rowindex="2"] [data-col="c19"]')!
        if (height) expect(body.offsetWidth - body.clientWidth).toBeGreaterThan(0)
        expect(Math.round(header.getBoundingClientRect().left), `height ${height}`).toBe(Math.round(cell.getBoundingClientRect().left))
        cleanup()
      }
    }
  })

  it.skipIf(!classicScrollbars())('virtualized rows and columns: the header strip leaves room for the scrollbar, so the last column lines up', async () => {
    const hundred: Array<DataTableColumn<Row>> = Array.from({ length: 100 }, (_, c) => ({
      id: `h${c}`,
      header: `Header ${c}`,
      accessorFn: (row: Row) => row.values[c % 20],
    }))
    const { container } = render(
      <div style={{ width: 400 }}>
        <DataTable aria-label="Records" columns={hundred} data={rows} getRowId={(row) => row.id} height={300} resizable reorderable />
      </div>,
    )
    await frame()
    await frame()
    const strip = container.querySelector<HTMLElement>('[role="grid"] > [role="rowgroup"]')!
    const body = container.querySelectorAll<HTMLElement>('[role="grid"] > [role="rowgroup"]')[1]!
    const scrollbar = body.offsetWidth - body.clientWidth
    expect(scrollbar).toBeGreaterThan(0)
    expect(strip.style.paddingInlineEnd).toBe(`${scrollbar}px`)
    body.scrollLeft = body.scrollWidth
    body.dispatchEvent(new Event('scroll'))
    await frame()
    await frame()
    const header = [...container.querySelectorAll<HTMLElement>('[role="columnheader"]')].at(-1)!
    const cell = container.querySelector<HTMLElement>(`[role="row"][aria-rowindex="2"] [data-col="${header.dataset.col}"]`)!
    expect(Math.round(header.getBoundingClientRect().left)).toBe(Math.round(cell.getBoundingClientRect().left))
  })
})
