import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'
import type { TablePageSize } from '../table/table-pagination'
import type { TableExportColumn, TableExportFormat } from '../table/export'
import type { DataTableLayout } from './internal/use-persisted-layout'

/** Which page is on screen. `pageIndex` is 0-based; `'all'` puts every row on one page. */
export type DataTablePagination = { pageIndex: number; pageSize: TablePageSize }

/**
 * Which rows are selected. Plain data: store it, or send it to a backend as is.
 * - `ids`: these rows, on any page — picked one by one, or a whole page (the
 *   header box's first click adds the page's ids).
 * - `allMatching`: every row matching the query — loaded or not, on the
 *   server too — except `excludedIds`. The header box's second click.
 */
export type DataTableRowSelection =
  | { type: 'ids'; ids: string[] }
  | { type: 'allMatching'; excludedIds: string[] }

/** Which columns are selected, and over which rows: the page on screen, or every matching row. */
export type DataTableColumnSelection = { ids: string[]; scope: 'page' | 'all' }

/**
 * What the rows on screen answer to: their order, their filters and their
 * page. One value, so a change that touches two of them — a new sort also
 * returns to the first page — is one change, reported once. On the server it
 * is what the backend is asked for.
 */
export type DataTableQuery = {
  sorting: SortingState
  columnFilters: ColumnFiltersState
  /** Absent when the grid has no pages (no `pageSize`, no `server`). */
  pagination?: DataTablePagination
}

/**
 * Which part of the query a change started from. A sort or filter change also
 * returns to the first page; `reset` is `ref.resetQuery()`.
 */
export type DataTableQueryChange = 'sorting' | 'columnFilters' | 'pagination' | 'reset'

/**
 * Server-side data: `data` is the current page, and sorting, filtering and
 * paging happen on the server, through `onQueryChange`. DataTable never sorts
 * or filters a loaded page on its own, and never reads totals, filter options
 * or selection counts off the one page it holds.
 */
export type DataTableServer = {
  /** Rows matching the current query on the server. */
  rowCount: number
}

/**
 * Row selection: `selectable={true}`, `'hover'`, or these options. Every
 * option is optional; `value` + `onChange` control the selection, or leave it
 * to the grid from `defaultValue`.
 *
 * What survives what, with `scope: 'crossPage'` (default):
 * - rows picked one by one (`ids`) survive paging, sorting, filtering and new
 *   searches. Picked rows a filter hides stay selected, and an export of the
 *   selection still writes them.
 * - every matching row (`allMatching`) describes one result: it clears when
 *   the filters or `scopeKey` change, and survives paging and sorting.
 *
 * With `scope: 'page'`, changing the page, the sorting or the filters clears
 * the selection, and the header box selects the page only.
 */
export type DataTableSelectionOptions<TData> = {
  /** `'always'` (default): every row shows its box. `'hover'`: a row's box shows on hover, every box once anything is selected. */
  checkboxes?: 'always' | 'hover'
  /** The selected rows' background: `'neutral'` (default) grey, `'primary'` the brand's soft tint. */
  color?: 'neutral' | 'primary'
  scope?: 'page' | 'crossPage'
  /** Which rows may be selected. */
  isRowSelectable?: (row: TData) => boolean
  value?: DataTableRowSelection
  /** The uncontrolled selection's starting value, read once. */
  defaultValue?: DataTableRowSelection
  onChange?: (selection: DataTableRowSelection) => void
  /**
   * The query's parts that live outside the grid (a search box, status tabs),
   * as one string. Changing it clears an `allMatching` selection, as the
   * grid's own filters do, and an export request carries it.
   */
  scopeKey?: string
  /**
   * Server with `isRowSelectable`: how many rows matching the query may be
   * selected, counted by the backend. With it the header box can select every
   * matching row, and the backend checks eligibility when it acts on the
   * selection. Without it the selection stays explicit ids of loaded rows.
   */
  selectableRowCount?: number
}

/** Column selection: `selectableColumns={true}`, or these options to control or start it. */
export type DataTableColumnSelectionOptions = {
  value?: DataTableColumnSelection
  defaultValue?: DataTableColumnSelection
  onChange?: (selection: DataTableColumnSelection) => void
}

/**
 * Where the column layout (widths, order, visibility) is kept — one of two
 * ways, never both:
 * - `storageKey`: in this browser's `localStorage`, by the grid;
 * - `saved` + `onChange`: by the app, in a cookie or a backend. Read on the
 *   server, the page renders in the saved layout from the first byte.
 *
 * Precedence: the saved layout > `defaults` > the column definitions. A saved
 * layout is fitted to the current columns: columns removed since it was saved
 * are dropped, new ones take their place from the definitions, and a column
 * whose `id` changed counts as new. "Reset layout" returns to `defaults`
 * (else the definitions), clears the stored copy and reports `null`.
 */
export type DataTableLayoutOptions = {
  /** The layout the grid starts from and resets to. */
  defaults?: Partial<DataTableLayout>
  /** Called after an edit is complete (a resize at pointer release, not every pixel), and with `null` after a reset. */
  onChange?: (layout: DataTableLayout | null) => void
} & (
  | { storageKey: string; saved?: never }
  | {
      /** A layout the app saved from `onChange`; `null`: nothing saved yet. Malformed fields and unknown columns are ignored. */
      saved: Partial<DataTableLayout> | null
      storageKey?: never
    }
  | { storageKey?: never; saved?: never }
)

/** The rows an export covers. `auto`: selected rows, else the column selection's rows, else every filtered row. */
export type DataTableExportRows = 'auto' | 'selected' | 'page' | 'filtered' | 'loaded' | 'allMatching'

/** The columns an export covers. `auto`: the selected columns, else the visible ones. */
export type DataTableExportColumns = 'auto' | 'visible' | 'selected' | 'all'

/**
 * Which rows an export covers once `auto` is resolved: the selected rows, the
 * rows on screen, every row passing the filters (`allMatching` included), or
 * all of `data`.
 */
export type DataTableExportScope = 'selected' | 'page' | 'filtered' | 'loaded'

/**
 * Server mode: the rows an export covers that the loaded page doesn't hold,
 * described for the backend.
 */
export type DataTableExportRequest = {
  /** Column ids, in display order. */
  columns: string[]
  /** The order to write the rows in. */
  sorting: SortingState
  rows:
    | {
        /** Exactly these rows, whatever the current filters: rows picked one by one, perhaps on other pages or searches. */
        type: 'ids'
        ids: string[]
      }
    | {
        /** Every row matching the query, except `excludedIds`. */
        type: 'matching'
        columnFilters: ColumnFiltersState
        /** The selection's `scopeKey`: the app's filters outside the grid. */
        scopeKey?: string
        excludedIds: string[]
      }
}

/**
 * The Export menu (`exportable={true}` or these options). Rows the grid holds
 * it writes itself. In server mode rows beyond the loaded page are the app's
 * to provide, one of two ways:
 * - `fetchRows`: the app fetches them; the grid writes the file;
 * - `onServerExport`: the backend writes the file; the app downloads it.
 * With neither, the menu writes the loaded rows and says so.
 */
export type DataTableExportOptions<TData> = {
  fileName?: string
  /** Toolbar and `ref.export` failures, the app's own included. `ref.export` also rejects. */
  onError?: (error: unknown, format: TableExportFormat) => void
} & (
  | {
      /** Server mode: the rows `request` describes, in the order to write them. */
      fetchRows: (request: DataTableExportRequest) => Promise<TData[]>
      onServerExport?: never
    }
  | {
      /** Server mode: have the backend write `request` as `format`, and download it. */
      onServerExport: (request: DataTableExportRequest, format: TableExportFormat) => void | Promise<void>
      fetchRows?: never
    }
  | { fetchRows?: never; onServerExport?: never }
)

/** Export-ready data: hand `columns` and `rows` to `exportTable`, or `request` to your backend. */
export type DataTableExportData<TData> = {
  /** They read any row of `TData`, including rows fetched for `request`. */
  columns: Array<TableExportColumn<TData>>
  /** The covered rows DataTable holds, in display order. */
  rows: TData[]
  /** Which rows are covered, e.g. to say "3 selected rows" before writing. */
  scope: DataTableExportScope
  /** Set when some covered rows are only on the server (server mode). Null when the grid holds them all. */
  request: DataTableExportRequest | null
}

/** Imperative access: `<DataTable ref={ref} />`. A controlled value changes through its `onChange` / `onQueryChange`. */
export type DataTableHandle<TData> = {
  /** Fit rendered content and a sample of up to 50 loaded values. Omit ids to fit visible columns. */
  fitColumns(columnIds?: string[]): void
  /** Back to `defaultQuery`: one change, reported once. */
  resetQuery(): void
  resetSorting(): void
  resetColumnFilters(): void
  resetRowSelection(): void
  resetColumnSelection(): void
  /** Column visibility, order and sizing back to `layout.defaults`, and the stored copy removed. */
  resetLayout(): void
  setPageIndex(pageIndex: number): void
  /** The selected rows DataTable holds (under `allMatching`: the loaded matching rows not excluded). */
  getSelectedRows(): TData[]
  getExportData(options?: { rows?: DataTableExportRows; columns?: DataTableExportColumns }): DataTableExportData<TData>
  /**
   * Exports as the toolbar's menu does. Rows beyond the loaded data go to
   * `exportable.fetchRows` or `onServerExport`; without either the promise
   * rejects unless `rows` is `'page'` or `'loaded'`. Failures also reach `exportable.onError`.
   */
  export(format: TableExportFormat, options?: { rows?: DataTableExportRows; columns?: DataTableExportColumns }): Promise<void>
}
