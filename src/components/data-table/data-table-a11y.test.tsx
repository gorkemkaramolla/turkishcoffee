import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { DataTable, type DataTableProps } from './data-table'
import type { DataTableColumn } from './features'

type Person = { id: string; name: string; city: string; age: number }

const people: Person[] = Array.from({ length: 30 }, (_, i) => ({
  id: String(i),
  name: `P${String(i).padStart(2, '0')}`,
  city: ['Ankara', 'İzmir', 'Bursa'][i % 3]!,
  age: 20 + i,
}))

const columns: Array<DataTableColumn<Person>> = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'city', header: 'City' },
  { accessorKey: 'age', header: 'Age' },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    meta: { reorderable: false },
    cell: () => <button type="button">Edit</button>,
  },
]

function Table(props: Partial<DataTableProps<Person>>) {
  return <DataTable aria-label="Records" columns={columns} data={people} getRowId={(row) => row.id} pageSize={10} {...(props as object)} />
}

const grid = () => screen.getByRole('grid')
const press = (key: string, init: KeyboardEventInit = {}) =>
  act(() => {
    fireEvent.keyDown(grid(), { key, ...init })
  })
/** The active cell, through aria-activedescendant. */
const active = () => document.getElementById(grid().getAttribute('aria-activedescendant')!)

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

describe('accessibility', () => {
  it('the grid is one tab stop: every control inside it is out of the tab order', () => {
    render(<Table sortable resizable reorderable hideable filterable selectable selectableColumns />)
    expect(grid().tabIndex).toBe(0)
    const tabbable = within(grid())
      .queryAllByRole('button', { hidden: true })
      .concat(within(grid()).queryAllByRole('checkbox'), within(grid()).queryAllByRole('separator'))
      .filter((element) => element.tabIndex >= 0)
    expect(tabbable).toEqual([])
  })

  it('rows and cells carry their position: aria-rowcount, aria-rowindex, aria-colcount, aria-colindex', () => {
    render(<Table />)
    expect(grid().getAttribute('aria-rowcount')).toBe('31')
    expect(grid().getAttribute('aria-colcount')).toBe('4')
    const cell = within(screen.getAllByRole('row')[1]!).getAllByRole('gridcell')[2]!
    expect(cell.getAttribute('aria-colindex')).toBe('3')
    expect(screen.getByRole('columnheader', { name: /^Age/ }).getAttribute('aria-colindex')).toBe('3')
  })

  it('arrow keys, Home/End, Ctrl+Home/End and PageDown move the active cell', () => {
    render(<Table />)
    act(() => grid().focus())
    expect(active()?.getAttribute('role')).toBe('columnheader')
    press('ArrowDown')
    expect(active()?.textContent).toBe('P00')
    press('ArrowRight')
    expect(active()?.textContent).toBe('Ankara')
    press('End')
    expect(active()?.getAttribute('aria-colindex')).toBe('4')
    press('Home')
    press('PageDown')
    expect(active()?.textContent).toBe('P09')
    press('End', { ctrlKey: true })
    expect(active()?.closest('[role="row"]')?.getAttribute('aria-rowindex')).toBe('11')
    press('Home', { ctrlKey: true })
    expect(active()?.getAttribute('role')).toBe('columnheader')
    expect(active()?.hasAttribute('data-active')).toBe(true)
  })

  it('on a header: Enter sorts, Alt+ArrowDown opens the column menu, Escape gives focus back to the grid', async () => {
    render(<Table sortable hideable />)
    act(() => grid().focus())
    press('Enter')
    expect(screen.getByRole('columnheader', { name: /^Name/ }).getAttribute('aria-sort')).toBe('ascending')
    press('ArrowDown', { altKey: true })
    const menu = await screen.findByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: 'Hide column' })).toBeTruthy()
    act(() => {
      fireEvent.keyDown(menu, { key: 'Escape' })
    })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(grid())
  })

  it('Ctrl+Space selects the column; Shift+Space and Space on the checkbox select rows; Ctrl+A selects all', () => {
    render(<Table selectable selectableColumns />)
    act(() => grid().focus())
    press('ArrowRight')
    press(' ', { ctrlKey: true })
    expect(screen.getByRole('columnheader', { name: /^Name/ }).getAttribute('aria-selected')).toBe('true')

    press('ArrowDown')
    press(' ', { shiftKey: true })
    expect(screen.getByText('1 row selected')).toBeTruthy()
    press('ArrowDown')
    press('Home')
    press(' ')
    expect(screen.getByText('2 rows selected')).toBeTruthy()
    press('a', { ctrlKey: true })
    expect(screen.getByText('30 rows selected')).toBeTruthy()
  })

  it('F2 works inside a cell; Escape comes back to the grid and the control leaves the tab order', () => {
    render(<Table />)
    act(() => grid().focus())
    press('ArrowDown')
    press('End')
    press('F2')
    const button = within(active()!).getByRole('button', { name: 'Edit' })
    expect(document.activeElement).toBe(button)
    expect(button.tabIndex).toBe(0)
    act(() => {
      fireEvent.keyDown(button, { key: 'Escape' })
    })
    expect(document.activeElement).toBe(grid())
    act(() => {
      fireEvent.focusOut(active()!, { relatedTarget: grid() })
    })
    expect(button.tabIndex).toBe(-1)
  })

  it('Enter on a row calls onRowClick', () => {
    const onRowClick = vi.fn()
    render(<Table onRowClick={onRowClick} />)
    act(() => grid().focus())
    press('ArrowDown')
    press('ArrowDown')
    press('Enter')
    expect(onRowClick).toHaveBeenCalledWith(people[1])
  })

  it('Escape in the filter popover cancels without applying', async () => {
    render(<Table filterable />)
    act(() => screen.getByRole('button', { name: 'Filter City' }).click())
    const input = await screen.findByRole('textbox')
    act(() => {
      fireEvent.change(input, { target: { value: 'Ankara' } })
    })
    act(() => {
      fireEvent.keyDown(input, { key: 'Escape' })
    })
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.getByText('1–10 of 30')).toBeTruthy()
  })

  it('Escape clears a column selection', () => {
    render(<Table selectableColumns />)
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Select column Name', hidden: true }))
    })
    expect(screen.getByText(/1 column selected/)).toBeTruthy()
    act(() => grid().focus())
    press('Escape')
    expect(screen.queryByText(/column selected/)).toBeNull()
  })
})
