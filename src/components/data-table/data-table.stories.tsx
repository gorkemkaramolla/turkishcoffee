import { useEffect, useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { actionsColumn } from './actions-column'
import { DataTable, type DataTableProps } from './data-table'
import { DataTableSkeleton } from './data-table-skeleton'
import type { DataTableColumn, DataTableFilterControlProps } from './features'
import type { DataTableLayout } from './internal/use-persisted-layout'
import type {
  DataTableExportOptions,
  DataTableExportRequest,
  DataTableHandle,
  DataTableQuery,
  DataTableQueryChange,
  DataTableRowSelection,
} from './state'
import { exportTable, toCsv } from '../table/export'
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
  // A few repeated values: filter from a checklist of them, not a text field.
  { accessorKey: 'department', header: 'Department', meta: { filter: { variant: 'options' } } },
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
    meta: {
      // Display, filter and export each say it their own way.
      exportValue: (row: Employee) => (row.active ? 'Active' : 'Passive'),
      filter: { options: [{ value: true, label: 'Active' }, { value: false, label: 'Passive' }] },
    },
  },
  actionsColumn<Employee>({
    label: 'Actions',
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" aria-label={`Actions for ${row.original.name}`}>
        <EllipsisIcon />
      </Button>
    ),
  }),
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
    a11y: {
      test: 'error',
      config: {
        rules: [
          {
            // The grid is the tab stop and moves the active cell into view, so
            // its scrolling body is keyboard-operable. axe can't follow
            // aria-activedescendant and asks for a second tab stop.
            id: 'scrollable-region-focusable',
            selector: ':not([role="grid"] [role="rowgroup"])',
          },
        ],
      },
    },
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

/** Selected rows are grey by default; `selectable={{ color: 'primary' }}` tints them with the brand. */
export const SelectionPrimary: Story = {
  args: {
    selectable: { color: 'primary', defaultValue: { type: 'ids', ids: ['emp_1', 'emp_2'] } },
    pageSize: 10,
    data: makeEmployees(57),
  },
}

/** `striped` alternates the body rows; hover and selection still win over the stripe. */
export const Striped: Story = {
  args: {
    striped: true,
    selectable: { defaultValue: { type: 'ids', ids: ['emp_2'] } },
    pageSize: 10,
    data: makeEmployees(57),
  },
}

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

const optionEmployees = makeEmployees(300)
/**
 * Department filters from its known values, `meta.filter.options`, each with its
 * count: tick the ones to show. From six options a search field sits above them.
 */
export const OptionsFilter: Story = {
  args: {
    filterable: true,
    sortable: true,
    pageSize: 10,
    data: optionEmployees,
    columns: columns.map((column) =>
      'accessorKey' in column && column.accessorKey === 'department'
        ? {
            ...column,
            meta: {
              filter: {
                options: departments.map((department) => ({
                  value: department,
                  label: department,
                  count: optionEmployees.filter((employee) => employee.department === department).length,
                })),
              },
            },
          }
        : column,
    ),
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Filter Department' }))
    const body = within(document.body)
    await userEvent.click(await body.findByRole('checkbox', { name: 'Engineering' }))
    await userEvent.click(body.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(canvas.getByText('1–10 of 50')).toBeInTheDocument())
  },
}

/**
 * Each column filters the way its values call for: text by "contains", the
 * department (`filter.variant: 'options'`) and the status (`filter.options`)
 * from a checklist, the salary between Min and Max, the start date on a calendar.
 */
export const Filterable: Story = {
  args: { filterable: true, sortable: true, pageSize: 10, data: makeEmployees(300) },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Filter Department' }))
    await userEvent.type(await body.findByRole('searchbox'), 'eng')
    await userEvent.click(body.getByRole('checkbox', { name: 'Engineering' }))
    await userEvent.click(body.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(canvas.getByText('1–10 of 50')).toBeInTheDocument())
    await userEvent.click(canvas.getByRole('button', { name: 'Clear filters' }))
    await waitFor(() => expect(canvas.getByText('1–10 of 300')).toBeInTheDocument())

    await userEvent.click(canvas.getByRole('button', { name: 'Filter Salary' }))
    await userEvent.type(await body.findByRole('spinbutton', { name: 'Min' }), '100000{Enter}')
    await waitFor(() => expect(canvas.queryByText('1–10 of 300')).not.toBeInTheDocument())
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
    // The columns move, so a click sorts from the arrow, not the label.
    await userEvent.click(canvas.getByRole('columnheader', { name: /^Salary/ }).querySelector<HTMLElement>('[data-sort-arrow]')!)
    await expect(canvas.getByRole('columnheader', { name: /^Salary/ })).toHaveAttribute('aria-sort', 'ascending')
    await userEvent.click(canvas.getByRole('button', { name: 'Filter Department', hidden: true }))
    await userEvent.click(await within(document.body).findByRole('checkbox', { name: 'Sales' }))
    await userEvent.click(within(document.body).getByRole('button', { name: 'Apply' }))
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

/** Widths, order and visibility survive a reload (`layout.storageKey`). */
export const Persisted: Story = {
  args: { layout: { storageKey: 'storybook-employees' }, sortable: true, resizable: true, reorderable: true, hideable: true },
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
    meta: {
      align: f.kind === 'number' || f.kind === 'money' ? 'end' : 'start',
      // A short list of repeated values filters from a checklist; names and addresses stay text.
      filter: { variant: f.pool && new Set(f.pool).size <= 8 && !/name|address/i.test(f.label) ? 'options' : undefined },
    },
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
      filterable
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

// ── Server data: one query, one request ─────────────────────────────────────

/** One column filter on the pretend backend, by the value's shape. */
function matches(cell: unknown, value: unknown): boolean {
  if (Array.isArray(value)) return value.includes(cell)
  if (value && typeof value === 'object' && ('from' in value || 'to' in value)) {
    const { from, to } = value as { from?: Date; to?: Date }
    const time = (cell as Date).getTime()
    const end = to && new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1)
    return (!from || time >= from.getTime()) && (!end || time < end.getTime())
  }
  if (value && typeof value === 'object') {
    const { min, max } = value as { min?: number; max?: number }
    return (min === undefined || (cell as number) >= min) && (max === undefined || (cell as number) <= max)
  }
  return String(cell ?? '').toLocaleLowerCase('tr').includes(String(value).toLocaleLowerCase('tr'))
}

const blank = (value: unknown) => value === null || value === undefined || value === ''

/** Two cells as a database orders them: numbers, dates and booleans by value, text in Turkish. */
function compare(a: unknown, b: unknown): number {
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(b) - Number(a)
  return String(a).localeCompare(String(b), 'tr', { numeric: true })
}

/**
 * A pretend backend over 2,000 employees: every filter, every sort key in
 * order (Shift+click adds one), blanks last both ways, then one page. `search`
 * is the app's own filter outside the grid.
 */
function queryEmployees(all: Employee[], { sorting, columnFilters, pagination }: DataTableQuery, search = '') {
  const needle = search.toLocaleLowerCase('tr')
  let rows = all.filter(
    (row) =>
      row.name.toLocaleLowerCase('tr').includes(needle) &&
      columnFilters.every(({ id, value }) => matches(row[id as keyof Employee], value)),
  )
  if (sorting.length) {
    rows = [...rows].sort((a, b) => {
      for (const { id, desc } of sorting) {
        const x = a[id as keyof Employee]
        const y = b[id as keyof Employee]
        if (blank(x) || blank(y)) {
          if (blank(x) !== blank(y)) return blank(x) ? 1 : -1
          continue
        }
        const order = compare(x, y)
        if (order) return desc ? -order : order
      }
      return 0
    })
  }
  const page = pagination ?? { pageIndex: 0, pageSize: 'all' as const }
  const size = page.pageSize === 'all' ? rows.length : page.pageSize
  return { rows: rows.slice(page.pageIndex * size, page.pageIndex * size + size), total: rows.length, all: rows }
}

/** The rows an export request covers, as the backend reads it. */
function exportRows(all: Employee[], request: DataTableExportRequest, search: string) {
  if (request.rows.type === 'ids') {
    // Exactly these, whatever the filters: picked one by one, on any page or search.
    const ids = new Set(request.rows.ids)
    return queryEmployees(all, { sorting: request.sorting, columnFilters: [] }).all.filter((row) => ids.has(row.id))
  }
  const excluded = new Set(request.rows.excludedIds)
  return queryEmployees(all, { sorting: request.sorting, columnFilters: request.rows.columnFilters }, search).all.filter(
    (row) => !excluded.has(row.id),
  )
}

// On the server a checklist needs its options: a page holds only some of the values.
const serverColumns = columns.map((column) =>
  'accessorKey' in column && column.accessorKey === 'department'
    ? { ...column, meta: { filter: { options: departments.map((department) => ({ value: department, label: department })) } } }
    : column,
)

const everyone = makeEmployees(2_000)
const firstServerQuery: DataTableQuery = { sorting: [], columnFilters: [], pagination: { pageIndex: 0, pageSize: 25 } }

/**
 * The app's side of a server table: the query is state (in a real app, the
 * URL), each change is one request, and the answer arrives 300 ms later.
 */
function useEmployees(query: DataTableQuery, search = '') {
  const key = JSON.stringify([query, search])
  const [result, setResult] = useState<{ key: string; rows: Employee[]; total: number }>({ key: '', rows: [], total: 0 })
  useEffect(() => {
    const timer = setTimeout(() => {
      const { rows, total } = queryEmployees(everyone, query, search)
      setResult({ key, rows, total })
    }, 300)
    return () => clearTimeout(timer)
  }, [query, search, key])
  return { ...result, loading: result.key !== key }
}

/** The pretend backend answered: the grid is no longer busy. */
const settled = (canvasElement: HTMLElement) =>
  waitFor(() => expect(within(canvasElement).getAllByRole('grid')[0]).not.toHaveAttribute('aria-busy'))

const describeQuery = (query: DataTableQuery, change: DataTableQueryChange) =>
  [
    change,
    `page ${(query.pagination?.pageIndex ?? 0) + 1}`,
    query.sorting.map((sort) => `${sort.id} ${sort.desc ? '↓' : '↑'}`).join(', ') || 'unsorted',
    `${query.columnFilters.length} filter${query.columnFilters.length === 1 ? '' : 's'}`,
  ].join(' · ')

function ServerSideDemo() {
  const [query, setQuery] = useState(firstServerQuery)
  const [requests, setRequests] = useState<string[]>([])
  const result = useEmployees(query)
  return (
    <div className="grid w-4xl max-w-full gap-3">
      <DataTable
        aria-label="Records"
        columns={serverColumns}
        data={result.rows}
        getRowId={(row) => row.id}
        server={{ rowCount: result.total }}
        loading={result.loading}
        // One change, one request: a sort on page 3 arrives here once, already on page 1.
        query={query}
        onQueryChange={(next, change) => {
          setQuery(next)
          setRequests((log) => [...log, describeQuery(next, change)])
        }}
        sortable
        filterable
        selectable="hover"
        exportable={{ fileName: 'employees', fetchRows: async (request) => exportRows(everyone, request, '') }}
      />
      <ol aria-label="Requests" className="grid gap-1 rounded-md bg-muted p-3 font-mono text-xs">
        {requests.map((request, index) => (
          <li key={index}>{request}</li>
        ))}
      </ol>
    </div>
  )
}

/**
 * Server-side data: the pretend backend sorts (by every key, Shift+click adds
 * one), filters and pages 2,000 rows; 300 ms per request, a hairline under the
 * header meanwhile. The app keeps one value, the query, and hears one change
 * per user action: the log below lists each request. A sort or a filter on page
 * 3 is one request for page 1. Select a page, then "Select all 2,000": the
 * selection becomes `allMatching`, and Export fetches the rows through
 * `fetchRows` and writes them.
 */
export const ServerSide: Story = {
  render: () => <ServerSideDemo />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const requests = () => within(canvas.getByRole('list', { name: 'Requests' })).queryAllByRole('listitem')
    await settled(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }))
    await settled(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }))
    await settled(canvasElement)
    await expect(canvas.getByText('51–75 of 2,000')).toBeInTheDocument()
    await expect(requests()).toHaveLength(2)

    // A sort on page 3: one request, for page 1.
    await userEvent.click(canvas.getByRole('columnheader', { name: /^Department/ }).querySelector<HTMLElement>('[data-sort-arrow]')!)
    await expect(requests()).toHaveLength(3)
    await expect(requests()[2]).toHaveTextContent('sorting · page 1 · department ↑ · 0 filters')
    // A second key with Shift: the backend orders by both.
    const user = userEvent.setup()
    await user.keyboard('{Shift>}')
    await user.click(canvas.getByRole('columnheader', { name: /^Name/ }).querySelector<HTMLElement>('[data-sort-arrow]')!)
    await user.keyboard('{/Shift}')
    await expect(requests()).toHaveLength(4)
    await expect(requests()[3]).toHaveTextContent('sorting · page 1 · department ↑, name ↑ · 0 filters')
    await settled(canvasElement)
    const cells = (id: string) =>
      [...canvasElement.querySelectorAll<HTMLElement>(`[role="gridcell"][data-col="${id}"]`)].map((cell) => cell.textContent ?? '')
    await waitFor(() => expect(cells('department').slice(0, 2)).toEqual(['Engineering', 'Engineering']))
    const names = cells('name').slice(0, 5)
    await expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'tr')))

    await userEvent.click(canvas.getAllByRole('checkbox')[0]!)
    await userEvent.click(canvas.getByRole('button', { name: 'Select all 2,000 rows' }))
    await expect(canvas.getByText('2,000 rows selected')).toBeInTheDocument()
  },
}

function ControlledDemo() {
  const controlledRef = useRef<DataTableHandle<Employee>>(null)
  const uncontrolledRef = useRef<DataTableHandle<Employee>>(null)
  const firstQuery: DataTableQuery = { sorting: [{ id: 'salary', desc: true }], columnFilters: [], pagination: { pageIndex: 0, pageSize: 5 } }
  const [query, setQuery] = useState(firstQuery)
  const [selection, setSelection] = useState<DataTableRowSelection>({ type: 'ids', ids: [] })
  const data = useMemo(() => makeEmployees(40), [])
  return (
    <div className="grid w-4xl max-w-full gap-6">
      <section aria-label="Controlled" className="grid gap-3">
        <DataTable
          aria-label="Controlled"
          ref={controlledRef}
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          pageSize={5}
          sortable
          filterable
          hideable
          // The parent owns the query and the selection: the grid shows them and asks for changes.
          query={query}
          onQueryChange={setQuery}
          selectable={{ value: selection, onChange: setSelection }}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setQuery(firstQuery)}>
            Reset query (state)
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setSelection({ type: 'ids', ids: [] })}>
            Clear selection (state)
          </Button>
          <Button variant="secondary" size="sm" onClick={() => controlledRef.current?.resetLayout()}>
            Reset layout (ref)
          </Button>
        </div>
        <pre aria-label="Controlled state" className="rounded-md bg-muted p-3 text-xs">
          {JSON.stringify({ query, selection })}
        </pre>
      </section>
      <section aria-label="Uncontrolled" className="grid gap-3">
        <DataTable
          aria-label="Uncontrolled"
          ref={uncontrolledRef}
          columns={columns}
          data={data}
          getRowId={(row) => row.id}
          pageSize={5}
          sortable
          selectable
          // The grid owns the query, from here; resets go through the ref.
          defaultQuery={{ sorting: [{ id: 'name', desc: false }] }}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => uncontrolledRef.current?.resetQuery()}>
            Reset query (ref)
          </Button>
          <Button variant="secondary" size="sm" onClick={() => uncontrolledRef.current?.resetRowSelection()}>
            Clear selection (ref)
          </Button>
        </div>
      </section>
    </div>
  )
}

/**
 * Controlled (top): the query and the selection live in the parent, and the
 * parent resets them by setting its state. Uncontrolled (bottom): the grid
 * keeps them from `defaultQuery`, and the ref resets them — `resetQuery()` is
 * one change back to `defaultQuery`, on page 1.
 */
export const ControlledAndUncontrolled: Story = {
  render: () => <ControlledDemo />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const controlled = within(canvas.getByRole('region', { name: 'Controlled' }))
    const state = () => controlled.getByLabelText('Controlled state').textContent ?? ''
    await userEvent.click(controlled.getByRole('button', { name: 'Next page' }))
    await userEvent.click(controlled.getAllByRole('checkbox', { name: 'Select row' })[0]!)
    await waitFor(() => expect(state()).toContain('"pageIndex":1'))
    await expect(state()).toContain('"ids":["emp_')
    await userEvent.click(controlled.getByRole('button', { name: 'Reset query (state)' }))
    await userEvent.click(controlled.getByRole('button', { name: 'Clear selection (state)' }))
    await waitFor(() => expect(state()).toContain('"pageIndex":0'))
    await expect(controlled.getByText('1–5 of 40')).toBeInTheDocument()
    await expect(controlled.queryByText(/row selected/)).not.toBeInTheDocument()

    const uncontrolled = within(canvas.getByRole('region', { name: 'Uncontrolled' }))
    const nameHeader = () => uncontrolled.getByRole('columnheader', { name: /^Name/ })
    await userEvent.click(nameHeader().querySelector<HTMLElement>('[data-sort-arrow]')!)
    await expect(nameHeader()).toHaveAttribute('aria-sort', 'descending')
    await userEvent.click(uncontrolled.getByRole('button', { name: 'Next page' }))
    await userEvent.click(uncontrolled.getByRole('button', { name: 'Reset query (ref)' }))
    await expect(nameHeader()).toHaveAttribute('aria-sort', 'ascending')
    await expect(uncontrolled.getByText('1–5 of 40')).toBeInTheDocument()
  },
}

function SelectionScopeDemo() {
  const [query, setQuery] = useState(firstServerQuery)
  const [search, setSearch] = useState('')
  const [selection, setSelection] = useState<DataTableRowSelection>({ type: 'ids', ids: [] })
  const result = useEmployees(query, search)
  return (
    <div className="grid w-4xl max-w-full gap-3">
      <DataTable
        aria-label="Records"
        columns={serverColumns}
        data={result.rows}
        getRowId={(row) => row.id}
        server={{ rowCount: result.total }}
        loading={result.loading}
        query={query}
        onQueryChange={setQuery}
        filterable
        // The search is part of what "every matching row" means: it is the selection's scopeKey.
        selectable={{ value: selection, onChange: setSelection, scopeKey: search }}
        toolbar={
          <Input
            type="search"
            aria-label="Search by name"
            placeholder="Search by name"
            className="w-56"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setQuery((current) => ({ ...current, pagination: { pageIndex: 0, pageSize: current.pagination?.pageSize ?? 25 } }))
            }}
          />
        }
      />
      <pre aria-label="Selection" className="rounded-md bg-muted p-3 text-xs">
        {JSON.stringify(selection)}
      </pre>
    </div>
  )
}

/**
 * What a selection survives. Rows picked one by one (`ids`) stay picked across
 * pages, filters and searches; they count as "not on this page" when out of
 * view. "Every matching row" (`allMatching`) is one result: paging keeps it,
 * a new filter or search (`scopeKey`) clears it.
 */
export const SelectionScope: Story = {
  render: () => <SelectionScopeDemo />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const state = () => canvas.getByLabelText('Selection').textContent ?? ''
    const box = () => canvas.getAllByRole('checkbox', { name: 'Select row' })[0]!
    await settled(canvasElement)
    await userEvent.click(box())
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }))
    await settled(canvasElement)
    await userEvent.click(box())
    await expect(canvas.getByText('2 rows selected · 1 not on this page')).toBeInTheDocument()

    // A search: the rows picked stay picked.
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Search by name' }), 'Zeynep')
    await settled(canvasElement)
    await expect(canvas.getByText(/of 167$/)).toBeInTheDocument()
    await expect(canvas.getByText(/^2 rows selected/)).toBeInTheDocument()

    // Every matching row: kept across pages, cleared by a new search.
    await userEvent.click(canvas.getByRole('button', { name: 'Clear selection' }))
    await userEvent.click(canvas.getAllByRole('checkbox')[0]!)
    await userEvent.click(canvas.getByRole('button', { name: 'Select all 167 rows' }))
    await expect(state()).toContain('"allMatching"')
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }))
    await settled(canvasElement)
    await expect(canvas.getByText('167 rows selected')).toBeInTheDocument()
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Search by name' }), ' K')
    await waitFor(() => expect(state()).toBe('{"type":"ids","ids":[]}'))
  },
}

/** A file the backend wrote, downloaded by the app. */
function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName })
  link.click()
  setTimeout(() => URL.revokeObjectURL(url))
}

type ExportMode = 'fetchRows' | 'backend file' | 'failing backend'

function ServerExportDemo() {
  const [mode, setMode] = useState<ExportMode>('fetchRows')
  const [query, setQuery] = useState(firstServerQuery)
  const [log, setLog] = useState<string[]>([])
  const result = useEmployees(query)
  const note = (line: string) => setLog((current) => [...current, line])
  const covers = (request: DataTableExportRequest) =>
    request.rows.type === 'ids' ? `${request.rows.ids.length} rows by id` : `every matching row but ${request.rows.excludedIds.length}`

  const exportable: DataTableExportOptions<Employee> =
    mode === 'fetchRows'
      ? {
          fileName: 'employees',
          // The app fetches the rows; the grid writes the file with its own columns.
          fetchRows: async (request) => {
            const rows = exportRows(everyone, request, '')
            note(`fetchRows: ${covers(request)} → ${rows.length} rows, written by the grid`)
            return rows
          },
        }
      : {
          fileName: 'employees',
          // The backend writes the file; the app downloads it.
          onServerExport: async (request, format) => {
            if (mode === 'failing backend') throw new Error('The export service is unavailable.')
            const rows = exportRows(everyone, request, '')
            const csv = toCsv(
              request.columns.map((id) => ({ label: id, value: (row: Employee) => row[id as keyof Employee] })),
              rows,
              'en-US',
            )
            download(new Blob([csv], { type: 'text/csv' }), `employees.${format === 'csv' ? 'csv' : 'xlsx'}`)
            note(`backend file: ${covers(request)} → ${rows.length} rows as ${format}`)
          },
          onError: (error) => note(`error: ${error instanceof Error ? error.message : String(error)}`),
        }

  return (
    <div className="grid w-4xl max-w-full gap-3">
      <div role="radiogroup" aria-label="Export through" className="flex gap-2">
        {(['fetchRows', 'backend file', 'failing backend'] as const).map((option) => (
          <Button
            key={option}
            role="radio"
            aria-checked={mode === option}
            variant={mode === option ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode(option)}
          >
            {option}
          </Button>
        ))}
      </div>
      <DataTable
        aria-label="Records"
        columns={serverColumns}
        data={result.rows}
        getRowId={(row) => row.id}
        server={{ rowCount: result.total }}
        loading={result.loading}
        query={query}
        onQueryChange={setQuery}
        filterable
        selectable="hover"
        exportable={exportable}
      />
      <ol aria-label="Export log" className="grid gap-1 rounded-md bg-muted p-3 font-mono text-xs">
        {log.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ol>
    </div>
  )
}

/**
 * Exporting rows only the server holds, the two ways: `fetchRows` — the app
 * fetches what the request covers and the grid writes the file — or
 * `onServerExport` — the backend writes the file and the app downloads it.
 * The request carries the row scope (ids, or every matching row with its
 * filters and exclusions), the columns and the sorting. A failure reaches
 * `onError`, and the menu says so.
 */
export const ServerExport: Story = {
  render: () => <ServerExportDemo />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)
    const log = () => within(canvas.getByRole('list', { name: 'Export log' })).queryAllByRole('listitem')
    const exportCsv = async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Export' }))
      await expect(await body.findByText('6 columns · 2,000 rows')).toBeInTheDocument()
      await userEvent.click(body.getByRole('menuitem', { name: 'CSV (.csv)' }))
    }
    await settled(canvasElement)

    await exportCsv()
    await waitFor(() => expect(log()[0]).toHaveTextContent('fetchRows: every matching row but 0 → 2000 rows, written by the grid'))

    await userEvent.click(canvas.getByRole('radio', { name: 'backend file' }))
    await exportCsv()
    await waitFor(() => expect(log()[1]).toHaveTextContent('backend file: every matching row but 0 → 2000 rows as csv'))

    await userEvent.click(canvas.getByRole('radio', { name: 'failing backend' }))
    await exportCsv()
    await waitFor(() => expect(log()[2]).toHaveTextContent('error: The export service is unavailable.'))
    await expect(canvas.getByRole('alert')).toHaveTextContent('Export failed. Please try again.')
  },
}

/** A layout saved by an older release: Phone has since gone, Start date is new. */
const olderLayout: Partial<DataTableLayout> = {
  columnOrder: ['salary', 'name', 'phone', 'department', 'email', 'active', 'actions'],
  columnVisibility: { email: false, phone: false },
  columnSizing: { name: 240 },
}

function SavedLayoutDemo() {
  const [reported, setReported] = useState<string>('—')
  return (
    <div className="grid w-4xl max-w-full gap-3">
      <DataTable
        aria-label="Records"
        columns={columns}
        data={twenty}
        getRowId={(row) => row.id}
        resizable
        reorderable
        hideable
        // The app keeps the layout (a cookie, a backend); the grid fits it to today's columns.
        layout={{
          saved: olderLayout,
          defaults: { columnVisibility: { email: false } },
          onChange: (layout) => setReported(layout ? layout.columnOrder.join(', ') : 'null'),
        }}
      />
      <p aria-label="Reported layout" className="text-sm text-muted-foreground">
        {reported}
      </p>
    </div>
  )
}

/**
 * A saved layout meets columns that changed since: the removed Phone is
 * dropped, the new Start date takes its place beside Salary, its neighbour in
 * the definitions, and the saved widths and hidden columns still apply.
 * "Reset layout" returns to `layout.defaults` and reports `null`.
 */
export const SavedLayout: Story = {
  render: () => <SavedLayoutDemo />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const order = () => [...canvasElement.querySelectorAll<HTMLElement>('[role="columnheader"]')].map((header) => header.dataset.col)
    await expect(order()).toEqual(['salary', 'startDate', 'name', 'department', 'active', 'actions'])
    await userEvent.click(canvas.getByRole('button', { name: 'Columns' }))
    await userEvent.click(await within(document.body).findByRole('menuitem', { name: 'Reset layout' }))
    await waitFor(() => expect(order()).toEqual(['name', 'department', 'salary', 'startDate', 'active', 'actions']))
    await expect(canvas.getByLabelText('Reported layout')).toHaveTextContent('null')
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

/** `loading` runs a hairline under the header; with no rows yet, `loadingMessage` (or "Loading…") shows below it. */
/** The first page on its way: placeholder rows under the real headers, sharing Skeleton's glint. */
export const Loading: Story = { args: { data: [], loading: true } }

/** `loadingMessage` replaces the placeholder rows with the app's own content. */
export const LoadingMessage: Story = { args: { data: [], loading: true, loadingMessage: 'Fetching employees…' } }

/** DataTableSkeleton: the same table, before DataTable itself can render, as in a Suspense fallback. */
export const Skeleton: Story = {
  render: () => <DataTableSkeleton columns={['Name', 'Department', 'Email', 'Salary']} selectable />,
}

/** `errorMessage` wins over loading and empty content, as an alert below the header. */
export const ErrorState: Story = {
  name: 'Error',
  args: { data: [], loading: true, errorMessage: 'Employees could not be loaded. Try again later.' },
}

/** `isRowSelectable`: only active employees can be selected — checkboxes, ranges, Ctrl+A and the counts agree. */
export const RestrictedSelection: Story = {
  args: { selectable: { isRowSelectable: (row) => row.active }, pageSize: 10, data: makeEmployees(40) },
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

/** `meta.filter.control` replaces the built-in filter for one column; `toolbar` adds your own controls. */
export const CustomFilterAndToolbar: Story = {
  args: {
    filterable: true,
    columns: columns.map((column) =>
      'accessorKey' in column && column.accessorKey === 'salary'
        ? { ...column, filterFn: (row, id, min) => row.getValue<number>(id) >= (min as number), meta: { ...column.meta, filter: { control: minimumSalary } } }
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
