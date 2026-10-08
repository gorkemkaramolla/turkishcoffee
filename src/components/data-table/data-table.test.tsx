import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { DataTable, type DataTableProps } from './data-table'
import type { DataTableColumn } from './features'
import { distributeWidths } from './internal/autofit'
import { moveColumn, orderedColumnIds } from './internal/columns'
import { compareValues } from './internal/sort'

type Person = { id: string; name: string; email: string | null; age: number; active: boolean }

const people: Person[] = [
  { id: '1', name: 'Zeynep', email: 'z@example.com', age: 31, active: false },
  { id: '2', name: 'Çelik', email: null, age: 9, active: true },
  { id: '3', name: 'Can', email: 'c@example.com', age: 100, active: true },
  { id: '4', name: 'Şule', email: 'a@example.com', age: 45, active: false },
]

const columns: Array<DataTableColumn<Person>> = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email', cell: (info) => info.getValue<string | null>() ?? '—' },
  { accessorKey: 'age', header: 'Age' },
  { accessorKey: 'active', header: 'Active', cell: (info) => (info.getValue<boolean>() ? 'yes' : 'no') },
]

function Table(props: Partial<DataTableProps<Person>>) {
  return <DataTable aria-label="Records" columns={columns} data={people} getRowId={(row) => row.id} locale="tr" {...props} />
}

/** The text of one column, top to bottom. */
function columnText(column: number): string[] {
  const rowgroups = screen.getAllByRole('rowgroup')
  const body = rowgroups[rowgroups.length - 1]!
  return within(body)
    .getAllByRole('row')
    .map((row) => within(row).getAllByRole('gridcell')[column]!.textContent ?? '')
}

function headerButton(name: string) {
  return within(screen.getByRole('columnheader', { name: new RegExp(name) })).getAllByRole('button')[0]!
}

/** A column's `flex` from the grid's width stylesheet. */
function columnFlex(id: string): string {
  const css = screen.getByRole('grid').querySelector('style[data-widths]')?.textContent ?? ''
  return new RegExp(`\\.dt-c-${id}\\{flex:([^}]*)\\}`).exec(css)?.[1] ?? ''
}

beforeAll(() => {
  // jsdom has no ResizeObserver; react-window and the width fitting only need it to exist.
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
  localStorage.clear()
})

describe('DataTable sorting', () => {
  it('cycles ascending → descending → off and reports it in aria-sort', () => {
    render(<Table sortable />)
    const header = screen.getByRole('columnheader', { name: /Name/ })
    expect(header.getAttribute('aria-sort')).toBeNull()

    act(() => headerButton('Name').click())
    expect(header.getAttribute('aria-sort')).toBe('ascending')
    act(() => headerButton('Name').click())
    expect(header.getAttribute('aria-sort')).toBe('descending')
    act(() => headerButton('Name').click())
    expect(header.getAttribute('aria-sort')).toBeNull()
    expect(columnText(0)).toEqual(['Zeynep', 'Çelik', 'Can', 'Şule'])
  })

  it('orders text by the Turkish alphabet', () => {
    render(<Table sortable />)
    act(() => headerButton('Name').click())
    expect(columnText(0)).toEqual(['Can', 'Çelik', 'Şule', 'Zeynep'])
  })

  it('sorts numbers by value, not as text', () => {
    render(<Table sortable />)
    act(() => headerButton('Age').click())
    expect(columnText(2)).toEqual(['9', '31', '45', '100'])
  })

  it('keeps blanks last in both directions', () => {
    render(<Table sortable />)
    act(() => headerButton('Email').click())
    expect(columnText(1)).toEqual(['a@example.com', 'c@example.com', 'z@example.com', '—'])
    act(() => headerButton('Email').click())
    expect(columnText(1)).toEqual(['z@example.com', 'c@example.com', 'a@example.com', '—'])
  })

  it('puts true before false when ascending', () => {
    render(<Table sortable />)
    act(() => headerButton('Active').click())
    expect(columnText(3)).toEqual(['yes', 'yes', 'no', 'no'])
  })
})

describe('DataTable features are opt-in', () => {
  it('renders no sort buttons, resize handles, menus or column chooser without flags', () => {
    render(<Table />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(screen.queryAllByRole('separator')).toHaveLength(0)
    expect(screen.getByRole('columnheader', { name: 'Name' }).getAttribute('aria-sort')).toBeNull()
  })

  it('shows the empty message without rows', () => {
    render(<Table data={[]} emptyMessage="Nobody here." />)
    expect(screen.getByText('Nobody here.')).toBeTruthy()
  })
})

describe('DataTable resizing', () => {
  it('resizes from the keyboard on the separator', () => {
    render(<Table resizable />)
    const before = parseInt(columnFlex('name').split(' ')[2]!, 10)
    const handle = screen.getByRole('separator', { name: 'Resize Name' })
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowRight' })
    })
    expect(columnFlex('name')).toBe(`0 0 ${before + 16}px`)
  })

  it('fits a column to its widest cell on double-click', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const measuring = this.dataset.col === 'name' && this.style.width === 'max-content'
      return { width: measuring ? (this.getAttribute('role') === 'columnheader' ? 90 : 173.2) : 0 } as DOMRect
    })
    render(<Table resizable />)
    act(() => {
      fireEvent.doubleClick(screen.getByRole('separator', { name: 'Resize Name' }))
    })
    expect(columnFlex('name')).toBe('0 0 174px')
  })
})

describe('DataTable column menus', () => {
  it('hides a column from the Columns menu, but never the last one', async () => {
    render(<Table hideable />)
    act(() => screen.getByRole('button', { name: 'Columns' }).click())
    const email = await screen.findByRole('menuitemcheckbox', { name: 'Email' })
    act(() => email.click())
    expect(screen.queryByRole('columnheader', { name: 'Email' })).toBeNull()

    for (const name of ['Age', 'Active']) {
      act(() => screen.getByRole('menuitemcheckbox', { name }).click())
    }
    const lastOne = screen.getByRole('menuitemcheckbox', { name: 'Name' })
    expect(lastOne.getAttribute('aria-disabled')).toBe('true')
  })

  it('moves a column right from its header menu', async () => {
    render(<Table reorderable />)
    act(() => screen.getByRole('button', { name: 'Name column options' }).click())
    const moveRight = await screen.findByRole('menuitem', { name: 'Move right' })
    act(() => moveRight.click())
    const headers = screen.getAllByRole('columnheader').map((header) => header.dataset.col)
    expect(headers).toEqual(['email', 'name', 'age', 'active'])
  })

  it('remembers the layout under storageKey', async () => {
    const { unmount } = render(<Table reorderable storageKey="people" />)
    act(() => screen.getByRole('button', { name: 'Name column options' }).click())
    act(() => screen.getByRole('menuitem', { name: 'Move right' }).click())
    unmount()

    render(<Table reorderable storageKey="people" />)
    const headers = screen.getAllByRole('columnheader').map((header) => header.dataset.col)
    expect(headers).toEqual(['email', 'name', 'age', 'active'])
  })
})

describe('DataTable virtualization', () => {
  it('renders only a window of rows when height is set', () => {
    const many = Array.from({ length: 1000 }, (_, i) => ({
      id: String(i),
      name: `Person ${i}`,
      email: null,
      age: i,
      active: true,
    }))
    render(<Table data={many} height={300} />)
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThan(1)
    expect(rows.length).toBeLessThan(40)
  })
})

describe('helpers', () => {
  it('compareValues: Turkish letters, numeric text, dates', () => {
    expect(['Zeynep', 'İlker', 'Irmak', 'Ömer', 'Can'].sort((a, b) => compareValues(a, b, 'tr'))).toEqual([
      'Can',
      'Irmak',
      'İlker',
      'Ömer',
      'Zeynep',
    ])
    expect(compareValues('item 2', 'item 10')).toBeLessThan(0)
    expect(compareValues(new Date(2020, 0, 1), new Date(2019, 0, 1))).toBeGreaterThan(0)
  })

  it('moveColumn keeps fixed columns in place', () => {
    const order = ['a', 'b', 'c', 'actions']
    const fixed = new Set(['actions'])
    expect(moveColumn(order, 'a', null, fixed)).toEqual(['b', 'c', 'a', 'actions'])
    expect(moveColumn(order, 'a', 'actions', fixed)).toEqual(['b', 'c', 'a', 'actions'])
    expect(moveColumn(order, 'c', 'a', fixed)).toEqual(['c', 'a', 'b', 'actions'])
  })

  it('orderedColumnIds puts unknown order entries aside and appends new columns', () => {
    expect(orderedColumnIds(['a', 'b', 'c'], ['c', 'gone', 'a'])).toEqual(['c', 'a', 'b'])
  })

  it('distributeWidths stretches proportionally and ends flush', () => {
    const result = distributeWidths({ a: 100, b: 300 }, 800, () => 1000)
    expect(result).toEqual({ a: 200, b: 600 })
    expect(distributeWidths({ a: 100 }, 50, () => 1000)).toEqual({ a: 100 })
  })
})
