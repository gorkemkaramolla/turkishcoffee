import { createRef, useState } from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import type { SortingState } from '@tanstack/react-table'
import { DataTable, type DataTableProps } from './data-table'
import type { DataTableColumn } from './features'
import type { DataTableHandle, DataTablePagination, DataTableRowSelection } from './state'

type Person = { id: string; name: string; age: number }

const columns: Array<DataTableColumn<Person>> = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
]

const people = (count: number, from = 0): Person[] =>
  Array.from({ length: count }, (_, i) => ({ id: String(from + i), name: `P${String(from + i).padStart(2, '0')}`, age: (from + i) * 7 % 50 }))

function Table(props: Partial<DataTableProps<Person>>) {
  return <DataTable aria-label="Records" columns={columns} data={people(6)} getRowId={(row) => row.id} {...props} />
}

function names(): string[] {
  const groups = screen.getAllByRole('rowgroup')
  return within(groups[groups.length - 1]!)
    .queryAllByRole('row')
    .map((row) => row.querySelector('[data-col="name"]')?.textContent ?? '')
}

const headerBox = () => screen.getAllByRole('checkbox')[0]!
const rowBoxes = () => screen.getAllByRole('checkbox', { name: 'Select row' })
const sortName = () =>
  act(() => within(screen.getByRole('columnheader', { name: /^Name/ })).getAllByRole('button')[0]!.click())

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

describe('controlled and uncontrolled state', () => {
  it('sorting: uncontrolled reports changes; controlled follows only the parent', () => {
    const onSortingChange = vi.fn()
    const { rerender } = render(<Table sortable onSortingChange={onSortingChange} />)
    sortName()
    expect(onSortingChange).toHaveBeenLastCalledWith([{ id: 'name', desc: false }])

    // Controlled and the parent ignores the change: nothing moves.
    const ignored = vi.fn()
    rerender(<Table sortable sorting={[{ id: 'name', desc: true }]} onSortingChange={ignored} />)
    expect(names()[0]).toBe('P05')
    sortName()
    expect(ignored).toHaveBeenCalled()
    expect(names()[0]).toBe('P05')
  })

  it('controlled sorting driven by a parent', () => {
    function Parent() {
      const [sorting, setSorting] = useState<SortingState>([])
      return <Table sortable sorting={sorting} onSortingChange={setSorting} />
    }
    render(<Parent />)
    sortName()
    sortName()
    expect(names()[0]).toBe('P05')
  })

  it('initialState seeds every slice', () => {
    render(
      <Table
        sortable
        hideable
        initialState={{
          sorting: [{ id: 'age', desc: true }],
          pagination: { pageIndex: 1, pageSize: 2 },
          columnVisibility: { age: false },
        }}
      />,
    )
    expect(screen.queryByRole('columnheader', { name: /^Age/ })).toBeNull()
    // ages: 0,7,14,21,28,35 → desc 35,28,21,14,7,0 → page 2 = 21,14
    expect(names()).toEqual(['P03', 'P02'])
  })

  it('precedence: controlled > stored layout > initialState', () => {
    localStorage.setItem('turkishcoffee:data-table:people', JSON.stringify({ columnVisibility: { name: false } }))
    const { unmount } = render(<Table hideable storageKey="people" initialState={{ columnVisibility: { age: false } }} />)
    // Stored wins over initialState.
    expect(screen.queryByRole('columnheader', { name: /^Name/ })).toBeNull()
    expect(screen.getByRole('columnheader', { name: /^Age/ })).toBeTruthy()
    unmount()

    // Controlled wins over stored.
    render(<Table hideable storageKey="people" columnVisibility={{}} onColumnVisibilityChange={() => {}} />)
    expect(screen.getByRole('columnheader', { name: /^Name/ })).toBeTruthy()
    localStorage.clear()
  })

  it('the ref handle resets state, pages and reads the selection', () => {
    const ref = createRef<DataTableHandle<Person>>()
    render(<Table ref={ref} sortable selectable pageSize={2} />)
    sortName()
    act(() => rowBoxes()[0]!.click())
    expect(ref.current!.getSelectedRows().map((row) => row.id)).toEqual(['0'])

    act(() => ref.current!.setPageIndex(2))
    expect(names()).toEqual(['P04', 'P05'])
    act(() => ref.current!.resetSorting())
    act(() => ref.current!.resetRowSelection())
    expect(ref.current!.getSelectedRows()).toEqual([])
  })
})

describe('pagination', () => {
  it('a new sort, filter or page size returns to the first page', () => {
    const onPaginationChange = vi.fn()
    render(<Table sortable pageSize={2} onPaginationChange={onPaginationChange} />)
    act(() => screen.getByRole('button', { name: 'Next page' }).click())
    expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 2 })
    sortName()
    expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 0, pageSize: 2 })
  })

  it('controlled pagination clamps and reports an out-of-range page', () => {
    const onPaginationChange = vi.fn()
    render(<Table pagination={{ pageIndex: 9, pageSize: 2 }} onPaginationChange={onPaginationChange} />)
    expect(names()).toEqual(['P04', 'P05'])
    expect(onPaginationChange).toHaveBeenCalledWith({ pageIndex: 2, pageSize: 2 })
  })
})

describe('server mode', () => {
  function Server(props: Partial<DataTableProps<Person>> & { page?: number }) {
    const page = props.page ?? 0
    return (
      <DataTable aria-label="Records"
        columns={columns}
        // Deliberately unsorted: DataTable must not sort a server page itself.
        data={[...people(2, page * 2)].reverse()}
        getRowId={(row) => row.id}
        server={{ rowCount: 6 }}
        pagination={{ pageIndex: page, pageSize: 2 }}
        onPaginationChange={() => {}}
        {...props}
      />
    )
  }

  it('never sorts or filters the loaded page; asks the server instead', async () => {
    const onSortingChange = vi.fn()
    const onColumnFiltersChange = vi.fn()
    render(<Server sortable filterable onSortingChange={onSortingChange} onColumnFiltersChange={onColumnFiltersChange} />)
    expect(names()).toEqual(['P01', 'P00'])
    sortName()
    expect(onSortingChange).toHaveBeenLastCalledWith([{ id: 'name', desc: false }])
    expect(names()).toEqual(['P01', 'P00'])

    act(() => screen.getByRole('button', { name: 'Filter Name' }).click())
    const input = await screen.findByRole('textbox')
    act(() => {
      fireEvent.change(input, { target: { value: 'zzz' } })
    })
    act(() => screen.getByRole('button', { name: 'Apply' }).click())
    expect(onColumnFiltersChange).toHaveBeenLastCalledWith([{ id: 'name', value: 'zzz' }])
    expect(names()).toEqual(['P01', 'P00'])
  })

  it('counts and pages from rowCount, and pauses paging while loading', () => {
    const { rerender } = render(<Server />)
    expect(screen.getByText('1–2 of 6')).toBeTruthy()
    expect(screen.getByRole('grid').getAttribute('aria-rowcount')).toBe('7')
    rerender(<Server server={{ rowCount: 6, loading: true }} />)
    expect(screen.getByRole('grid').getAttribute('aria-busy')).toBe('true')
    expect(screen.getByRole('button', { name: 'Next page' }).hasAttribute('disabled')).toBe(true)
  })

  it('select all matching: the model is allMatching, exclusions are tracked, counts use rowCount', () => {
    const onRowSelectionChange = vi.fn()
    function Parent() {
      const [selection, setSelection] = useState<DataTableRowSelection>({ type: 'ids', ids: [] })
      const [page, setPage] = useState(0)
      return (
        <>
          <Server
            page={page}
            selectable
            rowSelection={selection}
            onRowSelectionChange={(next) => {
              onRowSelectionChange(next)
              setSelection(next)
            }}
          />
          <button onClick={() => setPage(1)}>go</button>
        </>
      )
    }
    render(<Parent />)
    act(() => headerBox().click()) // this page
    expect(screen.getByText('2 rows selected')).toBeTruthy()
    act(() => headerBox().click()) // every matching row, on the server too
    expect(onRowSelectionChange).toHaveBeenLastCalledWith({ type: 'allMatching', excludedIds: [] })
    expect(screen.getByText('6 rows selected')).toBeTruthy()

    act(() => screen.getByRole('button', { name: 'go' }).click())
    // Page 2 is part of "all matching": its rows show selected.
    expect(rowBoxes().every((box) => box.getAttribute('aria-checked') === 'true')).toBe(true)
    act(() => rowBoxes()[0]!.click())
    expect(onRowSelectionChange).toHaveBeenLastCalledWith({ type: 'allMatching', excludedIds: ['3'] })
    expect(screen.getByText('5 rows selected')).toBeTruthy()
    expect(headerBox().getAttribute('aria-checked')).toBe('mixed')
  })
})

describe('selection model (client)', () => {
  it('select all matching follows the filters; excluded rows stay out', async () => {
    const onRowSelectionChange = vi.fn()
    render(<Table selectable filterable pageSize={2} onRowSelectionChange={onRowSelectionChange} />)
    act(() => headerBox().click())
    act(() => headerBox().click())
    expect(screen.getByText('6 rows selected')).toBeTruthy()
    act(() => rowBoxes()[1]!.click())
    expect(onRowSelectionChange).toHaveBeenLastCalledWith({ type: 'allMatching', excludedIds: ['1'] })

    // Filter to P00..P01 only: one of the two is excluded.
    act(() => screen.getByRole('button', { name: 'Filter Name' }).click())
    const input = await screen.findByRole('textbox')
    act(() => {
      fireEvent.change(input, { target: { value: 'P0' } })
    })
    act(() => screen.getByRole('button', { name: 'Apply' }).click())
    expect(screen.getByText('5 rows selected')).toBeTruthy()
  })

  it('ids hidden by a filter stay selected and are counted as hidden', async () => {
    render(<Table selectable filterable />)
    act(() => rowBoxes()[5]!.click())
    act(() => screen.getByRole('button', { name: 'Filter Name' }).click())
    const input = await screen.findByRole('textbox')
    act(() => {
      fireEvent.change(input, { target: { value: 'P00' } })
    })
    act(() => screen.getByRole('button', { name: 'Apply' }).click())
    expect(screen.getByText('1 row selected · 1 hidden by filters')).toBeTruthy()
  })

  it('rows that leave the data stop being selected', () => {
    const onRowSelectionChange = vi.fn()
    const { rerender } = render(<Table selectable onRowSelectionChange={onRowSelectionChange} />)
    act(() => rowBoxes()[0]!.click())
    act(() => rowBoxes()[5]!.click())
    rerender(<Table data={people(3)} selectable onRowSelectionChange={onRowSelectionChange} />)
    expect(onRowSelectionChange).toHaveBeenLastCalledWith({ type: 'ids', ids: ['0'] })
    expect(screen.getByText('1 row selected')).toBeTruthy()
  })

  it("selectionScope 'page': one step, and a new page clears the selection", () => {
    render(<Table selectable selectionScope="page" pageSize={2} />)
    act(() => headerBox().click())
    expect(headerBox().getAttribute('aria-checked')).toBe('true')
    expect(headerBox().className).not.toContain('data-checked:bg-background')
    act(() => screen.getByRole('button', { name: 'Next page' }).click())
    expect(screen.queryByText(/selected/)).toBeNull()
  })

  it('controlled row selection drives the checkboxes', () => {
    const selection: DataTableRowSelection = { type: 'ids', ids: ['1', '2'] }
    render(<Table selectable rowSelection={selection} onRowSelectionChange={() => {}} />)
    expect(rowBoxes().map((box) => box.getAttribute('aria-checked'))).toEqual(['false', 'true', 'true', 'false', 'false', 'false'])
  })

  it('controlled column selection drives the strip and the export scope', () => {
    const ref = createRef<DataTableHandle<Person>>()
    render(
      <Table
        ref={ref}
        selectableColumns
        pageSize={2}
        columnSelection={{ ids: ['age'], scope: 'page' }}
        onColumnSelectionChange={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: 'Select column Age', hidden: true }).getAttribute('aria-pressed')).toBe('true')
    const data = ref.current!.getExportData()
    expect(data.columns.map((column) => column.label)).toEqual(['Age'])
    expect(data.rows).toHaveLength(2)
  })
})

describe('pagination edge cases', () => {
  it("pageSize 'all' paginates nothing and pageIndex stays 0", () => {
    const onPaginationChange = vi.fn<(next: DataTablePagination) => void>()
    render(<Table pageSize="all" onPaginationChange={onPaginationChange} />)
    expect(names()).toHaveLength(6)
    expect(screen.getByText('1–6 of 6')).toBeTruthy()
  })
})
