import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnSizingState,
  ColumnVisibilityState,
  SortingState,
} from '@tanstack/react-table'
import type { TablePageSize } from '../table/table-pagination'
import type { TableExportColumn, TableExportFormat } from '../table/export'

/** Which page is on screen. `pageIndex` is 0-based; `'all'` puts every row on one page. */
export type DataTablePagination = { pageIndex: number; pageSize: TablePageSize }

/**
 * Which rows are selected. Plain data: store it, or send it to a backend as is.
 * - `ids`: these rows, on any page.
 * - `allMatching`: every row matching the current filters — on the server too —
 *   except `excludedIds`. What the header box's second click selects.
 */
export type DataTableRowSelection =
  | { type: 'ids'; ids: string[] }
  | { type: 'allMatching'; excludedIds: string[] }

/** Which columns are selected, and over which rows: the page on screen, or every matching row. */
export type DataTableColumnSelection = { ids: string[]; scope: 'page' | 'all' }

/**
 * Every piece of state DataTable keeps. Each can be controlled (`sorting` +
 * `onSortingChange`, …) or left to DataTable, starting from `initialState`.
 */
export type DataTableState = {
  sorting: SortingState
  columnFilters: ColumnFiltersState
  pagination: DataTablePagination
  rowSelection: DataTableRowSelection
  columnSelection: DataTableColumnSelection
  columnVisibility: ColumnVisibilityState
  columnOrder: ColumnOrderState
  /** Widths the user set (dragged, typed or fitted). Automatic widths are not state. */
  columnSizing: ColumnSizingState
}

/**
 * Server-side data: `data` is the current page, and sorting, filtering and
 * paging happen on the server (through the state callbacks). DataTable never
 * sorts or filters a loaded page on its own.
 */
export type DataTableServer = {
  /** Rows matching the current filters on the server. */
  rowCount: number
  /** A request is in flight: a bar runs under the header, the grid is `aria-busy`, paging pauses. */
  loading?: boolean
}

/** The rows an export covers. `auto`: selected rows, else the column selection's rows, else every filtered row. */
export type DataTableExportRows = 'auto' | 'selected' | 'page' | 'filtered' | 'loaded' | 'allMatching'

/** The columns an export covers. `auto`: the selected columns, else the visible ones. */
export type DataTableExportColumns = 'auto' | 'visible' | 'selected' | 'all'

/** What a backend needs to produce an export of rows it holds (server mode). */
export type DataTableExportRequest = {
  /** Column ids, in display order. */
  columns: string[]
  /** `null`: every row matching `columnFilters`. */
  selection: DataTableRowSelection | null
  sorting: SortingState
  columnFilters: ColumnFiltersState
  pagination: DataTablePagination
}

/** Export-ready data: hand `columns` and `rows` to `exportTable`, or `request` to your backend. */
export type DataTableExportData<TData> = {
  columns: Array<TableExportColumn<TData>>
  /** The covered rows DataTable holds, in display order. */
  rows: TData[]
  /** Set when the covered rows live on the server (server mode): fetch or export them there. */
  request: DataTableExportRequest | null
}

/** Imperative access: `<DataTable ref={ref} />`. On a controlled slice, each call goes through its `on…Change`. */
export type DataTableHandle<TData> = {
  /** Fit rendered content and a sample of up to 50 loaded values. Omit ids to fit visible columns. */
  fitColumns(columnIds?: string[]): void
  resetSorting(): void
  resetColumnFilters(): void
  resetRowSelection(): void
  resetColumnSelection(): void
  /** Column visibility, order and sizing — and the stored copy under `storageKey`. */
  resetLayout(): void
  setPageIndex(pageIndex: number): void
  /** The selected rows DataTable holds (under `allMatching`: the loaded matching rows not excluded). */
  getSelectedRows(): TData[]
  getExportData(options?: { rows?: DataTableExportRows; columns?: DataTableExportColumns }): DataTableExportData<TData>
  /**
   * Exports with the built-in writer, as the toolbar's menu does. Rows beyond
   * the loaded data go to `exportable.onServerExport`; without it the promise
   * rejects unless `rows` is `'page'` or `'loaded'`. Failures also reach `onExportError`.
   */
  export(format: TableExportFormat, options?: { rows?: DataTableExportRows; columns?: DataTableExportColumns }): Promise<void>
}
