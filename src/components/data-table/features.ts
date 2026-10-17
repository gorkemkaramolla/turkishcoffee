import type { ComponentType } from 'react'
import type { TableColumnFilterOption } from '../table/table-column-filter'
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
  /** The column's header filter. Filtering, cell display and export are set apart: none reads the others. */
  filter?: DataTableColumnFilter
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

/**
 * A column's filter. Its kind comes from `variant`; unset, from the column's
 * values — a convenience, held once seen: a column of Dates gets a calendar,
 * of numbers Min and Max, of booleans a checklist, anything else "contains".
 * An empty page or a page of blanks never changes it. Set `variant` whenever
 * the values may not say it: dates kept as strings, a column of a few
 * repeated values (`options`), or server data.
 */
export type DataTableColumnFilter = {
  variant?: DataTableFilterVariant
  /**
   * The column's known values (a status, a type): the filter becomes a
   * checklist of them. Tick the values to show; nothing ticked is no filter,
   * and the filter value is the array of ticked values. A `count` shows
   * beside its option; on the client, options without one are counted. On
   * the server, `options` variant needs them: a page holds only some values.
   */
  options?: readonly TableColumnFilterOption[]
  /** A filter editor of your own inside the header popover. Values need not be strings. Wins over `variant` and `options`. */
  control?: ComponentType<DataTableFilterControlProps>
}

/**
 * A column filter's kind, and the value it puts in `columnFilters`:
 * - `text` — the text the cell contains (`string`);
 * - `options` — the values ticked (`Array<string | number | boolean>`);
 * - `number` — `{ min?: number; max?: number }`, both inclusive;
 * - `date` — `{ from?: Date; to?: Date }`, local days, both inclusive.
 */
export type DataTableFilterVariant = 'text' | 'options' | 'number' | 'date'

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
