// Benchmark harness for DataTable, built in production mode (see bench/run.mjs).
// Each page load mounts one scenario; bench/run.mjs drives it through
// `window.bench` and reads the timings back.

import { Profiler, useImperativeHandle, useState, type Ref } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'
import './bench.css'
import { DataTable } from '../src/components/data-table/data-table'
import type { DataTableColumn } from '../src/components/data-table/features'

type Row = { id: string; name: string; dept: string; email: string; salary: number; start: Date; active: boolean; city: string }
type Wide = { id: string; values: number[] }

const names = ['Ayşe', 'Çağrı', 'Can', 'Şule', 'Zeynep', 'İlker', 'Öykü', 'Mert', 'Ümit', 'Gökhan', 'Deniz', 'Ece']
const depts = ['Finance', 'Human Resources', 'Engineering', 'Sales', 'Operations', 'Legal']
const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Eskişehir']

function rows(count: number, seed = 0): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `r${i}`,
    name: `${names[(i + seed) % names.length]} ${names[(i * 7) % names.length]}`,
    dept: depts[(i * 5) % depts.length]!,
    email: `user${i}@example.com`,
    salary: 40_000 + ((i * 7919 + seed) % 90_000),
    start: new Date(2015 + (i % 10), (i * 3) % 12, 1 + (i % 27)),
    active: i % 4 !== 3,
    city: cities[(i * 11) % cities.length]!,
  }))
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const day = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' })

const columns: Array<DataTableColumn<Row>> = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'dept', header: 'Department' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'salary', header: 'Salary', cell: (info) => money.format(info.getValue<number>()), meta: { align: 'end' } },
  { accessorKey: 'start', header: 'Start date', cell: (info) => day.format(info.getValue<Date>()) },
  { accessorKey: 'active', header: 'Status', cell: (info) => (info.getValue<boolean>() ? 'Active' : 'Passive') },
  { accessorKey: 'city', header: 'City' },
  { id: 'actions', header: 'Actions', size: 80, enableSorting: false, cell: () => <button type="button">Edit</button> },
]

const wideColumns: Array<DataTableColumn<Wide>> = Array.from({ length: 100 }, (_, c) => ({
  id: `c${c}`,
  header: `Column ${c}`,
  accessorFn: (row: Wide) => row.values[c],
}))
const wideRows: Wide[] = Array.from({ length: 1000 }, (_, r) => ({
  id: `w${r}`,
  values: Array.from({ length: 100 }, (_, c) => (r * 31 + c * 17) % 10_000),
}))

type Api = {
  setSorting: (sorting: SortingState) => void
  setFilters: (filters: ColumnFiltersState) => void
  refresh: () => void
}

const scenario = new URLSearchParams(location.search).get('s') ?? 'client10k'

function Harness({ api }: { api: Ref<Api> }) {
  const [data, setData] = useState(() => rows(scenario === 'small' ? 50 : 10_000))
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setFilters] = useState<ColumnFiltersState>([])
  useImperativeHandle(api, () => ({
    setSorting,
    setFilters,
    refresh: () => setData((current) => rows(current.length, 1)),
  }))

  if (scenario === 'wide') {
    return (
      <DataTable aria-label="Wide" columns={wideColumns} data={wideRows} getRowId={(row) => row.id}
        sortable resizable reorderable selectable height={600} />
    )
  }
  return (
    <DataTable
      aria-label="Employees"
      columns={columns}
      data={data}
      getRowId={(row) => row.id}
      sortable
      resizable
      reorderable
      hideable
      filterable
      selectable
      exportable
      sorting={sorting}
      onSortingChange={setSorting}
      columnFilters={columnFilters}
      onColumnFiltersChange={setFilters}
      height={scenario === 'small' ? undefined : 600}
    />
  )
}

// Commit timings from React's profiler (react-dom/profiling, aliased in the bench build).
let renderTime = 0
let commits = 0
const onRender = (_id: string, _phase: string, actualDuration: number) => {
  renderTime += actualDuration
  commits++
}

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
/** Until the work an action started has painted: two frames, and the effects between them. */
const settle = async () => {
  await frame()
  await frame()
}

const api: { current: Api | null } = { current: null }
const root = createRoot(document.getElementById('root')!)

type Result = { total: number; render: number; commits: number; longTasks: number; nodes: number }
const longTasks: number[] = []
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) longTasks.push(entry.duration)
}).observe({ type: 'longtask', buffered: false })

async function measure(action: () => void | Promise<void>): Promise<Result> {
  renderTime = 0
  commits = 0
  longTasks.length = 0
  const start = performance.now()
  await action()
  await settle()
  return {
    total: performance.now() - start,
    render: renderTime,
    commits,
    longTasks: longTasks.length,
    nodes: document.getElementsByTagName('*').length,
  }
}

const grid = () => document.querySelector<HTMLElement>('[role="grid"]')!
const key = (target: HTMLElement, init: KeyboardEventInit) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }))
const scroller = () => grid().querySelectorAll<HTMLElement>(':scope > [role="rowgroup"]')[1]!

const actions: Record<string, () => void | Promise<void>> = {
  mount: () =>
    flushSync(() =>
      root.render(
        <Profiler id="grid" onRender={onRender}>
          <Harness api={(value) => { api.current = value }} />
        </Profiler>,
      ),
    ),
  sort: () => flushSync(() => api.current!.setSorting([{ id: 'name', desc: false }])),
  sortNumber: () => flushSync(() => api.current!.setSorting([{ id: 'salary', desc: true }])),
  filter: () => flushSync(() => api.current!.setFilters([{ id: 'name', value: 'ay' }])),
  clearFilter: () => flushSync(() => api.current!.setFilters([])),
  refresh: () => flushSync(() => api.current!.refresh()),
  selectAll: () => { key(grid(), { key: 'a', ctrlKey: true }) },
  toggleRow: () => { grid().querySelector<HTMLElement>('[role="row"][aria-rowindex="3"] input[type="checkbox"], [role="row"][aria-rowindex="3"] button[role="checkbox"]')?.click() },
  resize: async () => {
    const handle = grid().querySelector<HTMLElement>('[role="separator"]')!
    for (let i = 0; i < 10; i++) {
      key(handle, { key: 'ArrowRight' })
      await frame()
    }
  },
  scroll: async () => {
    const body = scroller()
    for (let i = 1; i <= 20; i++) {
      body.scrollTop = i * 400
      body.dispatchEvent(new Event('scroll'))
      await frame()
    }
  },
  scrollX: async () => {
    const body = scroller()
    for (let i = 1; i <= 20; i++) {
      body.scrollLeft = i * 300
      body.dispatchEvent(new Event('scroll'))
      await frame()
    }
  },
}

declare global {
  interface Window {
    bench: { scenario: string; run: (action: string) => Promise<Result> }
  }
}
window.bench = { scenario, run: (action) => measure(actions[action]!) }
