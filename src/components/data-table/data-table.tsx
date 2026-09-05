'use client'

import { useState } from 'react'
import {
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type PaginationState,
  type RowData,
  type SortingState,
} from '@tanstack/react-table'
import { cn } from '../../lib/cn'
import { Button } from '../button/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table/table'
import { ChevronsUpDownIcon } from '../../lib/icons'

/**
 * Sorting + client pagination. `@tanstack/react-table` is an OPTIONAL peer, so
 * this lives behind its own entry point (`@gorkemkaramolla/ui/data-table`) and
 * never loads for projects that only import the root barrel.
 */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
})

/** Column definitions for DataTable — carries the feature set for you. */
export type DataTableColumn<TData extends RowData> = ColumnDef<typeof dataTableFeatures, TData>

export type DataTableProps<TData extends RowData> = {
  columns: Array<DataTableColumn<TData>>
  data: TData[]
  /** Rows per page. Omit to render every row with no pagination controls. */
  pageSize?: number
  emptyMessage?: React.ReactNode
  className?: string
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  pageSize,
  emptyMessage = 'No results.',
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  // Pagination is held here rather than read back off the table instance so the
  // page indicator below has a single source of truth.
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize ?? data.length ?? 0,
  })

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  })

  const rows = table.getRowModel().rows

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 rounded-sm hover:text-foreground"
                        >
                          <table.FlexRender header={header} />
                          <ChevronsUpDownIcon className="size-3.5 opacity-50" />
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pageSize ? (
        <div className="flex items-center justify-end gap-2">
          <span className="text-muted-foreground mr-auto text-sm">
            Page {pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  )
}
