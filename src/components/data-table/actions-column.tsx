import type { ReactNode } from 'react'
import type { CellContext, RowData } from '@tanstack/react-table'
import type { DataTableColumn, DataTableFeatures } from './features'

export type ActionsColumnOptions<TData extends RowData> = {
  /** The column's name: read by screen readers in place of a visible header, and shown in the Columns menu. */
  label: string
  /** The row's actions, usually a DropdownMenu opened by a ghost `size="icon"` Button with an `aria-label` naming the row; `size="icon-sm"` in a `size="sm"` grid, whose 32px rows a 36px button overflows. */
  cell: (context: CellContext<DataTableFeatures, TData, unknown>) => ReactNode
  /** Width in px. Default 56: a 36px icon button with room on both sides. */
  size?: number
  /** Default `'actions'`. */
  id?: string
}

/**
 * The column for a row's actions. It has a fixed width, a centred cell and a
 * header only screen readers read. It cannot be sorted, filtered, resized,
 * hidden, moved or exported. Put it last.
 *
 * @example
 * const columns: DataTableColumn<Person>[] = [
 *   { accessorKey: 'name', header: 'Name' },
 *   actionsColumn<Person>({
 *     label: 'Actions',
 *     cell: ({ row }) => (
 *       <DropdownMenu>
 *         <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={`Actions for ${row.original.name}`} />}>
 *           <EllipsisIcon />
 *         </DropdownMenuTrigger>
 *         <DropdownMenuContent align="end">…</DropdownMenuContent>
 *       </DropdownMenu>
 *     ),
 *   }),
 * ]
 */
export function actionsColumn<TData extends RowData>({
  label,
  cell,
  size = 56,
  id = 'actions',
}: ActionsColumnOptions<TData>): DataTableColumn<TData> {
  return {
    id,
    header: () => <span className="sr-only">{label}</span>,
    cell,
    size,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    enableColumnFilter: false,
    meta: { label, reorderable: false, cellClassName: 'justify-center px-0' },
  }
}
