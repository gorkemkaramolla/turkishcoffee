import { createRef } from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { DataTable, type DataTableProps } from './data-table'
import type { DataTableColumn } from './features'
import type { DataTableHandle } from './state'
import { toCsv } from '../table/export'

type Person = { id: string; name: string; city: string; age: number; active: boolean }

const people: Person[] = Array.from({ length: 6 }, (_, i) => ({
  id: String(i),
  name: `P${i}`,
  city: ['Ankara', 'İzmir'][i % 2]!,
  age: 20 + i,
  active: i % 2 === 0,
}))

const columns: Array<DataTableColumn<Person>> = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'city', header: 'City' },
  { accessorKey: 'age', header: 'Age' },
  { accessorKey: 'active', header: 'Status', meta: { exportValue: (row) => (row.active ? 'Active' : 'Passive') } },
  { id: 'actions', header: 'Actions', cell: () => <button type="button">Edit</button> },
]

function setup(props: Partial<DataTableProps<Person>> = {}) {
  const ref = createRef<DataTableHandle<Person>>()
  render(<DataTable aria-label="Records" ref={ref} columns={columns} data={people} getRowId={(row) => row.id} pageSize={2} {...props} />)
  return ref
}

const labels = (ref: ReturnType<typeof setup>, options?: Parameters<DataTableHandle<Person>['getExportData']>[0]) =>
  ref.current!.getExportData(options).columns.map((column) => column.label)
const names = (ref: ReturnType<typeof setup>, options?: Parameters<DataTableHandle<Person>['getExportData']>[0]) =>
  ref.current!.getExportData(options).rows.map((row) => row.name)

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

describe('getExportData: rows', () => {
  it('auto: every filtered row across pages, when nothing is selected', () => {
    expect(names(setup())).toEqual(['P0', 'P1', 'P2', 'P3', 'P4', 'P5'])
  })

  it('page, loaded, filtered and selected', async () => {
    const ref = setup({ selectable: true, filterable: true, sortable: true, initialState: { sorting: [{ id: 'age', desc: true }] } })
    expect(names(ref, { rows: 'page' })).toEqual(['P5', 'P4'])
    act(() => screen.getAllByRole('checkbox', { name: 'Select row' })[1]!.click())
    expect(names(ref)).toEqual(['P4'])
    expect(names(ref, { rows: 'selected' })).toEqual(['P4'])

    act(() => screen.getByRole('button', { name: 'Filter City' }).click())
    const input = await screen.findByRole('textbox')
    act(() => {
      fireEvent.change(input, { target: { value: 'Ankara' } })
    })
    act(() => screen.getByRole('button', { name: 'Apply' }).click())
    // filtered keeps the sort; loaded ignores filters (and sorting: data order).
    expect(names(ref, { rows: 'filtered' })).toEqual(['P4', 'P2', 'P0'])
    expect(names(ref, { rows: 'loaded' })).toEqual(['P0', 'P1', 'P2', 'P3', 'P4', 'P5'])
  })

  it('allMatching (client): every row matching the filters, minus exclusions', () => {
    const ref = setup({ selectable: true })
    act(() => screen.getAllByRole('checkbox')[0]!.click())
    act(() => screen.getAllByRole('checkbox')[0]!.click())
    act(() => screen.getAllByRole('checkbox', { name: 'Select row' })[0]!.click())
    expect(names(ref)).toEqual(['P1', 'P2', 'P3', 'P4', 'P5'])
    expect(ref.current!.getExportData().request).toBeNull()
  })

  it('a column selection covers its scope: this page, then every row', () => {
    const ref = setup({ selectableColumns: true })
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Select column City', hidden: true }))
    })
    expect(names(ref)).toEqual(['P0', 'P1'])
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Select column City', hidden: true }))
    })
    expect(names(ref)).toHaveLength(6)
  })
})

describe('getExportData: columns', () => {
  it('visible data columns in display order; display columns without exportValue are skipped', () => {
    const ref = setup({ reorderable: true, hideable: true, selectable: true })
    expect(labels(ref)).toEqual(['Name', 'City', 'Age', 'Status'])
  })

  it('selected, visible and all (hidden included), after a move', async () => {
    const ref = setup({ reorderable: true, hideable: true, selectableColumns: true })
    act(() => screen.getByRole('button', { name: 'Name column options' }).click())
    act(() => screen.getByRole('menuitem', { name: 'Move right' }).click())
    act(() => screen.getByRole('button', { name: 'Age column options' }).click())
    act(() => screen.getByRole('menuitem', { name: 'Hide column' }).click())

    expect(labels(ref, { columns: 'visible' })).toEqual(['City', 'Name', 'Status'])
    expect(labels(ref, { columns: 'all' })).toEqual(['City', 'Name', 'Age', 'Status'])
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Select column Status', hidden: true }))
    })
    expect(labels(ref)).toEqual(['Status'])
    expect(labels(ref, { columns: 'selected' })).toEqual(['Status'])
    expect(ref.current!.getExportData().columns[0]!.value(people[1]!)).toBe('Passive')
  })
})

describe('server mode', () => {
  const serverProps = (extra: Partial<DataTableProps<Person>> = {}): Partial<DataTableProps<Person>> => ({
    data: people.slice(0, 2),
    server: { rowCount: 50 },
    pagination: { pageIndex: 0, pageSize: 2 },
    onPaginationChange: () => {},
    columnFilters: [{ id: 'city', value: 'Ank' }],
    onColumnFiltersChange: () => {},
    sorting: [{ id: 'age', desc: true }],
    onSortingChange: () => {},
    ...extra,
  })

  it('rows beyond the page come back as a request for the backend', () => {
    const ref = setup({ ...serverProps(), selectable: true })
    const all = ref.current!.getExportData({ rows: 'allMatching' })
    expect(all.rows.map((row) => row.name)).toEqual(['P0', 'P1'])
    expect(all.request).toEqual({
      columns: ['name', 'city', 'age', 'active'],
      selection: null,
      sorting: [{ id: 'age', desc: true }],
      columnFilters: [{ id: 'city', value: 'Ank' }],
      pagination: { pageIndex: 0, pageSize: 2 },
    })
    expect(ref.current!.getExportData({ rows: 'page' }).request).toBeNull()

    act(() => screen.getAllByRole('checkbox')[0]!.click())
    act(() => screen.getAllByRole('checkbox')[0]!.click())
    expect(ref.current!.getExportData().request?.selection).toEqual({ type: 'allMatching', excludedIds: [] })
  })

  it("the toolbar hands a server-wide export to onServerExport; without it, it says only loaded rows go out", async () => {
    const onServerExport = vi.fn()
    setup({ ...serverProps(), exportable: { onServerExport } })
    act(() => screen.getByRole('button', { name: 'Export' }).click())
    expect(await screen.findByText('4 columns · 50 rows')).toBeTruthy()
    await act(async () => screen.getByRole('menuitem', { name: 'Excel (.xlsx)' }).click())
    expect(onServerExport).toHaveBeenCalledWith(expect.objectContaining({ selection: null }), 'xlsx')
  })

  it('without onServerExport the menu is honest about what it writes', async () => {
    setup({ ...serverProps(), exportable: true })
    act(() => screen.getByRole('button', { name: 'Export' }).click())
    expect(await screen.findByText('4 columns · 2 loaded rows only')).toBeTruthy()
  })
})

describe('CSV', () => {
  const columnsOf = <T,>(entries: Array<[string, (row: T) => unknown]>) => entries.map(([label, value]) => ({ label, value }))

  it('no rows: the header line only', () => {
    expect(toCsv(columnsOf<{ a: string }>([['A', (row) => row.a]]), [], 'en').slice(1)).toBe('A')
  })

  it('quotes, line breaks and the delimiter inside values; blanks stay empty', () => {
    const csv = toCsv(
      columnsOf<{ text: string | null }>([['Text', (row) => row.text]]),
      [{ text: 'say "hi"' }, { text: 'two\nlines' }, { text: 'a,b' }, { text: null }],
      'en',
    )
    expect(csv.slice(1).split('\r\n')).toEqual(['Text', '"say ""hi"""', '"two\nlines"', '"a,b"', ''])
  })

  it('dates: day only at midnight, with the time otherwise; Turkish text untouched', () => {
    const csv = toCsv(
      columnsOf<{ at: Date; who: string }>([
        ['At', (row) => row.at],
        ['Who', (row) => row.who],
      ]),
      [
        { at: new Date(2026, 0, 5), who: 'Çağrı Işık' },
        { at: new Date(2026, 0, 5, 14, 30), who: 'Şule Öztürk' },
      ],
      'tr',
    )
    expect(csv.slice(1).split('\r\n')).toEqual(['At;Who', '05.01.2026;Çağrı Işık', '05.01.2026 14:30;Şule Öztürk'])
  })

  it('numbers follow the locale: decimal point and comma delimiter in English', () => {
    const csv = toCsv(columnsOf<{ n: number }>([['N', (row) => row.n]]), [{ n: 1234.5 }, { n: Number.NaN }], 'en')
    expect(csv.slice(1).split('\r\n')).toEqual(['N', '1234.5', ''])
  })

  it('10,000 rows × 10 columns in well under a second', () => {
    const rows = Array.from({ length: 10_000 }, (_, i) => Array.from({ length: 10 }, (_, c) => `r${i}c${c}`))
    const wide = Array.from({ length: 10 }, (_, c) => ({ label: `C${c}`, value: (row: string[]) => row[c] }))
    const started = performance.now()
    const csv = toCsv(wide, rows, 'tr')
    expect(performance.now() - started).toBeLessThan(1000)
    expect(csv.split('\r\n')).toHaveLength(10_001)
  })
})
