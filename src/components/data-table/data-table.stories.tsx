import { useEffect, useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DataTable, type DataTableProps } from './data-table'
import type { DataTableColumn, DataTableFilterControlProps } from './features'
import type { DataTableHandle, DataTablePagination, DataTableRowSelection } from './state'
import { exportTable } from '../table/export'
import { Badge } from '../badge/badge'
import { Button } from '../button/button'
import { Input } from '../input/input'
import { EllipsisIcon } from '../../lib/icons'

type Employee = {
  id: string
  name: string
  department: string
  email: string | null
  salary: number
  startDate: Date
  active: boolean
}

const firstNames = ['Ayşe', 'Çağrı', 'Can', 'Şule', 'Zeynep', 'İlker', 'Öykü', 'Mert', 'Ümit', 'Gökhan', 'Deniz', 'Ece']
const lastNames = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Öztürk', 'Aydın', 'Arslan', 'Doğan', 'Kılıç']
const departments = ['Finance', 'Human Resources', 'Engineering', 'Sales', 'Operations', 'Legal']

function makeEmployees(count: number): Employee[] {
  return Array.from({ length: count }, (_, i) => {
    const first = firstNames[i % firstNames.length]!
    const last = lastNames[(i * 7) % lastNames.length]!
    return {
      id: `emp_${i + 1}`,
      name: `${first} ${last}`,
      department: departments[(i * 5) % departments.length]!,
      email: i % 9 === 4 ? null : `${first}.${last}${i}@example.com`.toLowerCase(),
      salary: 42_000 + ((i * 7919) % 90_000),
      startDate: new Date(2015 + (i % 10), (i * 3) % 12, 1 + (i % 27)),
      active: i % 4 !== 3,
    }
  })
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const day = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' })

const columns: Array<DataTableColumn<Employee>> = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'email', header: 'Email', cell: (info) => info.getValue<string | null>() ?? '—' },
  {
    accessorKey: 'salary',
    header: 'Salary',
    cell: (info) => money.format(info.getValue<number>()),
    meta: { align: 'end' },
  },
  { accessorKey: 'startDate', header: 'Start date', cell: (info) => day.format(info.getValue<Date>()) },
  {
    accessorKey: 'active',
    header: 'Status',
    cell: (info) =>
      info.getValue<boolean>() ? <Badge tone="success">Active</Badge> : <Badge>Passive</Badge>,
    meta: { exportValue: (row: Employee) => (row.active ? 'Active' : 'Passive') },
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: () => (
      <Button variant="ghost" size="icon" aria-label="Actions">
        <EllipsisIcon />
      </Button>
    ),
    size: 56,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    meta: { label: 'Actions', reorderable: false },
  },
]

const twenty = makeEmployees(20)

// Typed on the props rather than `typeof DataTable`: the generic would
// otherwise widen to RowData and reject Employee columns.
const meta: Meta<DataTableProps<Employee>> = {
  title: 'Components/DataTable',
  component: DataTable,
  args: { 'aria-label': 'Employees', columns, data: twenty, getRowId: (row) => row.id, className: 'w-4xl max-w-full' },
  parameters: {
    // Show each story's own code. The default writes the args out as JSX, which
    // would print every row: 10,000 of them freeze the docs page's highlighter.
    docs: { source: { type: 'code' } },
  },
}
export default meta
type Story = StoryObj<DataTableProps<Employee>>

/** No flags: a plain read-only grid, columns fitted to their content. */
export const Basic: Story = {}

/** Click a header to sort; Shift+click for a second key. Blanks (Email) stay last both ways. */
export const Sortable: Story = { args: { sortable: true } }

/** Drag a column edge to resize. Double-click it to fit the column to its content, as in Excel. */
export const Resizable: Story = { args: { resizable: true } }

/** Drag a header sideways to move its column. Actions stays put (`meta.reorderable: false`). */
export const Reorderable: Story = { args: { reorderable: true } }

/** The Columns menu shows and hides columns; Reset layout undoes everything. */
export const Hideable: Story = { args: { hideable: true } }

/** Every interaction at once. Each header also has a menu with the keyboard equivalents. */
export const AllFeatures: Story = {
  args: { sortable: true, resizable: true, reorderable: true, hideable: true },
}

/** 10,000 rows through react-window: only the visible ones are in the DOM. */
export const Virtualized10k: Story = {
  args: {
    data: makeEmployees(10_000),
    height: 480,
    sortable: true,
    resizable: true,
    reorderable: true,
    hideable: true,
  },
}

/** `size="sm"`: 32px rows for dense screens. */
export const Small: Story = { args: { size: 'sm', sortable: true, resizable: true } }

/**
 * The pagination bar: rows per page (with All), the visible range, and
 * first / previous / next / last.
 */
export const Paginated: Story = {
  args: { data: makeEmployees(1374), pageSize: 10, sortable: true },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }))
    await expect(canvas.getByText('11–20 of 1,374')).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'Last page' }))
    await expect(canvas.getByText('1,371–1,374 of 1,374')).toBeInTheDocument()
  },
}

/**
 * Checkboxes always visible. The header box selects in two steps: this page
 * first (an outlined check), then all 57 rows (filled). Shift+click selects a
 * range.
 */
export const Selection: Story = {
  args: { selectable: true, pageSize: 10, data: makeEmployees(57) },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const header = () => canvas.getAllByRole('checkbox')[0]!
    await userEvent.click(header())
    await expect(canvas.getByText('10 rows selected')).toBeInTheDocument()
    await userEvent.click(header())
    await expect(canvas.getByText('57 rows selected')).toBeInTheDocument()
    await userEvent.click(header())
    await expect(canvas.queryByText(/rows selected/)).not.toBeInTheDocument()
  },
}

/** Subtle selection, for dense lists: a row's box shows on hover, and all of them once anything is selected. */
export const SelectionHover: Story = { args: { selectable: 'hover', pageSize: 10, data: makeEmployees(57) } }

/**
 * Excel's column selection, from the thin strip above the headers (a click on
 * a name still sorts). The first click covers this page, the second every row,
 * the third clears; Ctrl/⌘ adds a column, Shift a range, Escape clears.
 * Export writes the selected columns of the selected rows — or of the rows the
 * column selection covers.
 */
export const ColumnSelectionExport: Story = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const strip = canvas.getByRole('button', { name: 'Select column Salary', hidden: true })
    await userEvent.click(strip)
    await expect(canvas.getByText('1 column selected · this page (25 rows)')).toBeInTheDocument()
    await userEvent.click(strip)
    await expect(canvas.getByText('1 column selected · all 300 rows')).toBeInTheDocument()
  },
  args: {
    selectableColumns: true,
    selectable: 'hover',
    exportable: { fileName: 'employees' },
    sortable: true,
    pageSize: 25,
    data: makeEmployees(300),
  },
}

/** A "contains" filter per column, behind the funnel that shows on header hover. */
export const Filterable: Story = {
  args: { filterable: true, sortable: true, pageSize: 10, data: makeEmployees(300) },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Filter Department' }))
    const input = await within(document.body).findByRole('textbox')
    await userEvent.type(input, 'eng{Enter}')
    await waitFor(() => expect(canvas.getByText('1–10 of 50')).toBeInTheDocument())
  },
}

/**
 * 10,000 rows with everything on. Pick All in the pagination bar: past 100 rows
 * the grid virtualizes by itself. Select all, select columns, filter, export.
 */
export const TenThousandRows: Story = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const rowsInDom = () => canvasElement.querySelectorAll('[role="row"][aria-rowindex]').length
    await expect(canvas.getByText('1–10,000 of 10,000')).toBeInTheDocument()
    expect(rowsInDom()).toBeLessThan(60)
    // Sort, filter and select everything while virtualized.
    await userEvent.click(within(canvas.getByRole('columnheader', { name: /^Salary/ })).getAllByRole('button', { hidden: true })[0]!)
    await expect(canvas.getByRole('columnheader', { name: /^Salary/ })).toHaveAttribute('aria-sort', 'ascending')
    await userEvent.click(canvas.getByRole('button', { name: 'Filter Department', hidden: true }))
    await userEvent.type(await within(document.body).findByRole('textbox'), 'sales{Enter}')
    await waitFor(() => expect(canvas.getByText(/of 1,667$/)).toBeInTheDocument())
    await userEvent.click(canvas.getAllByRole('checkbox', { hidden: true })[0]!)
    await expect(canvas.getByText('1,667 rows selected')).toBeInTheDocument()
    expect(rowsInDom()).toBeLessThan(60)
  },
  args: {
    data: makeEmployees(10_000),
    pageSize: 'all',
    selectable: 'hover',
    selectableColumns: true,
    filterable: true,
    exportable: { fileName: 'employees' },
    sortable: true,
    resizable: true,
    reorderable: true,
    hideable: true,
  },
}

export const Empty: Story = { args: { data: [], sortable: true, emptyMessage: 'No employees yet.' } }

/** Widths, order and visibility survive a reload (`storageKey`). */
export const Persisted: Story = {
  args: { storageKey: 'storybook-employees', sortable: true, resizable: true, reorderable: true, hideable: true },
}

// ── A 100-column personnel file ─────────────────────────────────────────────

type Kind = 'text' | 'date' | 'number' | 'money' | 'bool' | 'digits' | 'phone' | 'email' | 'iban'
type Field = { label: string; kind: Kind; pool?: readonly string[]; range?: readonly [number, number] }
type PersonnelRecord = { id: string } & Record<string, string | number | boolean | Date | null>

const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Konya', 'Eskişehir']
const people = firstNames.flatMap((first) => lastNames.slice(0, 3).map((last) => `${first} ${last}`))

const field = (label: string, kind: Kind, extra: Omit<Field, 'label' | 'kind'> = {}): Field => ({ label, kind, ...extra })
const text = (label: string, pool: readonly string[]) => field(label, 'text', { pool })
const num = (label: string, min: number, max: number) => field(label, 'number', { range: [min, max] })
const flag = (label: string) => field(label, 'bool')
const amount = (label: string, min: number, max: number) => field(label, 'money', { range: [min, max] })

/** The columns of an HR personnel file, grouped as they would be in the database. */
const personnelFields: Field[] = [
  // Personal
  text('First name', firstNames),
  text('Last name', lastNames),
  field('National ID', 'digits', { range: [11, 11] }),
  field('Date of birth', 'date', { range: [1965, 2004] }),
  text('Place of birth', cities),
  text('Gender', ['Female', 'Male']),
  text('Marital status', ['Single', 'Married', 'Divorced']),
  text('Nationality', ['Turkish', 'Turkish', 'Turkish', 'German', 'Azerbaijani']),
  text('Blood type', ['A Rh+', '0 Rh+', 'B Rh+', 'AB Rh+', 'A Rh-', '0 Rh-']),
  text("Mother's name", firstNames),
  text("Father's name", firstNames),
  text('Military status', ['Completed', 'Exempt', 'Deferred', 'Not applicable']),
  flag('Disability'),
  text('Driving licence', ['B', 'B, C', 'A2, B', 'None']),
  // Contact
  field('Mobile phone', 'phone'),
  field('Home phone', 'phone'),
  field('Work email', 'email'),
  field('Personal email', 'email'),
  text('Address', ['Atatürk Cd. No:12', 'Cumhuriyet Mh. 4. Sk. No:7', 'İnönü Blv. No:88/3', 'Bağdat Cd. No:241']),
  text('District', ['Kadıköy', 'Çankaya', 'Karşıyaka', 'Nilüfer', 'Muratpaşa', 'Selçuklu']),
  text('City', cities),
  field('Postal code', 'digits', { range: [5, 5] }),
  text('Country', ['Türkiye']),
  text('Emergency contact', people),
  field('Emergency phone', 'phone'),
  text('Emergency relation', ['Spouse', 'Parent', 'Sibling', 'Friend']),
  // Employment
  field('Personnel no', 'digits', { range: [6, 6] }),
  text('Department', departments),
  text('Position', ['Accountant', 'HR Specialist', 'Developer', 'Sales Rep', 'Operator', 'Lawyer']),
  text('Title', ['Specialist', 'Senior Specialist', 'Team Lead', 'Manager', 'Director']),
  text('Manager', people),
  text('Cost center', ['CC-100', 'CC-210', 'CC-305', 'CC-410', 'CC-520']),
  text('Location', cities),
  text('Work site', ['Head office', 'Plant 1', 'Plant 2', 'Warehouse', 'Remote']),
  text('Employment type', ['Full-time', 'Full-time', 'Part-time', 'Contract', 'Intern']),
  field('Start date', 'date', { range: [2008, 2025] }),
  field('Seniority date', 'date', { range: [2005, 2025] }),
  field('Probation end', 'date', { range: [2008, 2026] }),
  field('Contract end', 'date', { range: [2026, 2030] }),
  text('Shift', ['Day', 'Night', 'Rotating']),
  num('Remote days / week', 0, 3),
  flag('Active'),
  // Payroll
  amount('Gross salary', 35_000, 220_000),
  amount('Net salary', 28_000, 160_000),
  text('Currency', ['TRY']),
  text('Pay grade', ['G1', 'G2', 'G3', 'G4', 'G5', 'G6']),
  text('Bank', ['Ziraat', 'İş Bankası', 'Garanti BBVA', 'Akbank', 'Yapı Kredi', 'Halkbank']),
  field('IBAN', 'iban'),
  field('SGK no', 'digits', { range: [13, 13] }),
  text('Tax office', cities.map((city) => `${city} VD`)),
  field('Tax no', 'digits', { range: [10, 10] }),
  amount('Meal allowance', 3_000, 7_500),
  amount('Transport allowance', 1_500, 4_000),
  amount('Last bonus', 0, 90_000),
  num('Overtime hours', 0, 40),
  flag('Private pension'),
  flag('Health insurance'),
  flag('Union member'),
  flag('Minimum wage exemption'),
  // Education
  text('Education', ['High school', 'Associate', 'Bachelor', 'Bachelor', 'Master', 'PhD']),
  text('School', ['İTÜ', 'ODTÜ', 'Boğaziçi', 'Hacettepe', 'Ege Üniversitesi', 'Anadolu Üniversitesi']),
  text('Field of study', ['Computer Eng.', 'Business', 'Economics', 'Law', 'Mechanical Eng.', 'Psychology']),
  field('Graduation date', 'date', { range: [1988, 2024] }),
  text('Languages', ['English', 'English, German', 'English, Arabic', 'None']),
  text('English level', ['A2', 'B1', 'B2', 'C1', 'C2']),
  num('Certificates', 0, 9),
  // Family
  text('Spouse name', people),
  flag('Spouse employed'),
  num('Children', 0, 4),
  num('Dependants', 0, 5),
  amount('Child benefit', 0, 2_400),
  flag('Spouse insured'),
  // Leave
  num('Leave entitlement', 14, 26),
  num('Leave used', 0, 20),
  num('Leave remaining', 0, 26),
  num('Sick days', 0, 12),
  num('Unpaid leave days', 0, 10),
  field('Last leave start', 'date', { range: [2024, 2025] }),
  field('Last leave end', 'date', { range: [2024, 2025] }),
  text('Leave approver', people),
  // Documents
  flag('ID copy'),
  flag('Diploma'),
  flag('Criminal record'),
  flag('Health report'),
  flag('Residence certificate'),
  flag('Photo'),
  flag('Contract signed'),
  flag('KVKK consent'),
  // Assets, training, performance
  text('Laptop', ['ThinkPad T14', 'MacBook Air', 'Dell Latitude', 'None']),
  flag('Company phone'),
  field('Access card no', 'digits', { range: [8, 8] }),
  flag('Parking spot'),
  flag('Shuttle user'),
  num('Trainings completed', 0, 24),
  field('Last training', 'date', { range: [2023, 2025] }),
  num('Performance score', 1, 5),
  field('Last review', 'date', { range: [2024, 2025] }),
  text('Potential', ['High', 'Medium', 'Low']),
  flag('Promotion eligible'),
  text('Notes', ['—', 'Relocation requested', 'Mentor for new hires', 'On parental leave in Q3']),
]

/** Deterministic pseudo-random number in [0, 1) for a row/column pair. */
function noise(row: number, column: number): number {
  const x = Math.sin(row * 12.9898 + column * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function digits(row: number, column: number, length: number): string {
  let out = ''
  for (let i = 0; i < length; i++) out += Math.floor(noise(row + i * 31, column + i) * 10)
  return out
}

function personnelValue(f: Field, row: number, column: number): PersonnelRecord[string] {
  const r = noise(row, column)
  // A sprinkle of blanks, as in any real personnel file.
  if (f.kind !== 'bool' && r > 0.96) return null
  switch (f.kind) {
    case 'text':
      return f.pool![Math.floor(r * f.pool!.length)]!
    case 'number':
      return Math.round(f.range![0] + r * (f.range![1] - f.range![0]))
    case 'money':
      return Math.round((f.range![0] + r * (f.range![1] - f.range![0])) / 50) * 50
    case 'bool':
      return r > 0.3
    case 'date': {
      const [from, to] = f.range!
      return new Date(from + Math.floor(r * (to - from + 1)), Math.floor(noise(row, column + 1) * 12), 1 + Math.floor(noise(row + 1, column) * 28))
    }
    case 'digits':
      return digits(row, column, f.range![0])
    case 'phone':
      return `+90 5${digits(row, column, 2)} ${digits(row, column + 7, 3)} ${digits(row, column + 9, 2)} ${digits(row, column + 11, 2)}`
    case 'email':
      return `user${row + 1}.${column}@example.com`
    case 'iban':
      return `TR${digits(row, column, 2)} 0006 ${digits(row, column + 3, 4)} ${digits(row, column + 5, 4)} ${digits(row, column + 7, 4)} ${digits(row, column + 9, 4)} ${digits(row, column + 11, 2)}`
  }
}

const fieldKey = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
const lira = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })

const personnelColumns: Array<DataTableColumn<PersonnelRecord>> = personnelFields.map((f) => {
  const key = fieldKey(f.label)
  return {
    id: key,
    accessorFn: (row) => row[key],
    header: f.label,
    meta: { align: f.kind === 'number' || f.kind === 'money' ? 'end' : 'start' },
    cell: (info) => {
      const value = info.getValue<PersonnelRecord[string]>()
      if (value === null) return '—'
      if (value instanceof Date) return day.format(value)
      if (typeof value === 'boolean') return value ? 'Yes' : 'No'
      if (f.kind === 'money') return lira.format(value as number)
      return String(value)
    },
  }
})

const personnelRows: PersonnelRecord[] = Array.from({ length: 300 }, (_, row) => {
  const record: PersonnelRecord = { id: `p_${row + 1}` }
  personnelFields.forEach((f, column) => {
    record[fieldKey(f.label)] = personnelValue(f, row, column)
  })
  return record
})

/**
 * A personnel file with 100 columns and 300 rows. The grid grows sideways and
 * scrolls horizontally; rows are virtualized. Every column starts fitted to its
 * content. Try the Columns menu, Shift+scroll, a double-click on an edge.
 */
export const HundredColumns: Story = {
  render: () => (
    <DataTable aria-label="Records"
      columns={personnelColumns}
      data={personnelRows}
      getRowId={(row) => row.id}
      height={560}
      sortable
      resizable
      reorderable
      hideable
      className="w-full"
    />
  ),
  parameters: { layout: 'padded' },
}

// ── State, server data, custom export, keyboard ─────────────────────────────

/**
 * Keyboard: Tab into the grid (one tab stop), then arrows, Home/End,
 * Ctrl+Home/End, PageUp/PageDown. On a header Enter sorts, Alt+↓ opens its
 * menu, Ctrl+Space selects the column; on a row Shift+Space selects it; F2
 * works inside a cell and Escape comes back.
 */
export const Keyboard: Story = {
  args: { sortable: true, selectable: true, selectableColumns: true, hideable: true, pageSize: 10, data: makeEmployees(57) },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const grid = canvas.getByRole('grid')
    grid.focus()
    const active = () => document.getElementById(grid.getAttribute('aria-activedescendant')!)
    await userEvent.keyboard('{ArrowRight}{ArrowDown}')
    await expect(active()).toHaveTextContent('Ayşe Yılmaz')
    await userEvent.keyboard('{Shift>} {/Shift}')
    await expect(canvas.getByText('1 row selected')).toBeInTheDocument()
    await userEvent.keyboard('{Control>}{Home}{/Control}{ArrowRight}{Enter}')
    await expect(canvas.getByRole('columnheader', { name: /^Name/ })).toHaveAttribute('aria-sort', 'ascending')
  },
}

type Query = { sorting: SortingState; columnFilters: ColumnFiltersState; pagination: DataTablePagination }

/** A pretend backend: filters (contains), sorts and pages 2,000 employees. */
function serverQuery(all: Employee[], { sorting, columnFilters, pagination }: Query) {
  let rows = all.filter((row) =>
    columnFilters.every(({ id, value }) =>
      String(row[id as keyof Employee] ?? '').toLocaleLowerCase('tr').includes(String(value).toLocaleLowerCase('tr')),
    ),
  )
  const [sort] = sorting
  if (sort) {
    const key = sort.id as keyof Employee
    rows = [...rows].sort((a, b) => {
      const order = String(a[key] ?? '').localeCompare(String(b[key] ?? ''), 'tr', { numeric: true })
      return sort.desc ? -order : order
    })
  }
  const size = pagination.pageSize === 'all' ? rows.length : pagination.pageSize
  const start = pagination.pageIndex * size
  return { rows: rows.slice(start, start + size), total: rows.length, all: rows }
}

function ServerSideDemo() {
  const everyone = useMemo(() => makeEmployees(2_000), [])
  const [query, setQuery] = useState<Query>({ sorting: [], columnFilters: [], pagination: { pageIndex: 0, pageSize: 25 } })
  const [result, setResult] = useState<{ key: string; rows: Employee[]; total: number }>({ key: '', rows: [], total: 0 })
  const ref = useRef<DataTableHandle<Employee>>(null)
  const key = JSON.stringify(query)

  // Each change is a request; the grid shows `loading` until its answer arrives.
  useEffect(() => {
    const timer = setTimeout(() => {
      const { rows, total } = serverQuery(everyone, query)
      setResult({ key, rows, total })
    }, 300)
    return () => clearTimeout(timer)
  }, [everyone, query, key])

  return (
    <DataTable aria-label="Records"
      ref={ref}
      className="w-4xl max-w-full"
      columns={columns}
      data={result.rows}
      getRowId={(row) => row.id}
      server={{ rowCount: result.total, loading: result.key !== key }}
      sorting={query.sorting}
      onSortingChange={(sorting) => setQuery((current) => ({ ...current, sorting }))}
      columnFilters={query.columnFilters}
      onColumnFiltersChange={(columnFilters) => setQuery((current) => ({ ...current, columnFilters }))}
      pagination={query.pagination}
      onPaginationChange={(pagination) => setQuery((current) => ({ ...current, pagination }))}
      pageSizeOptions={[10, 25, 50, 100]}
      sortable
      filterable
      selectable="hover"
      exportable={{
        fileName: 'employees',
        // The app's backend would build the file; here the pretend one hands back the rows.
        onServerExport: async (request, format) => {
          const { all } = serverQuery(everyone, { ...request, pagination: { pageIndex: 0, pageSize: 'all' } })
          const rows =
            request.selection?.type === 'ids'
              ? all.filter((row) => request.selection?.type === 'ids' && request.selection.ids.includes(row.id))
              : request.selection?.type === 'allMatching'
                ? all.filter((row) => request.selection?.type === 'allMatching' && !request.selection.excludedIds.includes(row.id))
                : all
          const { columns: exportColumns } = ref.current!.getExportData()
          await exportTable({ format, columns: exportColumns, rows, fileName: 'employees' })
        },
      }}
    />
  )
}

/**
 * Server-side data: the pretend backend sorts, filters and pages 2,000 rows
 * (300 ms per request, rows dim while loading). Select a page, then "Select all
 * 2000": the selection becomes `allMatching`, and Export asks the backend
 * through `onServerExport`.
 */
export const ServerSide: Story = {
  render: () => <ServerSideDemo />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() => expect(canvas.getByText('1–25 of 2,000')).toBeInTheDocument())
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }))
    await waitFor(() => expect(canvas.getByText('26–50 of 2,000')).toBeInTheDocument())
    await userEvent.click(canvas.getAllByRole('checkbox')[0]!)
    await userEvent.click(canvas.getByRole('button', { name: 'Select all 2,000 rows' }))
    await expect(canvas.getByText('2,000 rows selected')).toBeInTheDocument()
  },
}

function ControlledDemo() {
  const ref = useRef<DataTableHandle<Employee>>(null)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'salary', desc: true }])
  const [selection, setSelection] = useState<DataTableRowSelection>({ type: 'ids', ids: [] })
  return (
    <div className="grid w-4xl max-w-full gap-3">
      <DataTable aria-label="Records"
        ref={ref}
        columns={columns}
        data={makeEmployees(40)}
        getRowId={(row) => row.id}
        pageSize={10}
        sortable
        resizable
        reorderable
        hideable
        selectable
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={selection}
        onRowSelectionChange={setSelection}
      />
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => setSorting([])}>
          Clear sorting (state)
        </Button>
        <Button variant="secondary" size="sm" onClick={() => ref.current?.resetRowSelection()}>
          Clear selection (ref)
        </Button>
        <Button variant="secondary" size="sm" onClick={() => ref.current?.resetLayout()}>
          Reset layout (ref)
        </Button>
      </div>
      <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify({ sorting, selection }, null, 2)}</pre>
    </div>
  )
}

/** Controlled state: sorting and selection live in the parent; resets go through state or the ref. */
export const Controlled: Story = {
  render: () => <ControlledDemo />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getAllByRole('checkbox', { name: 'Select row' })[0]!)
    await expect(canvasElement.querySelector('pre')).toHaveTextContent('"type": "ids"')
    await userEvent.click(canvas.getByRole('button', { name: 'Clear selection (ref)' }))
    await expect(canvas.queryByText(/row selected/)).not.toBeInTheDocument()
  },
}

function CustomExportDemo() {
  const ref = useRef<DataTableHandle<Employee>>(null)
  return (
    <div className="grid w-4xl max-w-full gap-3">
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => {
            const { columns: exportColumns, rows } = ref.current!.getExportData({ rows: 'selected', columns: 'visible' })
            void exportTable({ format: 'xlsx', columns: exportColumns, rows, fileName: 'selected' })
          }}
        >
          Excel: selected rows
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const { columns: exportColumns, rows } = ref.current!.getExportData({ rows: 'page', columns: 'all' })
            void exportTable({ format: 'csv', columns: exportColumns, rows, fileName: 'page' })
          }}
        >
          CSV: this page, every column
        </Button>
      </div>
      <DataTable aria-label="Records" ref={ref} columns={columns} data={makeEmployees(40)} getRowId={(row) => row.id} pageSize={10} selectable hideable />
    </div>
  )
}

/**
 * No toolbar menu: your own buttons. `getExportData` says what to write
 * (rows: selected, page, filtered, loaded, allMatching; columns: visible,
 * selected, all) and `exportTable` writes it.
 */
export const CustomExportButtons: Story = { render: () => <CustomExportDemo /> }

/** `loading` dims the rows; with no rows yet, `loadingMessage` (or "Loading…") shows below the header. */
export const Loading: Story = { args: { data: [], loading: true, loadingMessage: 'Fetching employees…' } }

/** `errorMessage` wins over loading and empty content, as an alert below the header. */
export const ErrorState: Story = {
  name: 'Error',
  args: { data: [], loading: true, errorMessage: 'Employees could not be loaded. Try again later.' },
}

/** `isRowSelectable`: only active employees can be selected — checkboxes, ranges, Ctrl+A and the counts agree. */
export const RestrictedSelection: Story = {
  args: { selectable: true, pageSize: 10, data: makeEmployees(40), isRowSelectable: (row) => row.active },
}

const minimumSalary = ({ value, onApply, close }: DataTableFilterControlProps) => (
  <form
    className="flex flex-col gap-2"
    onSubmit={(event) => {
      event.preventDefault()
      const min = Number(new FormData(event.currentTarget).get('min'))
      onApply(Number.isFinite(min) && min > 0 ? min : undefined)
    }}
  >
    <Input name="min" type="number" aria-label="Minimum salary" defaultValue={typeof value === 'number' ? value : ''} />
    <div className="flex justify-end gap-2">
      <Button type="button" variant="ghost" size="sm" onClick={close}>Cancel</Button>
      <Button type="submit" size="sm">Apply</Button>
    </div>
  </form>
)

/** `meta.filterControl` replaces the "contains" box for one column (a number here); `toolbar` adds your own controls. */
export const CustomFilterAndToolbar: Story = {
  args: {
    filterable: true,
    columns: columns.map((column) =>
      'accessorKey' in column && column.accessorKey === 'salary'
        ? { ...column, filterFn: (row, id, min) => row.getValue<number>(id) >= (min as number), meta: { ...column.meta, filterControl: minimumSalary } }
        : column,
    ),
    toolbar: <Button size="sm">New employee</Button>,
  },
}

/** `locale="tr-TR"`: Turkish sorting (Ç after C, İ/ı), filtering and numbers. The default is `en-US`. */
export const TurkishLocale: Story = {
  args: { 'aria-label': 'Çalışanlar', locale: 'tr-TR', sortable: true, filterable: true, pageSize: 10, data: makeEmployees(1200) },
}

/** `dir="rtl"`: columns run right to left; arrows, resizing and reordering follow. */
export const RightToLeft: Story = {
  args: { dir: 'rtl', sortable: true, resizable: true, reorderable: true },
}

/** `rowVirtualization={false}`: every row in normal flow, e.g. for printing. */
export const NotVirtualized: Story = {
  args: { rowVirtualization: false, data: makeEmployees(150) },
}
