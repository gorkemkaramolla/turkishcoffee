import type { ComponentType } from 'react'
import {
  columnFilteringFeature,
  columnOrderingFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table'

/** What DataTable reads from a column's `meta`. All optional. `TData` is the row type. */
export type DataTableColumnMeta<TData = never> = {
  /** Header classes, merged last. */
  headerClassName?: string
  /** Cell classes, merged last. Rows remain fixed-height and single-line. */
  cellClassName?: string
  /** Custom filter editor inside the header filter popover. Values need not be strings. */
  filterControl?: ComponentType<DataTableFilterControlProps>
  /** `'end'` right-aligns the header and cells — use it for numbers. */
  align?: 'start' | 'end'
  /** The column's name in the Columns menu and header menu when `header` is a function. */
  label?: string
  /** `false` keeps the column where it is when `reorderable` is on (an actions column). */
  reorderable?: boolean
  /**
   * The value written to CSV/Excel for a row, when the cell's own value is not
   * what should be exported — e.g. `(row) => row.isActive ? 'Active' : 'Passive'`
   * for a Badge column, or anything for a display column with no accessor.
   * `row` is the column's row type.
   */
  exportValue?(row: TData): unknown
}

/** Props for a custom column filter. onApply commits and closes; close cancels. */
export type DataTableFilterControlProps = {
  columnId: string
  value: unknown
  onApply: (value: unknown) => void
  close: () => void
}

/**
 * The TanStack Table v9 feature set DataTable runs with: sorting, filtering, row
 * selection, client pagination, column sizing/resizing, ordering and
 * visibility. Every feature is registered; the DataTable props decide which
 * ones the user can reach.
 * `@tanstack/react-table` is an OPTIONAL peer, so this lives behind its own entry
 * point (`turkishcoffee/data-table`) and never loads for projects that only
 * import the root barrel.
 */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnSizingFeature,
  columnResizingFeature,
  columnOrderingFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  columnMeta: {} as DataTableColumnMeta,
})

export type DataTableFeatures = typeof dataTableFeatures

/**
 * Column definitions for DataTable — carries the feature set for you. This is
 * TanStack Table v9: type columns as `DataTableColumn<Row>[]`, not v8's
 * `ColumnDef<Row>` or `createColumnHelper`. Per-column switches are TanStack's
 * own: `enableSorting`, `enableResizing`, `enableHiding`, `enableColumnFilter`,
 * `size`, `minSize`, `maxSize`, `sortFn`, `filterFn`; plus `meta`
 * ({@link DataTableColumnMeta}).
 */
export type DataTableColumn<TData extends RowData> = WithRowMeta<ColumnDef<DataTableFeatures, TData>, TData>

/** Each kind of column definition, with a `meta` that knows the row type (for `exportValue`). */
type WithRowMeta<TColumn, TData> = TColumn extends unknown
  ? Omit<TColumn, 'meta' | 'columns' | 'footer'> & { meta?: DataTableColumnMeta<TData>; columns?: never; footer?: never }
  : never
