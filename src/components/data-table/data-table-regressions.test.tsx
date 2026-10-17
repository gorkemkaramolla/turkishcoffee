import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { createRef } from 'react'
import { DataTable } from './data-table'
import { DataTableSkeleton } from './data-table-skeleton'
import type { DataTableHandle, DataTableRowSelection } from './state'
import type { DataTableColumn } from './features'

// Bugs found in the architecture review. Each test failed before its fix.

type Person = { id: string; name: string }

const columns: Array<DataTableColumn<Person>> = [{ accessorKey: 'name', header: 'Name' }]
const people = (from: number, count: number): Person[] =>
  Array.from({ length: count }, (_, i) => ({ id: String(from + i), name: `Person ${from + i}` }))

function bodyRows() {
  const groups = screen.getAllByRole('rowgroup')
  return within(groups[groups.length - 1]!).queryAllByRole('row')
}

function range() {
  return document.querySelector('[data-slot="table-pagination"] [aria-live]')?.textContent
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

describe('regressions', () => {
  it('C1: data shrinking past the current page clamps the page instead of showing "No results"', () => {
    const { rerender } = render(<DataTable aria-label="Records" columns={columns} data={people(0, 30)} pageSize={10} />)
    act(() => screen.getByRole('button', { name: 'Last page' }).click())
    expect(range()).toBe('21–30 of 30')

    rerender(<DataTable aria-label="Records" columns={columns} data={people(0, 5)} pageSize={10} />)
    expect(screen.queryByText('No results.')).toBeNull()
    expect(bodyRows()).toHaveLength(5)
    expect(range()).toBe('1–5 of 5')
  })

  it('I3: a new pageSize prop takes effect and returns to the first page', () => {
    const { rerender } = render(<DataTable aria-label="Records" columns={columns} data={people(0, 30)} pageSize={10} />)
    act(() => screen.getByRole('button', { name: 'Next page' }).click())
    rerender(<DataTable aria-label="Records" columns={columns} data={people(0, 30)} pageSize={25} />)
    expect(bodyRows()).toHaveLength(25)
    expect(range()).toBe('1–25 of 30')
  })

  it('I4: aria-rowcount counts every row, and aria-rowindex continues across pages', () => {
    render(<DataTable aria-label="Records" columns={columns} data={people(0, 30)} pageSize={10} />)
    expect(screen.getByRole('grid').getAttribute('aria-rowcount')).toBe('31')
    act(() => screen.getByRole('button', { name: 'Next page' }).click())
    expect(bodyRows()[0]!.getAttribute('aria-rowindex')).toBe('12')
  })

  it('C2: on a server page, the header box describes that page and the counter the whole selection', () => {
    const onRowSelectionChange = vi.fn()
    const page = (pageIndex: number) => (
      <DataTable aria-label="Records"
        columns={columns}
        data={people(pageIndex * 2, 2)}
        getRowId={(row) => row.id}
        selectable={{ onChange: onRowSelectionChange }}
        server={{ rowCount: 4 }}
        query={{ sorting: [], columnFilters: [], pagination: { pageIndex, pageSize: 2 } }}
      />
    )
    const { rerender } = render(page(0))
    act(() => screen.getAllByRole('checkbox', { name: 'Select row' })[0]!.click())
    expect(onRowSelectionChange).toHaveBeenLastCalledWith({ type: 'ids', ids: ['0'] })

    rerender(page(1))
    // Nothing on page 2 is selected: the header box is empty, not "mixed".
    expect(screen.getByRole('checkbox', { name: 'Select all rows' }).getAttribute('aria-checked')).toBe('false')
    // Cross-page selection (the default) keeps the row from page 1, and says it is elsewhere.
    expect(screen.getByText('1 row selected · 1 not on this page')).toBeTruthy()
  })

  it('loading its first page, it draws placeholder rows under the real headers and announces it', () => {
    const { container, rerender } = render(<DataTable aria-label="Records" columns={columns} data={[]} selectable loading />)
    expect(screen.getByRole('columnheader', { name: /^Name/ })).toBeTruthy()
    const skeletonRows = container.querySelectorAll('[data-slot="data-table-skeleton-row"]')
    expect(skeletonRows.length).toBe(8)
    // One placeholder per column, the checkbox one a square.
    expect(skeletonRows[0]!.querySelectorAll('[data-slot="skeleton"]').length).toBe(2)
    expect(screen.getByRole('status').textContent).toBe('Loading…')
    // Not rows of the grid: nothing to count, select or move through.
    expect(screen.queryAllByRole('row').length).toBe(1)

    // The app's own loading content wins over the placeholders.
    rerender(<DataTable aria-label="Records" columns={columns} data={[]} loading loadingMessage="Fetching…" />)
    expect(container.querySelector('[data-slot="data-table-skeleton-row"]')).toBeNull()
    expect(screen.getByRole('status').textContent).toBe('Fetching…')
  })

  it('DataTableSkeleton: the frame, real headers when given, rows of bars, one status', () => {
    const { container } = render(<DataTableSkeleton columns={['Name', 'Email']} rows={3} selectable label="Yükleniyor…" />)
    expect(screen.getByRole('status').textContent).toBe('Yükleniyor…')
    expect(screen.getByText('Email')).toBeTruthy()
    expect(container.querySelectorAll('[data-slot="data-table-skeleton-row"]').length).toBe(3)
  })

  it('a movable column sorts from its arrow, not from a click on the label it is dragged by', () => {
    render(<DataTable aria-label="Records" columns={columns} data={people(0, 3)} sortable reorderable />)
    const header = screen.getByRole('columnheader', { name: /^Name/ })
    const label = header.querySelector('[data-cell-content]')!
    // A real pointer click (detail 1) on the label: that is where a drag starts.
    act(() => fireEvent.click(label, { detail: 1 }))
    expect(header.getAttribute('aria-sort')).toBeNull()
    act(() => fireEvent.click(header.querySelector('[data-sort-arrow]')!, { detail: 1 }))
    expect(header.getAttribute('aria-sort')).toBe('ascending')
    // Keyboard and screen readers press the button itself (detail 0): that still sorts.
    act(() => within(header).getAllByRole('button')[0]!.click())
    expect(header.getAttribute('aria-sort')).toBe('descending')
  })

  it('server rows picked on another page or search stay selected and go into the export', () => {
    const ref = createRef<DataTableHandle<Person>>()
    const table = (data: Person[], scopeKey: string) => (
      <DataTable aria-label="Records" ref={ref}
        columns={columns}
        data={data}
        getRowId={(row) => row.id}
        selectable={{ scopeKey }}
        exportable
        server={{ rowCount: data.length }}
      />
    )
    const { rerender } = render(table(people(0, 2), ''))
    act(() => screen.getAllByRole('checkbox', { name: 'Select row' })[0]!.click())

    // A new search: the row is gone from the page, not from the selection.
    rerender(table(people(5, 2), 'search=5'))
    act(() => screen.getAllByRole('checkbox', { name: 'Select row' })[0]!.click())
    expect(screen.getByText('2 rows selected · 1 not on this page')).toBeTruthy()

    // Both rows export from what was loaded; nothing has to be asked of the server.
    const data = ref.current!.getExportData()
    expect(data.rows.map((row) => row.id).sort()).toEqual(['0', '5'])
    expect(data.request).toBeNull()
  })

  it('the selection\'s scopeKey resets an "every matching row" selection, not rows picked one by one', () => {
    const onRowSelectionChange = vi.fn<(selection: DataTableRowSelection) => void>()
    const table = (scopeKey: string, rowSelection: DataTableRowSelection) => (
      <DataTable aria-label="Records"
        columns={columns}
        data={people(0, 2)}
        getRowId={(row) => row.id}
        selectable={{ scopeKey, value: rowSelection, onChange: onRowSelectionChange }}
        server={{ rowCount: 10 }}
      />
    )
    const { rerender } = render(table('a', { type: 'allMatching', excludedIds: [] }))
    rerender(table('b', { type: 'allMatching', excludedIds: [] }))
    expect(onRowSelectionChange).toHaveBeenLastCalledWith({ type: 'ids', ids: [] })

    onRowSelectionChange.mockClear()
    rerender(table('b', { type: 'ids', ids: ['1'] }))
    rerender(table('c', { type: 'ids', ids: ['1'] }))
    expect(onRowSelectionChange).not.toHaveBeenCalled()
  })

  it('server page holding every matching row: selecting it is selecting all, no "Select all" offer', () => {
    render(
      <DataTable aria-label="Records"
        columns={columns}
        data={people(0, 6)}
        getRowId={(row) => row.id}
        selectable
        server={{ rowCount: 6 }}
        pageSize={10}
      />,
    )
    const header = () => screen.getAllByRole('checkbox')[0]!
    act(() => header().click())
    expect(screen.getByText('6 rows selected')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /^Select all/ })).toBeNull()
    expect(header().getAttribute('aria-label')).not.toMatch(/Select all \d/)
    // The next click clears, instead of "selecting all" the same six again.
    act(() => header().click())
    expect(screen.queryByText(/rows selected/)).toBeNull()
  })
})
