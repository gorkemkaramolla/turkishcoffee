import { beforeAll, describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { act, fireEvent, waitFor, render, screen } from '@testing-library/react'
import { DataTable, type DataTableProps } from './data-table'
import type { DataTableColumn } from './features'
import { columnDefIds } from './internal/columns'
import { reconcileLayout } from './internal/use-persisted-layout'

type Row = { id: string; a: string; b: string; c: string; nested: { d: string } }

const columns: Array<DataTableColumn<Row>> = [
  { accessorKey: 'a', header: 'A' },
  { accessorKey: 'b', header: 'B' },
  { accessorKey: 'c', header: 'C' },
]
const rows: Row[] = [{ id: '1', a: 'a1', b: 'b1', c: 'c1', nested: { d: 'd1' } }]

function Table(props: Partial<DataTableProps<Row>>) {
  return <DataTable aria-label="Records" columns={columns} data={rows} getRowId={(row) => row.id} {...(props as object)} />
}

const order = () => screen.getAllByRole('columnheader').map((header) => header.dataset.col)
/** A column's `flex` from the grid's width stylesheet. */
const flexIn = (grid: Element, id: string) => new RegExp(`\\.dt-c-${id}\\{flex:([^}]*)\\}`).exec(grid.querySelector('style[data-widths]')?.textContent ?? '')?.[1] ?? ''
const flex = (id: string) => flexIn(screen.getByRole('grid'), id)

async function menu(column: string, item: string) {
  act(() => screen.getByRole('button', { name: `${column} column options` }).click())
  const entry = await screen.findByRole('menuitem', { name: item })
  act(() => entry.click())
}

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

describe('column ids', () => {
  it("follows TanStack's rule: id, accessorKey (dots → _), string header; groups give their leaves", () => {
    expect(
      columnDefIds([
        { id: 'x' },
        { accessorKey: 'nested.d' },
        { header: 'Plain' },
        { header: 'Group', columns: [{ accessorKey: 'a' }, { id: 'y' }] },
        { header: () => null },
      ]),
    ).toEqual(['x', 'nested_d', 'Plain', 'a', 'y'])
  })
})

describe('layout reconciliation', () => {
  it('drops entries for columns that are gone and places new columns by definition', () => {
    const layout = reconcileLayout(
      { columnOrder: ['c', 'gone', 'a'], columnSizing: { a: 120, gone: 90 }, columnVisibility: { gone: false, b: false } },
      ['a', 'b', 'c', 'new'],
    )
    // b and new were never ordered: b after a, new after c.
    expect(layout.columnOrder).toEqual(['c', 'new', 'a', 'b'])
    expect(layout.columnSizing).toEqual({ a: 120 })
    expect(layout.columnVisibility).toEqual({ b: false })
  })

  it('a stored v1 layout with a removed column still loads, and keeps the checkbox column first', () => {
    localStorage.setItem('turkishcoffee:data-table:abc', JSON.stringify({ columnOrder: ['__select', 'c', 'removed', 'a', 'b'] }))
    render(<Table selectable reorderable layout={{ storageKey: 'abc' }} />)
    expect(order()).toEqual(['__select', 'c', 'a', 'b'])
    localStorage.clear()
  })

  it('stores v2 with the column ids', async () => {
    const { unmount } = render(<Table reorderable layout={{ storageKey: 'v2' }} />)
    await menu('A', 'Move right')
    unmount()
    const saved = JSON.parse(localStorage.getItem('turkishcoffee:data-table:v2')!)
    expect(saved).toMatchObject({ v: 2, columns: ['a', 'b', 'c'], columnOrder: ['b', 'a', 'c'] })
    localStorage.clear()
  })
})

describe('column combinations', () => {
  it('move, hide, show, resize and fit keep one consistent order and width per id', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      return { width: this.style.width === 'max-content' && this.dataset.col === 'c' ? 150 : 0 } as DOMRect
    })
    render(<Table reorderable hideable resizable />)

    await menu('A', 'Move right')
    expect(order()).toEqual(['b', 'a', 'c'])

    await menu('A', 'Hide column')
    expect(order()).toEqual(['b', 'c'])

    // Show it again from the Columns menu: it comes back where it was.
    act(() => screen.getByRole('button', { name: 'Columns' }).click())
    act(() => screen.getByRole('menuitemcheckbox', { name: 'A' }).click())
    expect(order()).toEqual(['b', 'a', 'c'])

    const beforeB = Number(flex('b').split(' ')[2]?.replace('px', ''))
    act(() => {
      fireEvent.keyDown(screen.getByRole('separator', { name: 'Resize B' }), { key: 'ArrowRight' })
    })
    expect(flex('b')).toBe(`0 0 ${beforeB + 16}px`)

    act(() => {
      fireEvent.doubleClick(screen.getByRole('separator', { name: 'Resize C' }))
    })
    expect(flex('c')).toBe('0 0 150px')
    // Moving a column keeps its width.
    await menu('C', 'Move left')
    expect(order()).toEqual(['b', 'c', 'a'])
    expect(flex('c')).toBe('0 0 150px')
    vi.restoreAllMocks()
  })

  it('reset layout restores order, visibility and widths', async () => {
    render(<Table reorderable hideable resizable />)
    await menu('A', 'Move right')
    await menu('B', 'Hide column')
    act(() => screen.getByRole('button', { name: 'Columns' }).click())
    act(() => screen.getByRole('menuitem', { name: 'Reset layout' }).click())
    expect(order()).toEqual(['a', 'b', 'c'])
  })
})

describe('layout.saved + onChange (a layout the app keeps, e.g. in a cookie)', () => {
  const saved = { columnOrder: ['c', 'a', 'b'], columnVisibility: { b: false }, columnSizing: { a: 222 } }

  it('the server render is already in the saved layout: nothing to jump after hydration', () => {
    const html = renderToString(<Table reorderable hideable resizable layout={{ saved, onChange: () => {} }} />)
    const headers = [...html.matchAll(/role="columnheader"[^>]*data-col="(\w+)"/g)].map((match) => match[1])
    expect(headers).toEqual(['c', 'a'])
    expect(html).toContain('.dt-c-a{flex:222 0 222px}')
  })

  it('drops malformed fields and unknown columns', () => {
    render(
      <Table
        reorderable
        hideable
        resizable
        layout={{
          saved: { columnOrder: ['gone', 'b', 'c', 'a'], columnSizing: { a: 'wide' as never }, columnVisibility: 'x' as never },
          onChange: () => {},
        }}
      />,
    )
    expect(order()).toEqual(['b', 'c', 'a'])
    expect(flex('a')).not.toContain('wide')
  })

  it('applies across column changes: removed ones drop, new ones take their place, reset returns to the defaults', () => {
    const onChange = vi.fn()
    const saved = { columnOrder: ['c', 'gone', 'a', 'b'], columnVisibility: { gone: false, b: false }, columnSizing: {} }
    const { rerender } = render(
      <Table reorderable hideable layout={{ saved, onChange, defaults: { columnOrder: ['b', 'a', 'c'] } }} />,
    )
    expect(order()).toEqual(['c', 'a'])
    rerender(
      <DataTable
        aria-label="Records"
        columns={[...columns, { id: 'd', accessorFn: (row) => row.nested.d, header: 'D' }]}
        data={rows}
        getRowId={(row) => row.id}
        reorderable
        hideable
        layout={{ saved, onChange, defaults: { columnOrder: ['b', 'a', 'c'] } }}
      />,
    )
    // D follows C, its neighbour in the definitions.
    expect(order()).toEqual(['c', 'd', 'a'])
    act(() => screen.getByRole('button', { name: 'Columns' }).click())
    act(() => screen.getByRole('menuitem', { name: 'Reset layout' }).click())
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(order()).toEqual(['b', 'a', 'c', 'd'])
  })

  it('reports the whole layout after each edit, and null after a reset', async () => {
    const onLayoutChange = vi.fn()
    render(<Table reorderable hideable layout={{ saved: null, onChange: onLayoutChange }} />)
    await menu('A', 'Move right')
    await waitFor(() => expect(onLayoutChange).toHaveBeenLastCalledWith({ columnOrder: ['b', 'a', 'c'], columnSizing: {}, columnVisibility: {} }))
    await menu('C', 'Hide column')
    await waitFor(() => expect(onLayoutChange).toHaveBeenLastCalledWith({
      columnOrder: ['b', 'a', 'c'],
      columnSizing: {},
      columnVisibility: { c: false },
    }))
    act(() => screen.getByRole('button', { name: 'Columns' }).click())
    act(() => screen.getByRole('menuitem', { name: 'Reset layout' }).click())
    expect(onLayoutChange).toHaveBeenLastCalledWith(null)
    expect(order()).toEqual(['a', 'b', 'c'])
  })
})
