import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '../badge/badge'
import { Button } from '../button/button'
import { DownloadIcon } from '../../lib/icons'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './table'
import { TableCheckbox } from './table-checkbox'
import { TableColumnFilter } from './table-column-filter'
import { TablePagination, type TablePageSize } from './table-pagination'
import { exportTable, type TableExportColumn } from './export'

const meta = {
  title: 'Components/Table',
  component: Table,
  parameters: { a11y: { test: 'error' } },
} satisfies Meta<typeof Table>
export default meta
type Story = StoryObj<typeof meta>

const invoices = [
  { id: 'INV001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
  { id: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
  { id: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
]

export const Default: Story = {
  render: () => (
    <Table className="w-3xl">
      <TableCaption>A list of recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((i) => (
          <TableRow key={i.id}>
            <TableCell className="font-medium">{i.id}</TableCell>
            <TableCell>
              <Badge tone={i.status === 'Paid' ? 'success' : i.status === 'Pending' ? 'warning' : 'danger'}>
                {i.status}
              </Badge>
            </TableCell>
            <TableCell>{i.method}</TableCell>
            <TableCell className="text-right">{i.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

// ── The Table-level parts, on the plain Table ───────────────────────────────
// TableCheckbox, TablePagination, TableColumnFilter and exportTable need no
// data library: these stories wire them to React state by hand. DataTable
// builds on the same parts.

type Person = { id: string; name: string; department: string; city: string; salary: number }

const names = ['Ayşe Yılmaz', 'Çağrı Kaya', 'Can Demir', 'Şule Şahin', 'Zeynep Çelik', 'İlker Öztürk', 'Öykü Aydın', 'Mert Arslan']
const departments = ['Finance', 'Human Resources', 'Engineering', 'Sales', 'Legal']
const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa']

const people: Person[] = Array.from({ length: 137 }, (_, i) => ({
  id: `p${i + 1}`,
  name: names[i % names.length]!,
  department: departments[(i * 3) % departments.length]!,
  city: cities[(i * 5) % cities.length]!,
  salary: 40_000 + ((i * 7919) % 90_000),
}))

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function toggleIn(set: ReadonlySet<string>, id: string): ReadonlySet<string> {
  const next = new Set(set)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

/** Row selection: the header box is checked when all are, mixed when some are. */
function SelectionDemo({ appearance }: { appearance: 'always' | 'hover' }) {
  const rows = people.slice(0, 6)
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(['p2']))
  const all = selected.size === rows.length
  const some = selected.size > 0 && !all

  return (
    <Table className="w-3xl">
      <TableHeader>
        <TableRow className="group/header">
          <TableHead className="w-10">
            <TableCheckbox
              appearance={appearance}
              revealed={selected.size > 0}
              checked={all}
              indeterminate={some}
              aria-label="Select all rows"
              onCheckedChange={() => setSelected(all ? new Set() : new Set(rows.map((row) => row.id)))}
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>City</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id} className="group/row" data-state={selected.has(row.id) ? 'selected' : undefined}>
            <TableCell>
              <TableCheckbox
                appearance={appearance}
                revealed={selected.size > 0}
                checked={selected.has(row.id)}
                aria-label={`Select ${row.name}`}
                onCheckedChange={() => setSelected((current) => toggleIn(current, row.id))}
              />
            </TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.department}</TableCell>
            <TableCell>{row.city}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/** `TableCheckbox` with `appearance="always"`. `data-state="selected"` on a row tints it. */
export const Selection: Story = { render: () => <SelectionDemo appearance="always" /> }

/**
 * `appearance="hover"`: subtle selection, for dense lists. A box shows when its row
 * (`group/row`) is hovered, and every box once anything is selected (`revealed`).
 */
export const SelectionOnHover: Story = { render: () => <SelectionDemo appearance="hover" /> }

/** The header box's looks: none, some (mixed), this page only (`scope="visible"`), all. */
export const CheckboxStates: Story = {
  render: () => (
    <div className="flex items-center gap-6 text-sm">
      {[
        { label: 'None', props: { checked: false } },
        { label: 'Some (indeterminate)', props: { indeterminate: true } },
        { label: 'This page (scope="visible")', props: { checked: true, scope: 'visible' as const } },
        { label: 'All', props: { checked: true } },
      ].map(({ label, props }) => (
        <span key={label} className="flex items-center gap-2">
          <TableCheckbox aria-label={label} {...props} />
          {label}
        </span>
      ))}
    </div>
  ),
}

function PaginationDemo() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<TablePageSize>(10)
  const size = pageSize === 'all' ? people.length : pageSize
  const rows = people.slice((page - 1) * size, page * size)

  return (
    <div className="grid w-3xl gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="text-right">Salary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.department}</TableCell>
              <TableCell className="text-right tabular-nums">{money.format(row.salary)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        page={page}
        pageSize={pageSize}
        total={people.length}
        onPageChange={setPage}
        onPageSizeChange={(next) => {
          setPageSize(next)
          setPage(1)
        }}
      />
    </div>
  )
}

/**
 * `TablePagination`: rows per page (with All), the range, first / previous /
 * next / last. Controlled — here it slices an array; on a server-paged list it
 * would drive the URL.
 */
export const Pagination: Story = { render: () => <PaginationDemo /> }

type FilterKey = 'name' | 'department' | 'city'

function FilterDemo() {
  const [filters, setFilters] = useState<Record<FilterKey, string>>({ name: '', department: '', city: '' })
  const rows = useMemo(
    () =>
      people
        .filter((row) =>
          (['name', 'department', 'city'] as const).every((key) =>
            row[key].toLocaleLowerCase('tr').includes(filters[key].toLocaleLowerCase('tr')),
          ),
        )
        .slice(0, 10),
    [filters],
  )

  const head = (key: FilterKey, label: string) => (
    <TableHead className="group/header">
      <span className="inline-flex items-center gap-1">
        {label}
        <TableColumnFilter
          column={label}
          value={filters[key]}
          onApply={(value) => setFilters((current) => ({ ...current, [key]: value }))}
        />
      </span>
    </TableHead>
  )

  return (
    <Table className="w-3xl">
      <TableHeader>
        <TableRow>
          {head('name', 'Name')}
          {head('department', 'Department')}
          {head('city', 'City')}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.department}</TableCell>
            <TableCell>{row.city}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/**
 * `TableColumnFilter` in a header (`group/header`): the funnel shows on hover
 * and stays, filled, while a filter is applied. Try "i" on Name.
 */
export const ColumnFilter: Story = { render: () => <FilterDemo /> }

const exportColumns: Array<TableExportColumn<Person>> = [
  { label: 'Name', value: (row) => row.name, width: 180 },
  { label: 'Department', value: (row) => row.department, width: 160 },
  { label: 'City', value: (row) => row.city, width: 120 },
  { label: 'Salary', value: (row) => row.salary, width: 120 },
]

const download = (format: 'csv' | 'xlsx', rows: Person[]) =>
  void exportTable({ format, columns: exportColumns, rows, fileName: 'people' })

/**
 * `exportTable` writes any rows and columns to CSV (Turkish-Excel friendly) or a
 * real .xlsx — numbers stay numbers. Here: all 137 people.
 */
export const Export: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={() => download('csv', people)}>
        <DownloadIcon />
        CSV
      </Button>
      <Button variant="secondary" onClick={() => download('xlsx', people)}>
        <DownloadIcon />
        Excel
      </Button>
    </div>
  ),
}

function ComposedDemo() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<TablePageSize>(10)
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [department, setDepartment] = useState('')

  const filtered = people.filter((row) =>
    row.department.toLocaleLowerCase('tr').includes(department.toLocaleLowerCase('tr')),
  )
  const size = pageSize === 'all' ? Math.max(filtered.length, 1) : pageSize
  const rows = filtered.slice((page - 1) * size, page * size)
  const pageAll = rows.length > 0 && rows.every((row) => selected.has(row.id))
  const pageSome = rows.some((row) => selected.has(row.id)) && !pageAll

  return (
    <div className="grid w-3xl gap-3">
      <div className="flex min-h-8 items-center gap-2">
        {selected.size > 0 && <span className="text-sm text-muted-foreground">{selected.size} selected</span>}
        <Button
          className="ml-auto"
          variant="secondary"
          size="sm"
          onClick={() => download('xlsx', selected.size ? filtered.filter((row) => selected.has(row.id)) : filtered)}
        >
          <DownloadIcon />
          Export
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="group/header">
            <TableHead className="w-10">
              <TableCheckbox
                appearance="hover"
                revealed={selected.size > 0}
                checked={pageAll}
                indeterminate={pageSome}
                aria-label="Select this page"
                onCheckedChange={() =>
                  setSelected((current) => {
                    const next = new Set(current)
                    for (const row of rows) {
                      if (pageAll) next.delete(row.id)
                      else next.add(row.id)
                    }
                    return next
                  })
                }
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>
              <span className="inline-flex items-center gap-1">
                Department
                <TableColumnFilter
                  column="Department"
                  value={department}
                  onApply={(value) => {
                    setDepartment(value)
                    setPage(1)
                  }}
                />
              </span>
            </TableHead>
            <TableHead className="text-right">Salary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="group/row" data-state={selected.has(row.id) ? 'selected' : undefined}>
              <TableCell>
                <TableCheckbox
                  appearance="hover"
                  revealed={selected.size > 0}
                  checked={selected.has(row.id)}
                  aria-label={`Select ${row.name}`}
                  onCheckedChange={() => setSelected((current) => toggleIn(current, row.id))}
                />
              </TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.department}</TableCell>
              <TableCell className="text-right tabular-nums">{money.format(row.salary)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        page={page}
        pageSize={pageSize}
        total={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(next) => {
          setPageSize(next)
          setPage(1)
        }}
      />
    </div>
  )
}

/**
 * All the parts together on a plain Table: hover selection, a column filter,
 * pagination and export. For sorting, resizing, reordering, column selection
 * and virtualization, use DataTable.
 */
export const Composed: Story = { render: () => <ComposedDemo /> }
