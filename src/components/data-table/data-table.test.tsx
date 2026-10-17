import { createRef } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { actionsColumn } from './actions-column'
import { DataTable, type DataTableProps } from './data-table'
import type { DataTableColumn } from './features'
import type { DataTableHandle } from './state'
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
  return <DataTable aria-label="Records" columns={columns} data={people} getRowId={(row) => row.id} {...(props as object)} />
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

  it('Shift+click adds a column to the sort; multiSort={false} replaces it instead', () => {
    const sortAfterShiftClick = (props: Partial<DataTableProps<Person>>) => {
      const onQueryChange = vi.fn()
      const { unmount } = render(<Table sortable onQueryChange={onQueryChange} {...props} />)
      act(() => headerButton('Name').click())
      act(() => {
        fireEvent.click(headerButton('Age'), { shiftKey: true })
      })
      unmount()
      return onQueryChange.mock.lastCall![0].sorting
    }
    expect(sortAfterShiftClick({})).toEqual([
      { id: 'name', desc: false },
      { id: 'age', desc: false },
    ])
    expect(sortAfterShiftClick({ multiSort: false })).toEqual([{ id: 'age', desc: false }])
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

describe('actionsColumn', () => {
  const withActions: Array<DataTableColumn<Person>> = [
    ...columns,
    actionsColumn<Person>({
      label: 'Actions',
      cell: ({ row }) => <button type="button" aria-label={`Actions for ${row.original.name}`} />,
    }),
  ]

  it('is named for screen readers only, 56px wide, and out of sorting, filtering, resizing, hiding, moving and export', () => {
    const ref = createRef<DataTableHandle<Person>>()
    render(<Table ref={ref} columns={withActions} sortable filterable resizable hideable reorderable />)
    const header = screen.getByRole('columnheader', { name: 'Actions' })
    expect(within(header).getByText('Actions').className).toContain('sr-only')
    expect(within(header).queryAllByRole('button')).toHaveLength(0)
    expect(within(header).queryByRole('separator')).toBeNull()
    expect(header.hasAttribute('data-fixed')).toBe(true)
    expect(columnFlex('actions')).toBe('0 0 56px')
    expect(screen.getByRole('button', { name: 'Actions for Zeynep' })).toBeTruthy()
    expect(ref.current!.getExportData().columns.map((column) => column.label)).not.toContain('Actions')
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
    const { unmount } = render(<Table reorderable layout={{ storageKey: 'people' }} />)
    act(() => screen.getByRole('button', { name: 'Name column options' }).click())
    act(() => screen.getByRole('menuitem', { name: 'Move right' }).click())
    unmount()

    render(<Table reorderable layout={{ storageKey: 'people' }} />)
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

describe('filter popup inside a reorderable header', () => {
  it('a press inside the popup does not start a column drag', () => {
    render(<Table reorderable filterable />)
    fireEvent.click(screen.getAllByRole('button', { name: /filter|filtre/i })[0]!)
    const input = screen.getByRole('textbox')
    fireEvent.pointerDown(input, { button: 0, pointerType: 'mouse', clientX: 10 })
    for (const clientX of [60, 160, 260]) fireEvent.pointerMove(window, { clientX, clientY: 20 })
    expect(document.body.style.cursor).not.toBe('grabbing')
    fireEvent.pointerUp(window, { clientX: 260, clientY: 20 })
  })
})

describe('sort arrow inside a reorderable header', () => {
  const press = (element: Element) => {
    fireEvent.pointerDown(element, { button: 0, pointerType: 'mouse', clientX: 10 })
    for (const clientX of [60, 160, 260]) fireEvent.pointerMove(window, { clientX, clientY: 20 })
    const cursor = document.body.style.cursor
    fireEvent.pointerUp(window, { clientX: 260, clientY: 20 })
    return cursor
  }

  it('a press on the arrow does not start a column drag', () => {
    render(<Table reorderable sortable />)
    const sort = screen.getByRole('button', { name: /^name$/i })
    expect(press(sort.querySelector('svg')!)).not.toBe('grabbing')
  })

  it('a press on the label still drags the column', () => {
    render(<Table reorderable sortable />)
    const sort = screen.getByRole('button', { name: /^name$/i })
    expect(press(sort.querySelector('[data-cell-content]')!)).toBe('grabbing')
  })
})

describe('row appearance', () => {
  const frame = () => screen.getByRole('grid').parentElement!

  it('rows are plain and the selection grey by default', () => {
    render(<Table />)
    expect(frame().className).not.toContain('--table-row-stripe')
    expect(frame().className).not.toContain('--table-row-selected')
  })

  it('striped and a primary selection color set the row variables', () => {
    render(<Table striped selectable={{ color: 'primary' }} />)
    expect(frame().className).toContain('[--table-row-stripe:var(--table-row-even)]')
    expect(frame().className).toContain('[--table-row-selected:var(--table-row-selected-primary)]')
  })
})
