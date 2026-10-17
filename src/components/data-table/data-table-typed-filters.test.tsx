import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { DataTable } from './data-table'
import type { DataTableColumn } from './features'
import { createContainsFilterFn, toDate } from './internal/filter'

type Person = { id: string; name: string; team: string; salary: number; started: Date; joined: string; active: boolean }

const people: Person[] = [
  { id: '1', name: 'Ada', team: 'Sales', salary: 40_000, started: new Date(2020, 2, 1), joined: '2020-03-01', active: true },
  { id: '2', name: 'Can', team: 'Legal', salary: 55_000, started: new Date(2021, 5, 15), joined: '2021-06-15', active: false },
  { id: '3', name: 'Ece', team: 'Sales', salary: 70_000, started: new Date(2020, 2, 20), joined: '2020-03-20', active: true },
]

const columns: Array<DataTableColumn<Person>> = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'team', header: 'Team', meta: { filter: { variant: 'options' } } },
  { accessorKey: 'salary', header: 'Salary' },
  { accessorKey: 'started', header: 'Started' },
  { accessorKey: 'joined', header: 'Joined', meta: { filter: { variant: 'date' } } },
  {
    accessorKey: 'active',
    header: 'Status',
    meta: {
      exportValue: (row: Person) => (row.active ? 'Exported active' : 'Exported passive'),
      filter: { options: [{ value: true, label: 'Active' }, { value: false, label: 'Passive' }] },
    },
  },
  { id: 'remote', accessorFn: (row) => row.active, header: 'Remote' },
]

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

const names = () => {
  const groups = screen.getAllByRole('rowgroup')
  return within(groups[groups.length - 1]!)
    .queryAllByRole('row')
    .map((row) => row.querySelector('[data-col="name"]')?.textContent)
}
const open = (column: string) => act(() => screen.getByRole('button', { name: `Filter ${column}` }).click())
const apply = () => act(() => screen.getByRole('button', { name: 'Apply' }).click())

describe('a filter that fits the column', () => {
  it('numbers get Min and Max, both inclusive', async () => {
    render(<DataTable aria-label="People" columns={columns} data={people} filterable />)
    open('Salary')
    const min = await screen.findByRole('spinbutton', { name: 'Min' })
    act(() => {
      fireEvent.change(min, { target: { value: '55000' } })
    })
    apply()
    expect(names()).toEqual(['Can', 'Ece'])

    open('Salary')
    expect((await screen.findByRole('spinbutton', { name: 'Min' }) as HTMLInputElement).value).toBe('55000')
    act(() => {
      fireEvent.change(screen.getByRole('spinbutton', { name: 'Max' }), { target: { value: '60000' } })
    })
    apply()
    expect(names()).toEqual(['Can'])
  })

  it('dates get a calendar, not a text field; one click picks a day', async () => {
    render(
      <DataTable
        aria-label="People"
        columns={columns}
        data={people}
        filterable
        defaultQuery={{ columnFilters: [{ id: 'started', value: { from: new Date(2020, 2, 1), to: new Date(2020, 2, 31) } }] }}
      />,
    )
    expect(names()).toEqual(['Ada', 'Ece'])
    open('Started')
    await screen.findByRole('grid', { name: /2020/ })
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.getByText('Mar 1, 2020 – Mar 31, 2020')).toBeTruthy()

    act(() => document.querySelector<HTMLElement>(`[data-day="${new Date(2020, 2, 20).toLocaleDateString()}"]`)!.click())
    expect(screen.getByText('Mar 20, 2020')).toBeTruthy()
    apply()
    expect(names()).toEqual(['Ece'])
  })

  it('dates kept as strings filter by day with filter.variant', () => {
    render(
      <DataTable
        aria-label="People"
        columns={columns}
        data={people}
        filterable
        defaultQuery={{ columnFilters: [{ id: 'joined', value: { from: new Date(2021, 0, 1) } }] }}
      />,
    )
    expect(names()).toEqual(['Can'])
  })

  it('options name a checklist apart from the export, and are counted on the client', async () => {
    render(<DataTable aria-label="People" columns={columns} data={people} filterable />)
    open('Status')
    await screen.findByRole('checkbox', { name: 'Active' })
    expect(screen.queryByText('Exported active')).toBeNull()
    expect(screen.getAllByRole('checkbox').map((box) => box.getAttribute('aria-checked'))).toEqual(['false', 'false'])
    expect(screen.getByRole('checkbox', { name: 'Active', description: '2' })).toBeTruthy()
    act(() => screen.getByRole('checkbox', { name: 'Passive' }).click())
    apply()
    expect(names()).toEqual(['Can'])
  })

  it('booleans without options get Yes and No', async () => {
    render(<DataTable aria-label="People" columns={columns} data={people} filterable />)
    open('Remote')
    expect(await screen.findByRole('checkbox', { name: 'Yes', description: '2' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'No', description: '1' })).toBeTruthy()
  })

  it('filter.variant "options" lists the column values with their counts', async () => {
    render(<DataTable aria-label="People" columns={columns} data={people} filterable />)
    open('Team')
    await screen.findByRole('checkbox', { name: 'Legal' })
    expect(screen.getByRole('checkbox', { name: 'Sales', description: '2' })).toBeTruthy()
    act(() => screen.getByRole('checkbox', { name: 'Sales' }).click())
    apply()
    expect(names()).toEqual(['Ada', 'Ece'])
  })

  it('text stays "contains"', async () => {
    render(<DataTable aria-label="People" columns={columns} data={people} filterable />)
    open('Name')
    expect(await screen.findByRole('textbox')).toBeTruthy()
  })

  it('on the server, a page filtered to nothing keeps its kind', async () => {
    const { rerender } = render(
      <DataTable aria-label="People" columns={columns} data={people} filterable server={{ rowCount: 3 }} />,
    )
    open('Salary')
    await screen.findByRole('spinbutton', { name: 'Min' })
    act(() => screen.getByRole('button', { name: 'Cancel' }).click())
    rerender(
      <DataTable aria-label="People" columns={columns} data={[]} filterable server={{ rowCount: 0 }} />,
    )
    open('Salary')
    expect(await screen.findByRole('spinbutton', { name: 'Min' })).toBeTruthy()
  })
})

describe('the default filterFn', () => {
  it('reads a bare ISO day as local, and lifts an empty range', () => {
    expect(toDate('2020-03-01')!.getDate()).toBe(1)
    const fn = createContainsFilterFn()
    expect(fn.autoRemove?.({ from: undefined, to: undefined } as never)).toBe(true)
    expect(fn.autoRemove?.({ min: undefined, max: undefined } as never)).toBe(true)
    expect(fn.autoRemove?.([] as never)).toBe(true)
    expect(fn.autoRemove?.({ min: 0 } as never)).toBe(false)
  })
})
