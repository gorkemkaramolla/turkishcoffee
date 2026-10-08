import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import { DataTable } from './data-table'
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
        selectable
        server={{ rowCount: 4 }}
        pagination={{ pageIndex, pageSize: 2 }}
        onPaginationChange={() => {}}
        onRowSelectionChange={onRowSelectionChange}
      />
    )
    const { rerender } = render(page(0))
    act(() => screen.getAllByRole('checkbox', { name: 'Select row' })[0]!.click())
    expect(onRowSelectionChange).toHaveBeenLastCalledWith({ type: 'ids', ids: ['0'] })

    rerender(page(1))
    // Nothing on page 2 is selected: the header box is empty, not "mixed".
    expect(screen.getByRole('checkbox', { name: 'Select all rows' }).getAttribute('aria-checked')).toBe('false')
    // Cross-page selection (the default) keeps the row from page 1, and says so.
    expect(screen.getByText('1 row selected')).toBeTruthy()
  })

  it('server page holding every matching row: selecting it is selecting all, no "Select all" offer', () => {
    render(
      <DataTable aria-label="Records"
        columns={columns}
        data={people(0, 6)}
        getRowId={(row) => row.id}
        selectable
        server={{ rowCount: 6 }}
        pagination={{ pageIndex: 0, pageSize: 10 }}
        onPaginationChange={() => {}}
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
