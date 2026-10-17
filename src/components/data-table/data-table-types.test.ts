import { describe, expectTypeOf, it } from 'vitest'
import type { DataTableColumn, DataTableFilterControlProps } from './features'
import type { DataTableProps } from './data-table'

type Employee = { id: string; name: string; active: boolean }

describe('types', () => {
  it('meta.exportValue infers the row type', () => {
    const columns: Array<DataTableColumn<Employee>> = [
      {
        accessorKey: 'active',
        header: 'Status',
        meta: {
          exportValue: (row) => {
            expectTypeOf(row).toEqualTypeOf<Employee>()
            return row.active ? 'Active' : 'Passive'
          },
        },
      },
      {
        id: 'actions',
        meta: { reorderable: false, exportValue: (row) => row.name },
      },
    ]
    expectTypeOf(columns).not.toBeAny()
  })
})

// Compile-time contracts: `pnpm typecheck` fails if an @ts-expect-error stops erroring.
describe('public contracts (types)', () => {
  const columns: Array<DataTableColumn<Employee>> = [{ accessorKey: 'name', header: 'Name' }]
  const server = { rowCount: 100 }

  it('server selection requires getRowId', () => {
    expectTypeOf<DataTableProps<Employee>>().toBeObject()
    const ok: DataTableProps<Employee> = { columns, data: [], server, selectable: true, getRowId: (row) => row.id }
    const unselectable: DataTableProps<Employee> = { columns, data: [], server }
    // @ts-expect-error -- selectable server rows need a stable id
    const missing: DataTableProps<Employee> = { columns, data: [], server, selectable: true }
    void [ok, unselectable, missing]
  })

  it('rejects grouped columns and footers', () => {
    // @ts-expect-error -- nested column groups are unsupported
    const grouped: DataTableColumn<Employee> = { header: 'Group', columns: [] }
    // @ts-expect-error -- footers are unsupported
    const footer: DataTableColumn<Employee> = { accessorKey: 'name', footer: 'Total' }
    void [grouped, footer]
  })

  it('filter controls receive unknown values', () => {
    const Control = (props: DataTableFilterControlProps) => {
      expectTypeOf(props.value).toBeUnknown()
      expectTypeOf(props.onApply).parameter(0).toBeUnknown()
      return null
    }
    const column: DataTableColumn<Employee> = { accessorKey: 'active', meta: { filter: { control: Control } } }
    void column
  })

  it('accepts the new grid props', () => {
    const props: DataTableProps<Employee> = {
      columns,
      data: [],
      rowVirtualization: false,
      autoSize: 'data',
      toolbar: null,
      selectable: { isRowSelectable: (row) => row.active, checkboxes: 'hover', scope: 'page' },
      loading: true,
      loadingMessage: 'Loading',
      errorMessage: 'Failed',
      exportable: { onError: (_error, format) => expectTypeOf(format).toEqualTypeOf<'csv' | 'xlsx'>() },
      'aria-labelledby': 'heading',
      dir: 'rtl',
      locale: 'tr-TR',
    }
    // @ts-expect-error -- autoSize takes 'initial' | 'data' | false
    const wrong: DataTableProps<Employee> = { columns, data: [], autoSize: true }
    void [props, wrong]
  })

  it('keeps each choice of two ways exclusive', () => {
    const fetchRows = async () => [] as Employee[]
    // @ts-expect-error -- the grid writes fetched rows, or the backend writes the file: not both
    const both: DataTableProps<Employee> = { columns, data: [], exportable: { fetchRows, onServerExport: () => {} } }
    // @ts-expect-error -- the layout lives in this browser or with the app: not both
    const twice: DataTableProps<Employee> = { columns, data: [], layout: { storageKey: 'k', saved: null } }
    // @ts-expect-error -- server selection needs getRowId
    const unkeyed: DataTableProps<Employee> = { columns, data: [], server: { rowCount: 0 }, selectable: true }
    void [both, twice, unkeyed]
  })
})
