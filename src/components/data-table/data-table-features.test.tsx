import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { DataTable, type DataTableProps } from './data-table'
import type { DataTableColumn } from './features'
import { toCsv } from '../table/export'

type Person = { id: string; name: string; city: string | null; age: number }

const people: Person[] = [
  { id: '1', name: 'İlker', city: 'İstanbul', age: 31 },
  { id: '2', name: 'Irmak', city: 'Ankara', age: 9 },
  { id: '3', name: 'Can', city: null, age: 100 },
  { id: '4', name: 'Şule', city: 'İzmir', age: 45 },
]

const columns: Array<DataTableColumn<Person>> = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'city', header: 'City' },
  { accessorKey: 'age', header: 'Age' },
]

function Table(props: Partial<DataTableProps<Person>>) {
  return <DataTable aria-label="Records" columns={columns} data={people} getRowId={(row) => row.id} {...(props as object)} />
}

function bodyRows() {
  const groups = screen.getAllByRole('rowgroup')
  return within(groups[groups.length - 1]!).getAllByRole('row')
}

function names(): string[] {
  return bodyRows().map((row) => row.querySelector('[data-col="name"]')?.textContent ?? '')
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

afterEach(() => {
  vi.restoreAllMocks()
})

describe('row selection', () => {
  it('counts a selection beside Export without moving it, and clears rows and columns from the count', () => {
    const { container } = render(
      <Table selectable selectableColumns hideable exportable toolbar={<input aria-label="Search records" />} />,
    )
    const search = screen.getByRole('textbox', { name: 'Search records' })
    const exportButton = screen.getByRole('button', { name: 'Export' })
    fireEvent.change(search, { target: { value: 'draft search' } })
    act(() => screen.getAllByRole('checkbox', { name: 'Select row' })[0]!.click())
    act(() => screen.getByRole('button', { name: 'Select column Name', hidden: true }).click())

    const bar = container.querySelector('[data-slot="data-table-selection"]') as HTMLElement
    expect(within(bar).getByRole('status').textContent).toContain('1 row selected')
    // The count joins the controls row; Export is the same button, where it was.
    expect(bar.closest('[data-slot="data-table-controls"]')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Export' })).toBe(exportButton)
    const clear = within(bar).getByRole('button', { name: 'Clear selection' })
    expect(screen.getByRole('textbox', { name: 'Search records' })).toBe(search)
    expect((search as HTMLInputElement).value).toBe('draft search')

    act(() => clear.click())
    expect(container.querySelector('[data-slot="data-table-selection"]')).toBeNull()
    expect(bodyRows().every((row) => row.getAttribute('aria-selected') !== 'true')).toBe(true)
    expect(screen.getByRole('button', { name: 'Select column Name', hidden: true }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('button', { name: 'Export' })).toBe(exportButton)
    expect(screen.getByRole('textbox', { name: 'Search records' })).toBe(search)
  })

  it('header box: none → all, some → all, all → none', () => {
    const onChange = vi.fn()
    render(<Table selectable={{ onChange }} />)
    const all = screen.getByRole('checkbox', { name: 'Select all rows' })

    act(() => all.click())
    expect(bodyRows().every((row) => row.getAttribute('aria-selected') === 'true')).toBe(true)
    expect(onChange).toHaveBeenLastCalledWith({ type: 'ids', ids: people.map((person) => person.id) })

    // Deselect one: the header box goes mixed; clicking it selects all again.
    act(() => screen.getAllByRole('checkbox', { name: 'Select row' })[0]!.click())
    expect(all.getAttribute('aria-checked')).toBe('mixed')
    act(() => all.click())
    expect(all.getAttribute('aria-checked')).toBe('true')

    act(() => all.click())
    expect(all.getAttribute('aria-checked')).toBe('false')
    expect(screen.queryByText(/selected/)).toBeNull()
  })

  it('Shift+click selects the range from the last clicked row', () => {
    render(<Table selectable />)
    const boxes = screen.getAllByRole('checkbox', { name: 'Select row' })
    act(() => boxes[0]!.click())
    act(() => {
      fireEvent.click(boxes[2]!, { shiftKey: true })
    })
    expect(bodyRows().map((row) => row.getAttribute('aria-selected'))).toEqual(['true', 'true', 'true', 'false'])
    expect(screen.getByText('3 rows selected')).toBeTruthy()
  })
})

describe('column selection', () => {
  const strip = (name: string) => screen.getByRole('button', { name: `Select column ${name}`, hidden: true })
  const click = (name: string, init: MouseEventInit = {}) =>
    act(() => {
      fireEvent.click(strip(name), init)
    })

  it('selects from the strip: click, Shift for a range, Ctrl to toggle; the name still sorts', () => {
    render(<Table selectableColumns sortable />)
    const header = (name: string) => screen.getByRole('columnheader', { name: new RegExp(`^${name}`) })

    click('Name')
    expect(header('Name').getAttribute('aria-selected')).toBe('true')
    click('Age', { shiftKey: true })
    expect(['Name', 'City', 'Age'].map((name) => strip(name).getAttribute('aria-pressed'))).toEqual([
      'true',
      'true',
      'true',
    ])
    click('City', { ctrlKey: true })
    expect(strip('City').getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByText(/2 columns selected/)).toBeTruthy()

    act(() => within(header('Name')).getAllByRole('button')[0]!.click())
    expect(header('Name').getAttribute('aria-sort')).toBe('ascending')
  })

  it('covers this page first, every row on the second click, nothing on the third', () => {
    render(<Table selectableColumns pageSize={2} />)
    click('Name')
    expect(screen.getByText('1 column selected · this page (2 rows)')).toBeTruthy()
    click('Name')
    expect(screen.getByText('1 column selected · all 4 rows')).toBeTruthy()
    click('Name')
    expect(screen.queryByText(/column selected/)).toBeNull()
  })
})

describe('select all in two steps', () => {
  it('selects the page first (outlined), then every row (filled), then none', () => {
    render(<Table selectable pageSize={2} />)
    const header = () => screen.getAllByRole('checkbox')[0]!

    act(() => header().click())
    expect(screen.getByText('2 rows selected')).toBeTruthy()
    expect(header().getAttribute('aria-checked')).toBe('true')
    expect(header().getAttribute('aria-label')).toBe('Select all 4 rows')
    expect(header().className).toContain('data-checked:bg-background')

    act(() => header().click())
    expect(screen.getByText('4 rows selected')).toBeTruthy()
    expect(header().className).not.toContain('data-checked:bg-background')

    act(() => header().click())
    expect(screen.queryByText(/rows selected/)).toBeNull()
  })

  it('offers "Select all" in the toolbar once the page is selected', () => {
    render(<Table selectable pageSize={2} />)
    act(() => screen.getAllByRole('checkbox')[0]!.click())
    act(() => screen.getByRole('button', { name: 'Select all 4 rows' }).click())
    expect(screen.getByText('4 rows selected')).toBeTruthy()
  })
})

describe('column filter', () => {
  it('matches Turkish letters case-insensitively and resets to page 1, in Turkish', async () => {
    render(<Table filterable pageSize={2} locale="tr-TR" />)
    act(() => screen.getByRole('button', { name: 'Sonraki sayfa' }).click())
    expect(screen.getByText('3–4 / 4')).toBeTruthy()

    act(() => screen.getByRole('button', { name: 'Name filtrele' }).click())
    const input = await screen.findByRole('textbox')
    act(() => {
      fireEvent.change(input, { target: { value: 'i' } })
    })
    act(() => screen.getByRole('button', { name: 'Uygula' }).click())
    // "i" finds İlker but not Irmak (I is dotless ı in Turkish).
    expect(names()).toEqual(['İlker'])
    expect(screen.getByText('1–1 / 1')).toBeTruthy()
  })

  it('clears every filter from the toolbar, shown only while one is set', () => {
    render(
      <Table
        filterable
        pageSize={2}
        defaultQuery={{ columnFilters: [{ id: 'name', value: 'i' }, { id: 'city', value: 'stan' }] }}
      />,
    )
    expect(names()).toEqual(['İlker'])

    act(() => screen.getByRole('button', { name: 'Clear filters' }).click())
    expect(names()).toEqual(['İlker', 'Irmak'])
    expect(screen.getByText('1–2 of 4')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull()
  })
})

describe('pagination', () => {
  it('shows the range and disables what cannot move', () => {
    render(<Table pageSize={2} />)
    expect(screen.getByText('1–2 of 4')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'First page' }).hasAttribute('disabled')).toBe(true)
    act(() => screen.getByRole('button', { name: 'Last page' }).click())
    expect(screen.getByText('3–4 of 4')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Next page' }).hasAttribute('disabled')).toBe(true)
  })

  it('virtualizes on its own past 100 rows', () => {
    const many = Array.from({ length: 5000 }, (_, i) => ({ id: String(i), name: `P${i}`, city: null, age: i }))
    render(<Table data={many} pageSize="all" />)
    expect(screen.getByText('1–5,000 of 5,000')).toBeTruthy()
    expect(bodyRows().length).toBeLessThan(60)
  })
})

describe('export', () => {
  it('writes a Turkish-Excel CSV: BOM, ; delimiter, decimal comma, quoting, formula guard', () => {
    const csv = toCsv(
      [
        { label: 'Name', value: (row: { name: string; amount: number }) => row.name },
        { label: 'Amount', value: (row: { name: string; amount: number }) => row.amount },
      ],
      [
        { name: 'Çelik; Ltd.', amount: 1234.5 },
        { name: '=SUM(A1)', amount: -3 },
      ],
      'tr',
    )
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv.slice(1).split('\r\n')).toEqual(['Name;Amount', '"Çelik; Ltd.";1234,5', "'=SUM(A1);-3"])
  })

  async function readDownloads(run: () => Promise<void>) {
    const created: Blob[] = []
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      created.push(blob as Blob)
      return 'blob:x'
    })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await run()
    return Promise.all(
      created.map(
        (blob) =>
          new Promise<string[]>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result).replace('\uFEFF', '').split('\r\n'))
            reader.readAsText(blob)
          }),
      ),
    )
  }

  async function exportCsv(scope: string) {
    act(() => screen.getByRole('button', { name: 'Export' }).click())
    expect(await screen.findByText(scope)).toBeTruthy()
    await act(async () => screen.getByRole('menuitem', { name: 'CSV (.csv)' }).click())
  }

  it('exports the selected columns of the selected rows, on any page', async () => {
    render(<Table selectable selectableColumns exportable pageSize={2} />)
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Select column Name', hidden: true }))
    })
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Select column Age', hidden: true }), { ctrlKey: true })
    })
    act(() => screen.getAllByRole('checkbox', { name: 'Select row' })[1]!.click())
    act(() => screen.getByRole('button', { name: 'Next page' }).click())
    act(() => screen.getAllByRole('checkbox', { name: 'Select row' })[1]!.click())

    const [csv] = await readDownloads(() => exportCsv('2 columns · 2 selected rows'))
    expect(csv).toEqual(['Name,Age', 'Irmak,9', 'Şule,45'])
  })

  it('a column selection exports this page, or every row once widened', async () => {
    render(<Table selectableColumns exportable pageSize={2} />)
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Select column Name', hidden: true }))
    })
    const [page] = await readDownloads(() => exportCsv('1 column · 2 rows on this page'))
    expect(page).toEqual(['Name', 'İlker', 'Irmak'])

    vi.restoreAllMocks()
    act(() => screen.getByRole('button', { name: 'Select all 4 rows' }).click())
    const [all] = await readDownloads(() => exportCsv('1 column · 4 rows'))
    expect(all).toEqual(['Name', 'İlker', 'Irmak', 'Can', 'Şule'])
  })
})
