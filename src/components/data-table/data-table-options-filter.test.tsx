import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { DataTable } from './data-table'
import type { DataTableColumn } from './features'
import type { DataTableQuery } from './state'

type Person = { id: string; name: string; status: 'active' | 'passive' | 'leave' }

const people: Person[] = [
  { id: '1', name: 'Ada', status: 'active' },
  { id: '2', name: 'Can', status: 'passive' },
  { id: '3', name: 'Ece', status: 'leave' },
]

const columns: Array<DataTableColumn<Person>> = [
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: {
      filter: {
        options: [
          { value: 'active', label: 'Active', count: 1 },
          { value: 'passive', label: 'Passive', count: 1 },
          { value: 'leave', label: 'On leave', count: 1 },
        ],
      },
    },
  },
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
    .map((row) => row.querySelector('[role=gridcell]')?.textContent)
}
const box = (name: string) => screen.getByRole('checkbox', { name })

describe('options filter (meta.filter.options)', () => {
  it('ticks nothing with no filter, shows the ticked values, and lifts itself when unticked again', async () => {
    render(<DataTable aria-label="People" columns={columns} data={people} filterable />)
    act(() => screen.getByRole('button', { name: 'Filter Status' }).click())
    await screen.findByRole('checkbox', { name: 'Active' })
    expect(box('Active').getAttribute('aria-checked')).toBe('false')
    // Three options: no "Select all", no search.
    expect(screen.queryByRole('checkbox', { name: 'Select all' })).toBeNull()
    expect(screen.queryByRole('searchbox')).toBeNull()
    // Counts sit beside their option, as its description.
    expect(screen.getByRole('checkbox', { name: 'Passive', description: '1' })).toBeTruthy()

    act(() => box('Active').click())
    act(() => screen.getByRole('button', { name: 'Apply' }).click())
    expect(names()).toEqual(['Ada'])

    act(() => screen.getByRole('button', { name: 'Filter Status' }).click())
    await screen.findByRole('checkbox', { name: 'Active' })
    expect(box('Active').getAttribute('aria-checked')).toBe('true')
    act(() => box('Active').click())
    act(() => screen.getByRole('button', { name: 'Apply' }).click())
    expect(names()).toEqual(['Ada', 'Can', 'Ece'])
    expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull()
  })

  it('hands the server the ticked values', async () => {
    const onQueryChange = vi.fn<(query: DataTableQuery) => void>()
    render(
      <DataTable
        aria-label="People"
        columns={columns}
        data={people}
        filterable
        getRowId={(row) => row.id}
        server={{ rowCount: 3 }}
        query={{ sorting: [], columnFilters: [] }}
        onQueryChange={onQueryChange}
      />,
    )
    act(() => screen.getByRole('button', { name: 'Filter Status' }).click())
    await screen.findByRole('checkbox', { name: 'Active' })
    act(() => box('Active').click())
    act(() => screen.getByRole('button', { name: 'Apply' }).click())
    expect(onQueryChange.mock.lastCall![0].columnFilters).toEqual([{ id: 'status', value: ['active'] }])
  })

  it('searches from six options', async () => {
    const many = ['Finance', 'Legal', 'Sales', 'Operations', 'Engineering', 'Human Resources']
    render(
      <DataTable
        aria-label="People"
        columns={[
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'status', header: 'Status', meta: { filter: { options: many.map((value) => ({ value, label: value })) } } },
        ]}
        data={people}
        filterable
      />,
    )
    act(() => screen.getByRole('button', { name: 'Filter Status' }).click())
    const search = await screen.findByRole('searchbox')
    act(() => {
      fireEvent.change(search, { target: { value: 'eng' } })
    })
    expect(screen.getAllByRole('checkbox').map((item) => item.getAttribute('aria-labelledby') && item.textContent)).toHaveLength(1)
    expect(screen.getByRole('checkbox', { name: 'Engineering' })).toBeTruthy()
  })
})
