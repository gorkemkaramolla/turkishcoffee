import { createRef, useState } from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { DataTable, type DataTableProps } from './data-table'
import type { DataTableColumn } from './features'
import type { DataTableHandle, DataTableQuery, DataTableRowSelection } from './state'

type Person = { id: string; name: string; age: number }

const columns: Array<DataTableColumn<Person>> = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
]

const people = (count: number, from = 0): Person[] =>
  Array.from({ length: count }, (_, i) => ({ id: String(from + i), name: `P${String(from + i).padStart(2, '0')}`, age: (from + i) * 7 % 50 }))

function Table(props: Partial<DataTableProps<Person>>) {
  return <DataTable aria-label="Records" columns={columns} data={people(6)} getRowId={(row) => row.id} {...(props as object)} />
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

describe('the query: sorting, filters and page as one value', () => {
  const query = (over: Partial<DataTableQuery> = {}): DataTableQuery => ({ sorting: [], columnFilters: [], ...over })

  it('uncontrolled: the grid keeps it and reports every change', () => {
    const onQueryChange = vi.fn()
    render(<Table sortable onQueryChange={onQueryChange} />)
    sortName()
    expect(onQueryChange).toHaveBeenLastCalledWith(query({ sorting: [{ id: 'name', desc: false }] }), 'sorting')
  })

  it('controlled: the grid shows only what the parent passes', () => {
    const ignored = vi.fn()
    render(<Table sortable query={query({ sorting: [{ id: 'name', desc: true }] })} onQueryChange={ignored} />)
    expect(names()[0]).toBe('P05')
    sortName()
    expect(ignored).toHaveBeenCalled()
    expect(names()[0]).toBe('P05')
  })

  it('controlled by a parent', () => {
    function Parent() {
      const [value, setValue] = useState(query())
      return <Table sortable query={value} onQueryChange={setValue} />
    }
    render(<Parent />)
    sortName()
    sortName()
    expect(names()[0]).toBe('P05')
  })

  it('a sort on a later page is one change, already on the first page', () => {
    const onQueryChange = vi.fn()
    render(<Table sortable pageSize={2} onQueryChange={onQueryChange} />)
    act(() => screen.getByRole('button', { name: 'Next page' }).click())
    act(() => screen.getByRole('button', { name: 'Next page' }).click())
    expect(onQueryChange).toHaveBeenLastCalledWith(query({ pagination: { pageIndex: 2, pageSize: 2 } }), 'pagination')
    onQueryChange.mockClear()
    sortName()
    expect(onQueryChange).toHaveBeenCalledTimes(1)
    expect(onQueryChange).toHaveBeenCalledWith(
      query({ sorting: [{ id: 'name', desc: false }], pagination: { pageIndex: 0, pageSize: 2 } }),
      'sorting',
    )
  })

  it('a filter on a later page is one change too', async () => {
    const onQueryChange = vi.fn()
    render(<Table filterable pageSize={2} defaultQuery={{ pagination: { pageIndex: 1, pageSize: 2 } }} onQueryChange={onQueryChange} />)
    act(() => screen.getByRole('button', { name: 'Filter Name' }).click())
    act(() => {
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'P0' } })
    })
    act(() => screen.getByRole('button', { name: 'Apply' }).click())
    expect(onQueryChange).toHaveBeenCalledTimes(1)
    expect(onQueryChange).toHaveBeenCalledWith(
      query({ columnFilters: [{ id: 'name', value: 'P0' }], pagination: { pageIndex: 0, pageSize: 2 } }),
      'columnFilters',
    )
  })

  it('defaultQuery seeds the query; layout.defaults the layout', () => {
    render(
      <Table
        sortable
        hideable
        defaultQuery={{ sorting: [{ id: 'age', desc: true }], pagination: { pageIndex: 1, pageSize: 2 } }}
        layout={{ defaults: { columnVisibility: { age: false } } }}
      />,
    )
    expect(screen.queryByRole('columnheader', { name: /^Age/ })).toBeNull()
    // ages: 0,7,14,21,28,35 → desc 35,28,21,14,7,0 → page 2 = 21,14
    expect(names()).toEqual(['P03', 'P02'])
  })

  it('the stored layout wins over layout.defaults', () => {
    localStorage.setItem('turkishcoffee:data-table:people', JSON.stringify({ columnVisibility: { name: false } }))
    render(<Table hideable layout={{ storageKey: 'people', defaults: { columnVisibility: { age: false } } }} />)
    expect(screen.queryByRole('columnheader', { name: /^Name/ })).toBeNull()
    expect(screen.getByRole('columnheader', { name: /^Age/ })).toBeTruthy()
    localStorage.clear()
  })

  it('resetQuery returns to defaultQuery in one change, controlled or not', () => {
    const ref = createRef<DataTableHandle<Person>>()
    const onQueryChange = vi.fn()
    const defaults = { sorting: [{ id: 'age', desc: true }] }
    const { rerender } = render(<Table ref={ref} sortable pageSize={2} defaultQuery={defaults} onQueryChange={onQueryChange} />)
    sortName()
    act(() => screen.getByRole('button', { name: 'Next page' }).click())
    onQueryChange.mockClear()
    act(() => ref.current!.resetQuery())
    expect(onQueryChange).toHaveBeenCalledTimes(1)
    expect(onQueryChange).toHaveBeenCalledWith(query({ ...defaults, pagination: { pageIndex: 0, pageSize: 2 } }), 'reset')
    expect(names()).toEqual(['P05', 'P04'])

    // Controlled: the reset is a request; the parent decides.
    onQueryChange.mockClear()
    rerender(
      <Table
        ref={ref}
        sortable
        pageSize={2}
        defaultQuery={defaults}
        query={query({ sorting: [{ id: 'name', desc: false }], pagination: { pageIndex: 2, pageSize: 2 } })}
        onQueryChange={onQueryChange}
      />,
    )
    act(() => ref.current!.resetQuery())
    expect(onQueryChange).toHaveBeenCalledWith(query({ ...defaults, pagination: { pageIndex: 0, pageSize: 2 } }), 'reset')
    expect(names()).toEqual(['P04', 'P05'])
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

  it('a controlled page out of range is clamped and reported', () => {
    const onQueryChange = vi.fn()
    render(<Table query={query({ pagination: { pageIndex: 9, pageSize: 2 } })} onQueryChange={onQueryChange} />)
    expect(names()).toEqual(['P04', 'P05'])
    expect(onQueryChange).toHaveBeenCalledWith(query({ pagination: { pageIndex: 2, pageSize: 2 } }), 'pagination')
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
        query={{ sorting: [], columnFilters: [], pagination: { pageIndex: page, pageSize: 2 } }}
        {...(props as object)}
      />
    )
  }

  it('never sorts or filters the loaded page; asks the server instead', async () => {
    const onQueryChange = vi.fn<(query: DataTableQuery) => void>()
    render(<Server sortable filterable onQueryChange={onQueryChange} />)
    expect(names()).toEqual(['P01', 'P00'])
    sortName()
    expect(onQueryChange.mock.lastCall![0].sorting).toEqual([{ id: 'name', desc: false }])
    expect(names()).toEqual(['P01', 'P00'])

    act(() => screen.getByRole('button', { name: 'Filter Name' }).click())
    const input = await screen.findByRole('textbox')
    act(() => {
      fireEvent.change(input, { target: { value: 'zzz' } })
    })
    act(() => screen.getByRole('button', { name: 'Apply' }).click())
    expect(onQueryChange.mock.lastCall![0].columnFilters).toEqual([{ id: 'name', value: 'zzz' }])
    expect(names()).toEqual(['P01', 'P00'])
  })

  it('counts and pages from rowCount, and pauses paging while loading', () => {
    const { rerender } = render(<Server />)
    expect(screen.getByText('1–2 of 6')).toBeTruthy()
    expect(screen.getByRole('grid').getAttribute('aria-rowcount')).toBe('7')
    rerender(<Server loading />)
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
            selectable={{
              value: selection,
              onChange: (next) => {
                onRowSelectionChange(next)
                setSelection(next)
              },
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
  it('every matching row: exclusions tracked, and a new filter clears it, as on the server', async () => {
    const onChange = vi.fn()
    render(<Table selectable={{ onChange }} filterable sortable pageSize={2} />)
    act(() => headerBox().click())
    act(() => headerBox().click())
    expect(screen.getByText('6 rows selected')).toBeTruthy()
    act(() => rowBoxes()[1]!.click())
    expect(onChange).toHaveBeenLastCalledWith({ type: 'allMatching', excludedIds: ['1'] })

    // Paging and sorting keep it: it is still the same result.
    act(() => screen.getByRole('button', { name: 'Next page' }).click())
    sortName()
    expect(screen.getByText('5 rows selected')).toBeTruthy()

    act(() => screen.getByRole('button', { name: 'Filter Name' }).click())
    const input = await screen.findByRole('textbox')
    act(() => {
      fireEvent.change(input, { target: { value: 'P0' } })
    })
    act(() => screen.getByRole('button', { name: 'Apply' }).click())
    expect(onChange).toHaveBeenLastCalledWith({ type: 'ids', ids: [] })
    expect(screen.queryByText(/selected/)).toBeNull()
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
    const selectable = { onChange: onRowSelectionChange }
    const { rerender } = render(<Table selectable={selectable} />)
    act(() => rowBoxes()[0]!.click())
    act(() => rowBoxes()[5]!.click())
    rerender(<Table data={people(3)} selectable={selectable} />)
    expect(onRowSelectionChange).toHaveBeenLastCalledWith({ type: 'ids', ids: ['0'] })
    expect(screen.getByText('1 row selected')).toBeTruthy()
  })

  it("scope 'page': one step, and a new page clears the selection", () => {
    render(<Table selectable={{ scope: 'page' }} pageSize={2} />)
    act(() => headerBox().click())
    expect(headerBox().getAttribute('aria-checked')).toBe('true')
    expect(headerBox().className).not.toContain('data-checked:bg-background')
    act(() => screen.getByRole('button', { name: 'Next page' }).click())
    expect(screen.queryByText(/selected/)).toBeNull()
  })

  it('controlled row selection drives the checkboxes', () => {
    const selection: DataTableRowSelection = { type: 'ids', ids: ['1', '2'] }
    render(<Table selectable={{ value: selection, onChange: () => {} }} />)
    expect(rowBoxes().map((box) => box.getAttribute('aria-checked'))).toEqual(['false', 'true', 'true', 'false', 'false', 'false'])
  })

  it('controlled column selection drives the strip and the export scope', () => {
    const ref = createRef<DataTableHandle<Person>>()
    render(
      <Table
        ref={ref}
        selectableColumns={{ value: { ids: ['age'], scope: 'page' }, onChange: () => {} }}
        pageSize={2}
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
    render(<Table pageSize="all" />)
    expect(names()).toHaveLength(6)
    expect(screen.getByText('1–6 of 6')).toBeTruthy()
  })
})
