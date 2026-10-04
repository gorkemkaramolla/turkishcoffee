# DataTable

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

Needs the optional peer `@tanstack/react-table`. It is **not** exported from the root `turkishcoffee` entry.

```tsx
import { dataTableFeatures, DataTable, type DataTableColumn, type DataTableProps } from 'turkishcoffee/data-table'
```

Table with click-to-sort headers and optional client-side pagination, over
TanStack Table v9. Import from `turkishcoffee/data-table`. For a static table use
the root `Table` primitives instead.

## Example

```tsx
const columns: DataTableColumn<Payment>[] = [
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: (info) => `$${info.getValue<number>().toFixed(2)}`,
  },
]

<DataTable columns={columns} data={payments} pageSize={10} emptyMessage="No payments." />
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `columns: Array<DataTableColumn<TData>>` — TanStack Table v9 column definitions: `DataTableColumn<Row>[]`.
- `pageSize?: number` — Rows per page. Omit to render every row with no pagination controls.
- `emptyMessage?: React.ReactNode` — Shown in place of rows when `data` is empty. Defaults to "No results."
- `className?: string` — Applied to the outer wrapper (table + pagination row).

## Parts

- `dataTableFeatures` — The TanStack Table v9 feature set DataTable runs with (sorting + client pagination). `@tanstack/react-table` is an OPTIONAL peer, so this lives behind its own entry point (`turkishcoffee/data-table`) and never loads for projects that only import the root barrel.
- `type DataTableColumn` — Column definitions for DataTable — carries the feature set for you. This is TanStack Table v9: type columns as `DataTableColumn<Row>[]`, not v8's `ColumnDef<Row>` or `createColumnHelper`.
- `type DataTableProps`
