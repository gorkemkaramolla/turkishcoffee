import { createRef } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { DataTable, type DataTableProps } from './data-table'
import type { DataTableColumn } from './features'
import type { DataTableHandle } from './state'
import { columnClass } from './internal/columns'
import { createContainsFilterFn } from './internal/filter'
import { distributeWidths, resizeWithin } from './internal/autofit'
import { TablePagination } from '../table/table-pagination'
import { Table } from '../table/table'
import { exportTable } from '../table/export'

vi.mock('../table/export', async (original) => ({ ...await original<object>(), exportTable: vi.fn() }))
type Person = { id: string; name: string; eligible: boolean }
const data: Person[] = Array.from({ length: 6 }, (_, i) => ({ id: String(i), name: `P${i}`, eligible: i % 2 === 0 }))
const columns: DataTableColumn<Person>[] = [{ accessorKey: 'name', header: 'Name' }]
const getRowId = (row: Person) => row.id

function mount(props: Partial<DataTableProps<Person>> = {}) {
  const ref = createRef<DataTableHandle<Person>>()
  const view = render(<DataTable aria-label="People" ref={ref} columns={columns} data={data} getRowId={getRowId} {...props} />)
  return { ...view, ref }
}
const active = () => document.getElementById(screen.getByRole('grid').getAttribute('aria-activedescendant')!)
beforeAll(() => vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} }))
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.useRealTimers() })

describe('review regressions', () => {
  it('reconciles active identity across pages, sorting, and hidden columns', () => {
    const { ref, rerender } = mount({ pageSize: 2 })
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowDown' })
    expect(active()?.textContent).toBe('P0')
    act(() => ref.current!.setPageIndex(1))
    expect(active()?.textContent).toBe('P2')
    rerender(<DataTable aria-label="People" columns={columns} data={data} getRowId={getRowId} sortable sorting={[{ id: 'name', desc: true }]} />)
    expect(active()?.textContent).toBe('P2')
    rerender(<DataTable aria-label="People" columns={columns} data={data} columnVisibility={{ name: false }} />)
    expect(screen.getByRole('grid').hasAttribute('aria-activedescendant')).toBe(false)
  })

  it('names the grid and page size control', () => {
    mount({ pageSize: 2, 'aria-describedby': 'instructions' })
    expect(screen.getByRole('grid', { name: 'People' }).getAttribute('aria-describedby')).toBe('instructions')
    expect(screen.getByRole('combobox', { name: 'Rows per page:' })).toBeTruthy()
  })

  it('preserves original accessor indices when exporting sorted rows', () => {
    const { ref } = mount({ sortable: true, columns: [{ id: 'index', header: 'Index', accessorFn: (_, index) => index + 1 }], sorting: [{ id: 'index', desc: true }] })
    const prepared = ref.current!.getExportData()
    expect(prepared.rows.map(prepared.columns[0]!.value)).toEqual([6, 5, 4, 3, 2, 1])
  })

  it('uses the server export callback from the imperative handle', async () => {
    const onServerExport = vi.fn()
    const { ref } = mount({ server: { rowCount: 100 }, pageSize: 6, exportable: { onServerExport } })
    await ref.current!.export('csv')
    expect(onServerExport).toHaveBeenCalledWith(expect.objectContaining({ selection: null }), 'csv')
    expect(exportTable).not.toHaveBeenCalled()
  })

  it('rejects an incomplete imperative export and permits an explicit loaded export', async () => {
    const onExportError = vi.fn()
    const { ref } = mount({ server: { rowCount: 100 }, pageSize: 6, onExportError })
    await expect(ref.current!.export('csv')).rejects.toThrow('onServerExport')
    expect(onExportError).toHaveBeenCalledOnce()
    await ref.current!.export('csv', { rows: 'loaded' })
    expect(exportTable).toHaveBeenCalledWith(expect.objectContaining({ rows: data }))
  })

  it('returns explicit selected hidden rows after filtered rows', () => {
    const { ref } = mount({ selectable: true, filterable: true, initialState: { rowSelection: { type: 'ids', ids: ['0', '1'] }, columnFilters: [{ id: 'name', value: 'P1' }] } })
    expect(ref.current!.getSelectedRows().map(getRowId)).toEqual(['1', '0'])
    expect(ref.current!.getExportData({ rows: 'selected' }).rows.map(getRowId)).toEqual(['1', '0'])
  })

  it('encodes punctuation and Unicode column IDs without collisions', () => {
    const ids = ['a.b', 'a_b', 'a_2e_b', 'İsim', 'Ösim', '😀', '', '0']
    expect(new Set(ids.map(columnClass)).size).toBe(ids.length)
    for (const id of ids) expect(columnClass(id)).toMatch(/^[a-zA-Z][\w-]*$/)
  })

  it('does not confuse dates and string cache keys', () => {
    const filter = createContainsFilterFn('en-US')
    const row = (value: unknown) => ({ getValue: () => value }) as unknown as Parameters<typeof filter>[0]
    expect(filter(row(new Date(0)), 'x', '1970', () => {})).toBe(true)
    expect(filter(row('d0'), 'x', '1970', () => {})).toBe(false)
  })

  it('redistributes available width without violating maximums', () => {
    expect(distributeWidths({ a: 100, b: 100 }, 500, id => id === 'a' ? 1000 : 150)).toEqual({ a: 350, b: 150 })
    expect(resizeWithin([{ id: 'a', width: 100, min: 48, max: 150, resizable: true }], 'a', 80, 500).a).toBe(150)
    for (const available of [200, 350, 1000]) {
      const sizes = distributeWidths({ a: 100, b: 100 }, available, () => 200)
      expect(sizes.a! + sizes.b!).toBeCloseTo(Math.min(available, 400))
      expect(Math.max(...Object.values(sizes))).toBeLessThanOrEqual(200)
    }
  })

  it.each([0, -1, NaN, Infinity, 1.5])('rejects invalid pageSize %s', (pageSize) => {
    expect(() => render(<TablePagination page={1} pageSize={pageSize} total={10} onPageChange={() => {}} />)).toThrow('pageSize')
  })
})

describe('public contracts', () => {
  it('requires stable IDs for server selection at runtime', () => {
    expect(() => mount({ server: { rowCount: 100 }, selectable: true, getRowId: undefined } as never)).toThrow('getRowId')
  })

  it('restricts every client selection path and its counts', () => {
    const { ref } = mount({ selectable: true, isRowSelectable: row => row.eligible, pageSize: 2 })
    expect(screen.getAllByRole('checkbox', { name: 'Select row' })[1]!.hasAttribute('disabled')).toBe(true)
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'a', ctrlKey: true })
    expect(ref.current!.getSelectedRows().map(getRowId)).toEqual(['0', '2', '4'])
    expect(screen.getByText('3 rows selected')).toBeTruthy()
  })

  it('restricted server selection uses loaded eligible IDs only', () => {
    const onRowSelectionChange = vi.fn()
    mount({ server: { rowCount: 100 }, selectable: true, isRowSelectable: row => row.eligible, onRowSelectionChange })
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'a', ctrlKey: true })
    expect(onRowSelectionChange).toHaveBeenLastCalledWith({ type: 'ids', ids: ['0', '2', '4'] })
    expect(screen.queryByText('Select all 100 rows')).toBeNull()
  })

  it('supports non-string filters and controls without serializing values', () => {
    const value = { minimum: 3n, self: {} as unknown }
    value.self = value
    const custom: DataTableColumn<Person>[] = [{ accessorKey: 'name', header: 'Name', filterFn: (row, _, filter) => Number(row.original.id) >= Number(filter.minimum), meta: {
      filterControl: ({ onApply }) => <button onClick={() => onApply(value)}>Apply minimum</button>,
    } }]
    const { ref } = mount({ columns: custom, filterable: true })
    fireEvent.click(screen.getByRole('button', { name: 'Filter Name' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply minimum' }))
    expect(ref.current!.getExportData().rows.map(getRowId)).toEqual(['3', '4', '5'])
  })

  it('preserves consumer tab stops and skips disabled and roving-negative controls', () => {
    mount({ columns: [{ id: 'actions', header: 'Actions', cell: () => <><button disabled>Disabled</button><button tabIndex={-1}>Roving</button><button>Edit</button></> }] })
    const grid = screen.getByRole('grid')
    act(() => grid.focus())
    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    fireEvent.keyDown(grid, { key: 'F2' })
    expect(document.activeElement?.textContent).toBe('Edit')
    expect(within(active()!).getByText('Roving').tabIndex).toBe(-1)
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(document.activeElement).toBe(grid)
    expect(within(active()!).getByText('Edit').tabIndex).toBe(-1)
  })

  it('renders error and loading statuses outside row counts', () => {
    const { rerender } = mount({ data: [], loading: true })
    expect(screen.getByRole('status').textContent).toBe('Loading…')
    expect(screen.getByRole('grid').getAttribute('aria-rowcount')).toBe('1')
    expect(screen.getAllByRole('row')).toHaveLength(1)
    rerender(<DataTable aria-label="People" data={[]} columns={columns} loading errorMessage="Request failed" />)
    expect(screen.getByRole('alert').textContent).toBe('Request failed')
  })

  it('exposes the native table and its configurable container separately', () => {
    const table = createRef<HTMLTableElement>()
    const container = createRef<HTMLDivElement>()
    render(<Table ref={table} containerProps={{ ref: container, role: 'region', 'aria-label': 'Invoices', tabIndex: 0 }} />)
    expect(container.current).toBe(screen.getByRole('region', { name: 'Invoices' }))
    expect(table.current?.parentElement).toBe(container.current)
  })

  it('debounces layout persistence and cancels pending edits on reset', () => {
    vi.useFakeTimers()
    const onLayoutChange = vi.fn()
    const { ref } = mount({ resizable: true, storageKey: 'audit', onLayoutChange })
    const handle = screen.getByRole('separator', { name: 'Resize Name' })
    for (let i = 0; i < 8; i++) fireEvent.keyDown(handle, { key: 'ArrowRight' })
    expect(onLayoutChange).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(200))
    expect(onLayoutChange).toHaveBeenCalledOnce()
    fireEvent.keyDown(handle, { key: 'ArrowRight' })
    act(() => ref.current!.resetLayout())
    act(() => vi.advanceTimersByTime(250))
    expect(onLayoutChange).toHaveBeenLastCalledWith(null)
    expect(localStorage.getItem('turkishcoffee:data-table:audit')).toBeNull()
  })
})

describe('plan follow-ups', () => {
  it('toolbar export failure shows a status, reports the error and re-enables the menu', async () => {
    const failure = new Error('disk full')
    vi.mocked(exportTable).mockRejectedValueOnce(failure)
    const onExportError = vi.fn()
    mount({ exportable: true, onExportError })
    act(() => screen.getByRole('button', { name: 'Export' }).click())
    await act(async () => screen.getByRole('menuitem', { name: 'CSV (.csv)' }).click())
    expect(onExportError).toHaveBeenCalledWith(failure, 'csv')
    expect(screen.getByRole('alert').textContent).toBe('Export failed. Please try again.')
    expect(screen.getByRole('button', { name: 'Export' }).hasAttribute('disabled')).toBe(false)
  })

  it('imperative export rejects and reports the error', async () => {
    const failure = new Error('denied')
    vi.mocked(exportTable).mockRejectedValueOnce(failure)
    const onExportError = vi.fn()
    const { ref } = mount({ onExportError })
    await expect(ref.current!.export('xlsx')).rejects.toBe(failure)
    expect(onExportError).toHaveBeenCalledWith(failure, 'xlsx')
  })

  it('clears a server allMatching selection when the filters change', () => {
    const onRowSelectionChange = vi.fn()
    const props = { server: { rowCount: 100 }, selectable: true as const, getRowId, onRowSelectionChange, rowSelection: { type: 'allMatching' as const, excludedIds: ['1'] } }
    const { rerender } = render(<DataTable aria-label="People" columns={columns} data={data} {...props} columnFilters={[]} />)
    expect(onRowSelectionChange).not.toHaveBeenCalled()
    rerender(<DataTable aria-label="People" columns={columns} data={data} {...props} columnFilters={[{ id: 'name', value: 'P' }]} />)
    expect(onRowSelectionChange).toHaveBeenLastCalledWith({ type: 'ids', ids: [] })
  })

  it('restricted server Ctrl+A adds this page to ids selected on other pages', () => {
    const onRowSelectionChange = vi.fn()
    mount({ server: { rowCount: 100 }, selectable: true, isRowSelectable: row => row.eligible, onRowSelectionChange, initialState: { rowSelection: { type: 'ids', ids: ['remote-7'] } } })
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'a', ctrlKey: true })
    expect(onRowSelectionChange).toHaveBeenLastCalledWith({ type: 'ids', ids: ['remote-7', '0', '2', '4'] })
  })

  it('rejects an allMatching selection under restricted server selection', () => {
    expect(() => mount({ server: { rowCount: 100 }, selectable: true, isRowSelectable: row => row.eligible, rowSelection: { type: 'allMatching', excludedIds: [] } })).toThrow('explicit IDs')
  })

  it('validates pagination inputs', () => {
    expect(() => mount({ pageSize: 0 })).toThrow('pageSize')
    expect(() => mount({ pagination: { pageIndex: -1, pageSize: 10 } })).toThrow('pageIndex')
    expect(() => mount({ server: { rowCount: Number.NaN } })).toThrow('rowCount')
  })

  it('shows the empty status inside the frame, below the header', () => {
    mount({ data: [] })
    const status = screen.getByRole('status')
    expect(status.textContent).toBe('No results.')
    expect(status.previousElementSibling).toBe(screen.getByRole('grid'))
  })
})
