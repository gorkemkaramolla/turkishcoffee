'use client'

import { useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  functionalUpdate,
  useTable,
  type ColumnFiltersState,
  type RowData,
  type SortingState,
  type Updater,
} from '@tanstack/react-table'
import { DirectionProvider } from '@base-ui/react/direction-provider'
import { cn } from '../../lib/cn'
import { cssAttributeValue } from '../../lib/css'
import { isDev } from '../../lib/dev'
import { validateNonnegativeInteger, validatePageSize } from '../table/internal/pagination'
import { tableRowAppearanceClass } from '../table/internal/styles'
import { TablePagination, type TablePageSize } from '../table/table-pagination'
import { FlowBody, VirtualBody, type ListApi } from './internal/body'
import {
  ROW_WIDTH_CLASS,
  columnCanMove,
  columnClass,
  columnDefLeaves,
  moveColumn,
  orderedColumnIds,
  widthStyleSheet,
} from './internal/columns'
import { executeExport } from './internal/execute-export'
import { SkeletonRows } from './internal/skeleton-rows'
import { dataColumns, getExportData, selectedLoadedRows, type ExportContext } from './internal/export-columns'
import { createContainsFilterFn, resolveFilterSetup } from './internal/filter'
import { ROW_HEIGHT, type GridApi } from './internal/grid'
import { HeaderMenu, HeaderRow } from './internal/header-cell'
import { NO_SELECTION } from './internal/row-selection'
import { headerFollowsNatively, inlineScroll, mirrorHeader, setInlineScroll } from './internal/scroll'
import { SELECT_COLUMN_ID, SelectionHeaderContext, selectionColumn } from './internal/selection'
import { createSmartSortFn } from './internal/sort'
import { Toolbar } from './internal/toolbar'
import { useColumnDrag } from './internal/use-column-drag'
import { NO_COLUMNS, useColumnSelection } from './internal/use-column-selection'
import { useColumnFitting, useColumnSizing } from './internal/use-column-widths'
import { useColumnWindow, useVisibleColumns } from './internal/use-column-window'
import { useControllableState } from './internal/use-controllable-state'
import { cellId, useGridNavigation } from './internal/use-grid-navigation'
import { useLayoutState } from './internal/use-layout-state'
import { useHeldRows, useSelectionModel, useSelectionView } from './internal/use-row-selection'
import { AUTO_SIZE, DEFAULT_SIZE, MAX_SIZE, MIN_SIZE, isAuto } from './internal/widths'
import { dataTableFeatures, type DataTableColumn, type DataTableFilterVariant } from './features'
import { dataTableLabelsForLocale, type DataTableLabels } from './labels'
import { useLocale } from '../locale-provider/locale-provider'
import type {
  DataTableColumnSelectionOptions,
  DataTableExportOptions,
  DataTableHandle,
  DataTableLayoutOptions,
  DataTablePagination,
  DataTableQuery,
  DataTableQueryChange,
  DataTableSelectionOptions,
  DataTableServer,
} from './state'

type DataTableBaseProps<TData extends RowData> = {
  /** TanStack Table v9 column definitions: `DataTableColumn<Row>[]`. */
  columns: Array<DataTableColumn<TData>>
  data: TData[]
  /**
   * A stable id per row (e.g. `(row) => row.id`). Defaults to the row's index.
   * Needed for selections that outlive a sort, new data or a page change.
   */
  getRowId?: (row: TData, index: number) => string

  // ── Features ──────────────────────────────────────────────────────────────

  /**
   * Click a header to sort: ascending → descending → off; Shift+click adds a
   * second sort. Numbers, dates and booleans compare by value, text in the
   * page's language, and blanks always go last. Opt a column out with
   * `enableSorting: false`, or give it its own `sortFn`. With `server`, the
   * server sorts.
   */
  sortable?: boolean
  /**
   * Whether Shift+click adds a second sort (default `true`). `false` keeps one
   * sort column, Shift or not — for a backend that sorts by one column, so the
   * grid never shows a sort the server ignores.
   */
  multiSort?: boolean
  /**
   * Drag a column's right edge to resize it; double-click the edge to fit the
   * column to its content, as in Excel. Opt out per column with
   * `enableResizing: false`; bound it with `minSize` / `maxSize`.
   */
  resizable?: boolean
  /** Drag a header to move its column. Keep a column in place with `meta: { reorderable: false }`. */
  reorderable?: boolean
  /** Adds a "Columns" menu to show and hide columns. Opt a column out with `enableHiding: false`. */
  hideable?: boolean
  /**
   * Adds a checkbox column. `true`: boxes always visible; `'hover'`: a row's
   * box shows on hover, every box once anything is selected. The header box
   * works in two steps: this page, then every row matching the query (on the
   * server too); Shift+click selects a range. Options — the scope, the
   * eligible rows, the controlled selection — in {@link DataTableSelectionOptions}.
   */
  selectable?: boolean | 'hover' | DataTableSelectionOptions<TData>
  /** Alternate the body rows' background. Off by default. */
  striped?: boolean
  /**
   * Excel's column selection, from the thin strip above the headers. The first
   * click covers this page, the second every row, the third clears; Ctrl/⌘
   * adds a column, Shift a range, Escape clears.
   */
  selectableColumns?: boolean | DataTableColumnSelectionOptions
  /**
   * A filter per column, behind a funnel that shows on header hover: a
   * checklist, Min and Max, a calendar or "contains", by the column's
   * `meta.filter` or its values. Opt out per column with
   * `enableColumnFilter: false`, or give one its own `filterFn`. With
   * `server`, the server filters.
   */
  filterable?: boolean
  /**
   * Adds the toolbar's Export menu (CSV or Excel). It writes the selected
   * columns (else the visible ones) of the selected rows (else the rows the
   * column selection covers, else every filtered row). With `server`, rows
   * beyond the loaded page come from `fetchRows`, or the backend writes the
   * file through `onServerExport` ({@link DataTableExportOptions}).
   */
  exportable?: boolean | DataTableExportOptions<TData>

  // ── Layout and paging ─────────────────────────────────────────────────────

  /**
   * Total height in px. Setting it virtualizes the rows with react-window: only
   * the visible ones are in the DOM. Without it, rows render in normal flow —
   * up to 100; past that (a page size of 200 or All) the grid virtualizes on
   * its own, at most 640px of rows tall.
   */
  height?: number
  /** Row density: `sm` 32px, `md` 44px (compact and comfortable). */
  size?: 'sm' | 'md'
  /**
   * Render only the columns in view (plus some overscan) on each row. `'auto'`
   * (default) turns it on past 30 visible columns, where scrolling would
   * otherwise render every cell of every row that comes into view.
   */
  columnVirtualization?: boolean | 'auto'
  /**
   * The header row sticks to the top of the page while the rows scroll by
   * (default). `{ top }` leaves room for a fixed bar above it; `false` turns it off.
   */
  stickyHeader?: boolean | { top: number }
  /**
   * Rows per page; turns on the pagination bar. The uncontrolled query's
   * starting size: changing it later applies the new size and returns to the
   * first page. `'all'` is not offered with `server`. Server pages default to 25.
   */
  pageSize?: TablePageSize
  /** Choices in the page-size picker. Defaults to 10, 25, 50, 100, 200 and All (All left out with `server`). */
  pageSizeOptions?: TablePageSize[]
  /**
   * Server-side data: `data` is the current page; the backend sorts, filters
   * and pages it from the query (`onQueryChange`). DataTable never sorts or
   * filters a loaded page by itself.
   */
  server?: DataTableServer
  /**
   * Where the column layout (widths, order, visibility) is kept: `storageKey`
   * (this browser), or `saved` + `onChange` (a cookie, a backend), and the
   * `defaults` it resets to. {@link DataTableLayoutOptions}
   */
  layout?: DataTableLayoutOptions

  // ── Query: sorting, filters and page, as one value ───────────────────────

  /**
   * The controlled query. With it the app owns sorting, filters and page:
   * the grid shows exactly this and asks for changes through
   * `onQueryChange`. Without it the grid keeps the query, from `defaultQuery`.
   */
  query?: DataTableQuery
  /** The uncontrolled query's starting value, read once. Also where `ref.resetQuery()` returns. */
  defaultQuery?: Partial<DataTableQuery>
  /**
   * Every change to the query, whole: a new sort or filter also returns to the
   * first page, in the same call. `change` says which part the user changed.
   * On the server, fetch exactly `query` — one change, one request.
   */
  onQueryChange?: (query: DataTableQuery, change: DataTableQueryChange) => void

  /** Render only a window of rows. false keeps all rows in normal document flow; auto uses height or the 100-row threshold. */
  rowVirtualization?: boolean | 'auto'
  /** Fit once (default), fit after data changes, or use explicit/default widths. User sizes always win. */
  autoSize?: 'initial' | 'data' | false
  /** Custom content beside the built-in toolbar controls. */
  toolbar?: React.ReactNode
  /**
   * A request is in flight: a bar runs under the header, the grid is
   * `aria-busy`, paging pauses, and with no rows yet placeholder rows show.
   */
  loading?: boolean
  /** Initial loading content, outside the grid's data-row count. */
  loadingMessage?: React.ReactNode
  /** Error content; takes precedence over loading and empty content. */
  errorMessage?: React.ReactNode
  /** Accessible name of the grid. Supply this or aria-labelledby. */
  'aria-label'?: string
  /** ID of the visible heading naming the grid. */
  'aria-labelledby'?: string
  /** ID of instructions describing the grid. */
  'aria-describedby'?: string
  /** Explicit reading direction; defaults to ltr. */
  dir?: 'ltr' | 'rtl'

  // ── Misc ──────────────────────────────────────────────────────────────────

  /** Imperative access: resets, paging, selected rows, export data. */
  ref?: React.Ref<DataTableHandle<TData>>
  /**
   * Locale for the words the grid renders, sorting, filtering, numerals and
   * exports. Defaults to LocaleProvider's, else the page's `<html lang>`, else
   * en-US. English and Turkish words ship complete.
   */
  locale?: string
  /** Shown in place of rows when `data` is empty. Defaults to "No results." */
  emptyMessage?: React.ReactNode
  /** Single words to replace, over the locale's own. */
  labels?: Partial<DataTableLabels>
  /** Makes rows clickable (and focusable, Enter activates). Clicks on buttons and links inside a row are ignored. */
  onRowClick?: (row: TData) => void
  /** Applied to the outer wrapper (toolbar + grid + pagination row). */
  className?: string
}

/** Public grid props. Server selection requires a stable row identity. */
export type DataTableProps<TData extends RowData> = DataTableBaseProps<TData> & (
  | { server?: undefined }
  | { server: DataTableServer; selectable?: false }
  | {
      server: DataTableServer
      selectable: boolean | 'hover' | DataTableSelectionOptions<TData>
      getRowId: (row: TData, index: number) => string
    }
)

const NO_SORTING: SortingState = []
/** Placeholder rows while the first page loads. */
const SKELETON_ROWS = 8
const NO_FILTERS: ColumnFiltersState = []
/** Past this many rows on screen the grid virtualizes even without `height`. */
const AUTO_VIRTUAL_ROWS = 100
/** Body height of an automatically virtualized grid. */
const AUTO_VIRTUAL_HEIGHT = 640
/** Past this many visible columns, only the columns in view (plus overscan) render. */
const AUTO_VIRTUAL_COLUMNS = 30
/** A server page's size when the app sets none. */
const SERVER_PAGE_SIZE = 25
/** The page-size choices on the server: every row at once is not a page a backend serves. */
const SERVER_PAGE_SIZES: TablePageSize[] = [10, 25, 50, 100, 200]

/**
 * A data grid over TanStack Table v9. Every
 * interaction is one boolean away — `sortable`, `resizable` (with Excel's
 * double-click-to-fit), `reorderable`, `hideable`, `selectable`,
 * `selectableColumns`, `filterable`, `exportable` — and a feature's options
 * and state sit in its own prop, as an object in place of `true`. Sorting,
 * filters and page are one value, the query: controlled (`query` +
 * `onQueryChange`) or left to the grid (`defaultQuery`). Client-side by
 * default; `server` hands the query to a backend. Import from
 * `turkishcoffee/data-table`. For a static table use the root `Table`
 * primitives instead. Selected rows are grey; `selectable={{ color: 'primary' }}`
 * tints them with the brand. `striped` alternates the body rows between
 * `--table-row-odd` and `--table-row-even`, including virtualized rows; hover
 * and selection override the alternating background.
 *
 * Use `toolbar` for search and status filters beside the column controls. When
 * rows or columns are selected, an inline bar groups the selection count,
 * export (when enabled) and a visible clear-selection button above the grid.
 *
 * Keyboard: the grid is one tab stop. Arrows, Home/End, Ctrl+Home/End and
 * PageUp/PageDown move the active cell; F2 (or Enter on a cell without its own
 * action) moves focus into the cell's controls and Escape returns to the grid.
 * Enter sorts a header, Alt+↓ opens its menu, Shift+Space selects a row,
 * Ctrl+Space a column, Ctrl+A every row. In `dir="rtl"` the arrows follow the
 * reading direction.
 *
 * Not supported: grouped (nested) column headers, footers, cell editing, tree
 * rows and variable-height rows. Rows are fixed-height and single-line, and
 * `columns` must be leaf columns.
 *
 * @example
 * const columns: DataTableColumn<Payment>[] = [
 *   { accessorKey: 'email', header: 'Email' },
 *   {
 *     accessorKey: 'amount',
 *     header: 'Amount',
 *     cell: (info) => `$${info.getValue<number>().toFixed(2)}`,
 *     meta: { align: 'end' },
 *   },
 * ]
 *
 * <DataTable aria-label="Payments" columns={columns} data={payments} sortable resizable reorderable hideable pageSize={25} />
 *
 * @example <caption>Server data: one query, one request</caption>
 * const [query, setQuery] = useState<DataTableQuery>({
 *   sorting: [], columnFilters: [], pagination: { pageIndex: 0, pageSize: 25 },
 * })
 * const { data, isFetching, error } = useQuery({ queryKey: ['orders', query], queryFn: () => fetchOrders(query) })
 *
 * <DataTable
 *   aria-label="Orders"
 *   columns={columns}
 *   data={data?.rows ?? []}
 *   getRowId={(row) => row.id} // required with server + selectable
 *   server={{ rowCount: data?.total ?? 0 }}
 *   loading={isFetching}
 *   errorMessage={error ? 'Orders could not be loaded.' : undefined}
 *   sortable filterable selectable
 *   // A sort on page 3 arrives here once, already on page 1.
 *   query={query} onQueryChange={setQuery}
 *   exportable={{
 *     // The grid writes the file from rows the app fetches...
 *     fetchRows: (request) => api.fetchOrdersForExport(request),
 *     onError: () => toast.error('Export failed'),
 *   }}
 * />
 *
 * @example <caption>Restricted selection</caption>
 * // Only open invoices can be selected. The backend counts them, so "every
 * // matching row" stays available; it checks eligibility again when it acts.
 * <DataTable aria-label="Invoices" columns={columns} data={page} getRowId={(row) => row.id}
 *   server={{ rowCount }}
 *   selectable={{ isRowSelectable: (row) => row.status === 'open', selectableRowCount: openCount, scopeKey: search }} />
 *
 * @example <caption>Custom filter control and toolbar</caption>
 * const MinimumAmount = ({ value, onApply, close }: DataTableFilterControlProps) => (
 *   <form onSubmit={(event) => { event.preventDefault(); onApply(Number(new FormData(event.currentTarget).get('min'))) }}>
 *     <Input name="min" type="number" defaultValue={typeof value === 'number' ? value : ''} />
 *     <Button type="submit">Apply</Button> <Button variant="ghost" onClick={close}>Cancel</Button>
 *   </form>
 * )
 * const columns: DataTableColumn<Invoice>[] = [{
 *   accessorKey: 'amount', header: 'Amount',
 *   filterFn: (row, id, min) => row.getValue<number>(id) >= (min as number),
 *   meta: { align: 'end', filter: { control: MinimumAmount } },
 * }]
 *
 * <DataTable aria-label="Invoices" columns={columns} data={invoices} filterable
 *   toolbar={<Button size="sm" onClick={openNewInvoice}>New invoice</Button>} />
 *
 * @example <caption>Server export written by the backend</caption>
 * <DataTable aria-label="Orders" columns={columns} data={page} server={{ rowCount }}
 *   exportable={{
 *     onServerExport: async (request, format) => download(await api.exportOrders(request, format)),
 *     onError: () => toast.error('Export failed'),
 *   }} />
 *
 * @example <caption>Imperative export with error handling</caption>
 * const ref = useRef<DataTableHandle<Invoice>>(null)
 * try {
 *   await ref.current?.export('xlsx', { rows: 'loaded' })
 * } catch {
 *   // Already reported to exportable.onError; the promise rejects as well.
 * }
 *
 * @example <caption>Turkish locale, right-to-left, printing</caption>
 * // Locale drives sorting, the "contains" filter, numeric labels and exports (default en-US).
 * <DataTable aria-label="Çalışanlar" locale="tr-TR" columns={columns} data={rows} />
 * <DataTable aria-label="الموظفون" dir="rtl" columns={columns} data={rows} />
 * // Every row in normal flow (no virtualization), e.g. for a print view.
 * <DataTable aria-label="Report" rowVirtualization={false} columns={columns} data={rows} />
 */
export function DataTable<TData extends RowData>(props: DataTableProps<TData>) {
  const {
    columns,
    data,
    getRowId,
    sortable = false,
    multiSort = true,
    resizable = false,
    reorderable = false,
    hideable = false,
    selectable = false,
    striped = false,
    selectableColumns = false,
    filterable = false,
    exportable = false,
    height,
    size = 'md',
    stickyHeader = true,
    columnVirtualization = 'auto',
    pageSize,
    server,
    defaultQuery,
    locale: localeProp,
    autoSize = 'initial',
    rowVirtualization = 'auto',
    dir = 'ltr',
    toolbar,
    emptyMessage,
    labels: labelOverrides,
    onRowClick,
    errorMessage,
    loading = false,
    className,
    ref,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
  } = props

  // ── Configuration ───────────────────────────────────────────────────────

  if (server && selectable && !getRowId) throw new Error('DataTable: server selection requires getRowId.')
  if (columns.some((column) => 'columns' in column && column.columns !== undefined)) {
    throw new Error('DataTable: grouped columns are unsupported; provide leaf columns.')
  }
  useEffect(() => {
    if (isDev && !ariaLabel && !ariaLabelledBy) console.warn('DataTable: supply aria-label or aria-labelledby to name the grid.')
  }, [ariaLabel, ariaLabelledBy])

  const selecting = Boolean(selectable)
  const selectionOptions: DataTableSelectionOptions<TData> =
    typeof selectable === 'object' ? selectable : selectable === 'hover' ? { checkboxes: 'hover' } : {}
  const { isRowSelectable, scope: selectionScope = 'crossPage', color: selectionColor = 'neutral' } = selectionOptions
  const columnSelecting = Boolean(selectableColumns)
  const columnSelectionOptions = typeof selectableColumns === 'object' ? selectableColumns : {}
  const exportOptions = exportable === true ? {} : exportable || null

  const locale = useLocale(localeProp)
  const labels = useMemo(() => ({ ...dataTableLabelsForLocale(locale), ...labelOverrides }), [locale, labelOverrides])
  // Server rows with isRowSelectable: unless the backend counts the eligible
  // rows, nothing past the loaded page can be selected — explicit ids only.
  const restrictedServer = Boolean(server && isRowSelectable && selectionOptions.selectableRowCount === undefined)
  const rowHeight = ROW_HEIGHT[size]
  const gridId = useId()
  const paginated =
    pageSize !== undefined || !!server || defaultQuery?.pagination !== undefined || props.query?.pagination !== undefined
  const pageSizeOptions = server
    ? (props.pageSizeOptions ?? SERVER_PAGE_SIZES).filter((option) => option !== 'all')
    : props.pageSizeOptions

  // ── State: one source each ──────────────────────────────────────────────

  // Sorting, filters and page are one value: a change that resets the page
  // along with it is still one change, reported once.
  const firstPagination = (): DataTablePagination => ({
    pageIndex: 0,
    pageSize: pageSize ?? (server ? SERVER_PAGE_SIZE : 'all'),
  })
  const [query, setQuery] = useControllableState<DataTableQuery, [DataTableQueryChange]>(
    props.query,
    () => ({
      sorting: defaultQuery?.sorting ?? NO_SORTING,
      columnFilters: defaultQuery?.columnFilters ?? NO_FILTERS,
      ...(paginated ? { pagination: defaultQuery?.pagination ?? firstPagination() } : {}),
    }),
    props.onQueryChange,
  )
  const { sorting, columnFilters } = query
  const fallbackSize = pageSize ?? (server ? SERVER_PAGE_SIZE : 'all')
  const pagination = useMemo<DataTablePagination>(
    () => query.pagination ?? { pageIndex: 0, pageSize: paginated ? fallbackSize : 'all' },
    [query.pagination, paginated, fallbackSize],
  )
  // The query with its page, as the app hears it.
  const withPagination = (next: DataTableQuery, page: DataTablePagination) => (paginated ? { ...next, pagination: page } : next)
  const updateQuery = useCallback(
    (key: 'sorting' | 'columnFilters', updater: Updater<SortingState> | Updater<ColumnFiltersState>) =>
      setQuery((current) => {
        const value = functionalUpdate(updater as Updater<unknown>, current[key])
        if (value === current[key]) return current
        // A new sort or filter starts again from the first page.
        const page = current.pagination ?? firstPagination()
        return withPagination({ ...current, [key]: value }, page.pageIndex === 0 ? page : { ...page, pageIndex: 0 })
      }, key),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- firstPagination/withPagination read only props
    [setQuery, paginated, pageSize, server],
  )
  const setSorting = useCallback((updater: Updater<SortingState>) => updateQuery('sorting', updater), [updateQuery])
  const setColumnFilters = useCallback((updater: Updater<ColumnFiltersState>) => updateQuery('columnFilters', updater), [updateQuery])
  const setPagination = useCallback(
    (updater: Updater<DataTablePagination>) =>
      setQuery((current) => {
        const page = current.pagination ?? firstPagination()
        const next = functionalUpdate(updater, page)
        return next.pageIndex === page.pageIndex && next.pageSize === page.pageSize ? current : { ...current, pagination: next }
      }, 'pagination'),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- firstPagination reads only props
    [setQuery, pageSize, server],
  )

  const [selection, setSelection] = useControllableState(
    selectionOptions.value,
    selectionOptions.defaultValue ?? NO_SELECTION,
    selectionOptions.onChange,
  )
  const [columnSelection, setColumnSelection] = useControllableState(
    columnSelectionOptions.value,
    columnSelectionOptions.defaultValue ?? NO_COLUMNS,
    columnSelectionOptions.onChange,
  )

  validatePageSize(pagination.pageSize)
  validateNonnegativeInteger(pagination.pageIndex, 'pageIndex')
  if (pageSize !== undefined) validatePageSize(pageSize)
  if (server) validateNonnegativeInteger(server.rowCount, 'rowCount')
  if (restrictedServer && selection.type === 'allMatching') {
    throw new Error('DataTable: server selection with isRowSelectable and no selectableRowCount must use explicit IDs.')
  }

  const layout = useLayoutState({
    columns: columns as Parameters<typeof useLayoutState>[0]['columns'],
    selectable: selecting,
    layout: props.layout,
    resizable,
    reorderable,
    hideable,
  })
  const { userSizing, setUserSizing, columnOrder, setColumnOrder, columnVisibility, setColumnVisibility } = layout

  // ── The table ───────────────────────────────────────────────────────────

  const selectionModel = useSelectionModel({
    data,
    getRowId,
    selectable: selecting,
    isRowSelectable,
    selection,
    setSelection,
  })
  const heldRows = useHeldRows({ server: !!server, selection, ids: selectionModel.ids, data })

  const checkboxes = selectionOptions.checkboxes ?? 'always'
  const allColumns = useMemo(
    () => (selecting ? [selectionColumn<TData>(checkboxes, labels), ...columns] : columns),
    [selecting, checkboxes, labels, columns],
  )
  const leaves = useMemo(() => columnDefLeaves(allColumns as Parameters<typeof columnDefLeaves>[0]), [allColumns])
  const sizing = useColumnSizing({ leaves, visibility: columnVisibility, userSizing, autoSize })
  const { columnSizing } = sizing

  const defaultColumn = useMemo(
    () => ({
      sortFn: createSmartSortFn<TData>(locale),
      filterFn: createContainsFilterFn<TData>(locale),
      sortDescFirst: false,
      // Blanks are handled by the sortFn, which keeps them last both ways.
      sortUndefined: false as const,
      size: autoSize === false ? DEFAULT_SIZE : AUTO_SIZE,
      minSize: MIN_SIZE,
      maxSize: MAX_SIZE,
    }),
    [locale, autoSize],
  )

  const table = useTable({
    features: dataTableFeatures,
    columns: allColumns,
    data,
    getRowId,
    defaultColumn,
    state: { sorting, columnFilters, columnSizing, columnOrder, columnVisibility, rowSelection: selectionModel.selectionMap },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: selectionModel.onRowSelectionChange,
    // Only widths the user changed are state (and stored); fitted ones stay automatic.
    onColumnSizingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(columnSizing) : updater
      if (!Object.keys(next).length) return setUserSizing({})
      const changed = Object.keys(next).filter((id) => next[id] !== columnSizing[id])
      if (changed.length === 1) return resizeColumn(changed[0]!, next[changed[0]!]!)
      setUserSizing((current) => {
        const result = { ...current }
        for (const id of changed) result[id] = next[id]!
        return result
      })
    },
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    enableSorting: sortable,
    // Covers the header click and the keyboard's Shift+Enter alike.
    enableMultiSort: multiSort,
    enableColumnResizing: resizable,
    enableHiding: hideable,
    enableRowSelection: selecting ? (row) => isRowSelectable?.(row.original) ?? true : false,
    columnResizeDirection: dir,
    enableColumnFilters: filterable,
    columnResizeMode: 'onChange',
    // DataTable pages the rows itself (below), so a page index can be clamped
    // before it renders. A server sorts and filters its own data.
    manualPagination: true,
    manualSorting: !!server,
    manualFiltering: !!server,
  })

  // The latest table for callbacks and effects. TanStack hands out a new
  // wrapper object every render; nothing below depends on its identity.
  const tableRef = useRef(table)
  // Each column's filter kind once its values have shown it (see resolveFilterSetup).
  const filterKinds = useRef(new Map<string, DataTableFilterVariant>())
  useLayoutEffect(() => {
    tableRef.current = table
  })

  // ── Rows and pages ──────────────────────────────────────────────────────

  // Every filtered, sorted row (client), or the server's page.
  const allRows = table.getRowModel().rows
  const total = server ? server.rowCount : allRows.length
  const pageLength = !paginated || pagination.pageSize === 'all' ? Math.max(total, 1) : pagination.pageSize
  const lastPage = Math.max(Math.ceil(total / pageLength) - 1, 0)
  // Clamped before rendering: data that shrank never shows an empty page.
  const pageIndex = Math.min(Math.max(pagination.pageIndex, 0), lastPage)
  const rows = useMemo(
    () => (server || !paginated ? allRows : allRows.slice(pageIndex * pageLength, pageIndex * pageLength + pageLength)),
    [allRows, server, paginated, pageIndex, pageLength],
  )
  // ...and the state follows, so the parent hears about it.
  useLayoutEffect(() => {
    if (paginated && pageIndex !== pagination.pageIndex) setPagination({ ...pagination, pageIndex })
  }, [paginated, pageIndex, pagination, setPagination])

  // A new `pageSize` prop is a new starting size: apply it, back to page one.
  const pageSizeSeen = useRef(pageSize)
  useLayoutEffect(() => {
    if (pageSizeSeen.current === pageSize) return
    pageSizeSeen.current = pageSize
    if (pageSize !== undefined && props.query === undefined) setPagination({ pageIndex: 0, pageSize })
  }, [pageSize, props.query, setPagination])

  // ── Selection ───────────────────────────────────────────────────────────

  const scopeKey = selectionOptions.scopeKey
  const view = useMemo(
    () => ({ pageIndex, pageLength, sorting, columnFilters, scopeKey }),
    [pageIndex, pageLength, sorting, columnFilters, scopeKey],
  )
  const rowSelection = useSelectionView({
    selectable: selecting,
    isRowSelectable,
    server: !!server,
    restricted: restrictedServer,
    scope: selectionScope,
    selection,
    setSelection,
    model: selectionModel,
    allRows,
    pageRows: rows,
    // On the server with isRowSelectable, the backend's count of eligible rows.
    total: server && isRowSelectable && selectionOptions.selectableRowCount !== undefined ? selectionOptions.selectableRowCount : total,
    view,
  })
  const selectionHeader = { state: rowSelection.headerState, total: rowSelection.selectableTotal, advance: rowSelection.advance }

  const selectableColumnIds = new Set(dataColumns(table).map((column) => column.id))
  const columnPicker = useColumnSelection(() => dataColumns(tableRef.current).map((column) => column.id), setColumnSelection)
  const selectedColumns = columnSelecting ? columnSelection.ids.filter((id) => selectableColumnIds.has(id)) : []
  const selectedColumnSet = new Set(selectedColumns)

  // ── Columns: order, window, widths ──────────────────────────────────────

  const { visibleColumns, headers, columnsKey, columnIds, columnSizes } = useVisibleColumns(table)

  const frameRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const headerScrollRef = useRef<HTMLDivElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)
  // Also state: react-window hands over its element a render after it mounts,
  // and the effects that watch the scroller must run when it arrives.
  const [scroller, setScrollerElement] = useState<HTMLDivElement | null>(null)
  const setScroller = useCallback((element: HTMLDivElement | null) => {
    scrollerRef.current = element
    setScrollerElement(element)
  }, [])
  // react-window's element comes after the first fit: its box is read on
  // arrival, in the same commit (the plain body's is read with the fit).
  const readBox = sizing.readBox
  const setListScroller = useCallback(
    (element: HTMLDivElement | null) => {
      setScroller(element)
      readBox(element)
    },
    [setScroller, readBox],
  )

  const reorder = (columnId: string, beforeId: string | null) => {
    const all = table.getAllLeafColumns()
    const fixed = new Set(all.filter((column) => !columnCanMove(column)).map((column) => column.id))
    const order = orderedColumnIds(all.map((column) => column.id), columnOrder)
    table.setColumnOrder(moveColumn(order, columnId, beforeId, fixed))
  }
  const move = (columnId: string, direction: -1 | 1) => {
    const visible = table.getVisibleLeafColumns()
    const movable = visible.filter((column) => columnCanMove(column))
    const neighbour = movable[movable.findIndex((column) => column.id === columnId) + direction]
    if (!neighbour) return
    if (direction === -1) return reorder(columnId, neighbour.id)
    const after = visible[visible.findIndex((column) => column.id === neighbour.id) + 1]
    reorder(columnId, after?.id ?? null)
  }
  const dragColumns = useCallback(
    () => tableRef.current.getVisibleLeafColumns().map((column) => ({ id: column.id, size: column.getSize(), fixed: !columnCanMove(column) })),
    [],
  )
  const { drag, startDrag } = useColumnDrag({
    frameRef,
    scrollerRef,
    headerScrollRef,
    placeholderRef,
    dir,
    getColumns: dragColumns,
    onDrop: reorder,
  })

  // ── Keyboard navigation ─────────────────────────────────────────────────

  const virtual =
    rowVirtualization === true || (rowVirtualization === 'auto' && (height !== undefined || rows.length > AUTO_VIRTUAL_ROWS))
  const listHeight =
    height !== undefined ? Math.max(height - rowHeight - 1, rowHeight) : Math.min(rows.length * rowHeight, AUTO_VIRTUAL_HEIGHT)
  // Loading with nothing to show yet: placeholder rows under the real headers,
  // unless the app brought its own loading content.
  const skeleton =
    loading && errorMessage == null && !rows.length && props.loadingMessage === undefined && visibleColumns.length > 0
  const virtualColumns = columnVirtualization === 'auto' ? visibleColumns.length > AUTO_VIRTUAL_COLUMNS : columnVirtualization
  // aria-rowindex is 1-based and counts the header row.
  const firstRowIndex = (paginated && pagination.pageSize !== 'all' ? pageIndex * pageLength : 0) + 2
  const listApiRef = useRef<ListApi | null>(null)
  const [menu, setMenu] = useState<{ columnId: string; anchor: HTMLElement } | null>(null)
  const openMenu = (columnId: string, anchor: HTMLElement) => setMenu({ columnId, anchor })
  const rowIds = useMemo(() => rows.map((row) => row.id), [rows])
  const startsRef = useRef<readonly number[]>([])

  const navigation = useGridNavigation({
    frameRef,
    firstRow: firstRowIndex,
    lastRow: rows.length ? firstRowIndex + rows.length - 1 : 1,
    colCount: visibleColumns.length,
    rowIds,
    columnIds,
    dir,
    pageStep: virtual ? Math.max(Math.floor(listHeight / rowHeight) - 1, 1) : 10,
    revealRow: (row) => {
      if (virtual) listApiRef.current?.scrollToRow({ index: row - firstRowIndex, align: 'smart', behavior: 'instant' })
    },
    revealColumn: (col) => {
      const scroller = scrollerRef.current
      const start = startsRef.current[col - 1]
      const width = columnSizes[col - 1]
      if (!virtualColumns || !scroller || start === undefined || width === undefined) return
      const offset = inlineScroll(scroller, dir)
      if (start < offset) setInlineScroll(scroller, start, dir)
      else if (start + width > offset + scroller.clientWidth) setInlineScroll(scroller, start + width - scroller.clientWidth, dir)
    },
    onCellKey: (position, event) => {
      const column = visibleColumns[position.col - 1]
      if (!column) return false
      const ctrl = event.ctrlKey || event.metaKey
      const space = event.key === ' '

      // Ctrl+Space selects the column (Excel); Shift adds the range.
      if (ctrl && space && columnSelecting && selectableColumnIds.has(column.id)) {
        columnPicker.select(column.id, { ctrlKey: false, metaKey: false, shiftKey: event.shiftKey })
        return true
      }
      // Ctrl+A selects every row (crossPage: every matching row; page scope: this page).
      if (ctrl && event.key.toLowerCase() === 'a' && selecting) {
        rowSelection.selectAll()
        return true
      }

      if (position.row === 1) {
        if (column.id === SELECT_COLUMN_ID && (space || event.key === 'Enter')) {
          rowSelection.advance()
          return true
        }
        if ((space || event.key === 'Enter') && sortable && column.getCanSort()) {
          column.toggleSorting(undefined, event.shiftKey)
          return true
        }
        if (event.altKey && event.key === 'ArrowDown') {
          const chevron = frameRef.current?.querySelector<HTMLElement>(
            `[role="row"][aria-rowindex="1"] > [aria-colindex="${position.col}"] [aria-haspopup="menu"]`,
          )
          if (!chevron) return false
          openMenu(column.id, chevron)
          return true
        }
        return false
      }

      const row = rows[position.row - firstRowIndex]
      if (!row) return false
      // Shift+Space selects the row (Excel); Space on the checkbox column toggles it.
      if (selecting && space && (event.shiftKey || column.id === SELECT_COLUMN_ID)) {
        if (row.getCanSelect()) row.toggleSelected()
        return true
      }
      if (event.key === 'Enter' && onRowClick) {
        onRowClick(row.original)
        return true
      }
      return false
    },
  })

  // Columns in view, plus the active and the dragged column kept mounted outside the window.
  const dragIndex = drag ? columnIds.indexOf(drag.columnId) : -1
  const { window: columnWindow, starts: columnStarts, update: updateWindow } = useColumnWindow({
    enabled: virtualColumns,
    sizes: columnSizes,
    scrollerRef,
    dir,
    retained: useMemo(
      () => [navigation.active.col - 1, dragIndex].filter((index) => index >= 0),
      [navigation.active.col, dragIndex],
    ),
  })
  useLayoutEffect(() => {
    startsRef.current = columnStarts
  })

  const { estimatedWidths, resizeColumn, endResize, autofit, resizeBy, lockedEdges, noteScroll } = useColumnFitting({
    table,
    frameRef,
    scrollerRef,
    scroller,
    sizing,
    userSizing,
    setUserSizing,
    autoSize,
    data,
    columns: allColumns,
    size,
    sampleRows: rows,
    features: { sortable, filterable, hideable, resizable, reorderable },
    window: columnWindow,
    savedAutoSizing: layout.persisted.layout.columnAutoSizing,
    persistAutoSizing: layout.persistent ? (widths) => layout.persisted.update('columnAutoSizing', widths) : undefined,
  })

  // Keep the resize cursor even when the pointer outruns the handle.
  const resizingColumn = table.state.columnResizing.isResizingColumn
  useEffect(() => {
    if (!resizingColumn) return endResize()
    const { style } = document.body
    style.cursor = 'col-resize'
    style.userSelect = 'none'
    return () => {
      style.cursor = ''
      style.userSelect = ''
    }
  }, [resizingColumn, endResize])

  // Escape clears the column selection while focus is in the grid.
  const clearColumns = columnPicker.clear
  useEffect(() => {
    const frame = frameRef.current
    if (!frame || !selectedColumns.length) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && event.target === frame) clearColumns()
    }
    frame.addEventListener('keydown', onKey)
    return () => frame.removeEventListener('keydown', onKey)
  }, [selectedColumns.length, clearColumns])

  // ── Scrolling: the header strip mirrors the body ────────────────────────

  const syncHeader = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      mirrorHeader(headerScrollRef.current, event.currentTarget)
      noteScroll()
      updateWindow()
    },
    [updateWindow, noteScroll],
  )
  const syncBody = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    // Tabbing to an off-screen header scrolls the header strip by itself.
    const body = scrollerRef.current
    const header = event.currentTarget
    if (!body) return
    if (headerFollowsNatively()) {
      // The strip's own scroll is on top of the body's: hand it to the body,
      // which carries the header along, and zero the strip again.
      if (header.scrollLeft === 0) return
      body.scrollLeft += header.scrollLeft
      header.scrollLeft = 0
    } else if (body.scrollLeft !== header.scrollLeft) body.scrollLeft = header.scrollLeft
  }, [])


  // ── Export and the imperative handle ────────────────────────────────────

  const latest = useRef({ rows, selection, columnSelection })
  useLayoutEffect(() => {
    latest.current = { rows, selection, columnSelection }
  })
  const exportContext = (): ExportContext<TData> => ({
    table: tableRef.current,
    pageRows: latest.current.rows,
    selection: latest.current.selection,
    columnSelection: latest.current.columnSelection,
    scopeKey,
    serverRowCount: server ? server.rowCount : null,
    heldRows: heldRows.current,
  })

  useImperativeHandle(
    ref,
    (): DataTableHandle<TData> => ({
      resetQuery: () =>
        setQuery(
          (current) =>
            withPagination(
              { sorting: defaultQuery?.sorting ?? NO_SORTING, columnFilters: defaultQuery?.columnFilters ?? NO_FILTERS },
              defaultQuery?.pagination ?? { pageIndex: 0, pageSize: (current.pagination ?? firstPagination()).pageSize },
            ),
          'reset',
        ),
      resetSorting: () => setSorting(defaultQuery?.sorting ?? NO_SORTING),
      resetColumnFilters: () => setColumnFilters(defaultQuery?.columnFilters ?? NO_FILTERS),
      resetRowSelection: () => setSelection(NO_SELECTION),
      resetColumnSelection: () => setColumnSelection(NO_COLUMNS),
      resetLayout: layout.resetLayout,
      setPageIndex: (index) => setPagination((current) => ({ ...current, pageIndex: index })),
      getSelectedRows: () => selectedLoadedRows(tableRef.current, latest.current.selection).map((row) => row.original),
      fitColumns: (ids) =>
        autofit(ids ?? tableRef.current.getVisibleLeafColumns().filter((column) => column.getCanResize()).map((column) => column.id)),
      getExportData: (options) => getExportData(exportContext(), options),
      export: (format, options) => executeExport(getExportData(exportContext(), options), format, { ...exportOptions, locale }),
    }),
  )

  // ── Header API (stable) ─────────────────────────────────────────────────

  // The header cells are memoized, so `grid` stays the same object while
  // nothing it describes changes: the actions reach their latest version through a ref.
  const filterSetup = (columnId: string, value: unknown) => {
    const current = tableRef.current
    const column = current.getColumn(columnId)
    if (!column) return { variant: 'text' as const }
    return resolveFilterSetup({
      column,
      // Every row before filtering on the client; the loaded page on the server.
      rows: current.getCoreRowModel().rows,
      value,
      server: Boolean(server),
      seen: filterKinds.current,
      labels,
      locale,
    })
  }
  const actions = { autofit, resizeBy, move, startDrag, selectColumn: columnPicker.select, openMenu, filterSetup }
  const actionsRef = useRef(actions)
  useLayoutEffect(() => {
    actionsRef.current = actions
  })
  const grid = useMemo<GridApi>(
    () => ({
      dir,
      locale,
      sortable,
      resizable,
      reorderable,
      hideable,
      filterable,
      columnSelection: columnSelecting,
      labels,
      autofit: (columnIds) => actionsRef.current.autofit(columnIds),
      resizeBy: (columnId, delta) => actionsRef.current.resizeBy(columnId, delta),
      move: (columnId, direction) => actionsRef.current.move(columnId, direction),
      startDrag: (event, columnId) => actionsRef.current.startDrag(event, columnId),
      selectColumn: (columnId, modifiers) => actionsRef.current.selectColumn(columnId, modifiers),
      openMenu: (columnId, anchor) => actionsRef.current.openMenu(columnId, anchor),
      filterSetup: (columnId, value) => actionsRef.current.filterSetup(columnId, value),
    }),
    [sortable, resizable, reorderable, hideable, filterable, columnSelecting, labels, dir, locale],
  )

  // ── Render ──────────────────────────────────────────────────────────────

  // The widths as one stylesheet scoped to this grid: a resize rewrites the
  // rules, and only the cells of the resized columns restyle. No row re-renders.
  const { measured } = sizing.fit
  const widthCss = widthStyleSheet(
    gridId,
    visibleColumns.map((column) => {
      // Before the first measurement (the server render) an automatic column gets
      // an estimate from its text, stretched over the row the way the fitted
      // widths will be (in proportion; no shrinking: wider tables scroll).
      const estimate = !measured && isAuto(column.columnDef.size) ? userSizing[column.id] ?? estimatedWidths[column.id] : undefined
      return { id: column.id, flex: estimate !== undefined ? `${estimate} 0 ${estimate}px` : `0 0 ${column.getSize()}px` }
    }),
    measured ? `${table.getTotalSize()}px` : '100%',
  )

  const bodyProps = {
    rows,
    firstRowIndex,
    rowHeight,
    onRowClick,
    columns: allColumns,
    columnsKey,
    rowSelection: selectionModel.selectionMap,
    columnWindow,
    active: navigation.active,
    idPrefix: gridId,
  }
  // The scroll-driven header (theme.css) maps the body's scroll progress onto
  // a translate; it needs the body's scrollable distance to turn progress into pixels.
  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame || !scroller || !headerFollowsNatively()) return
    const measure = () => frame.style.setProperty('--dt-scroll-max', `${scroller.scrollWidth - scroller.clientWidth}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(scroller)
    if (scroller.firstElementChild) observer.observe(scroller.firstElementChild)
    return () => observer.disconnect()
  }, [scroller, widthCss, visibleColumns.length, rows.length])

  const sticky = stickyHeader !== false
  const showToolbar =
    hideable || filterable || Boolean(exportOptions) || selecting || columnSelecting || Boolean(toolbar)

  return (
    <DirectionProvider direction={dir}>
      {/*
        min-w-0: in a grid or flex parent the table's full width would otherwise
        become its minimum, and wide columns would widen the page instead of
        scrolling inside the frame.
      */}
      <div dir={dir} className={cn('flex min-w-0 flex-col gap-3', className)}>
        {showToolbar && (
          <Toolbar
            custom={toolbar}
            table={table}
            labels={labels}
            selectedRows={rowSelection.selectedRowCount}
            hiddenSelectedRows={rowSelection.hiddenSelectedRows}
            offPageSelectedRows={rowSelection.offPageSelectedRows}
            selectionColor={selectionColor}
            rowScope={rowSelection.headerState}
            matchingRows={selecting && rowSelection.matchingIds ? rowSelection.selectableTotal : total}
            pageRows={rows.length}
            onSelectAllRows={rowSelection.selectAllMatching}
            onClearRows={rowSelection.clearSelection}
            selectedColumns={selectedColumns.length}
            columnScope={columnSelection.scope}
            onClearColumns={clearColumns}
            onWidenColumns={columnPicker.widen}
            exportable={exportOptions && { ...exportOptions, locale }}
            prepareExport={() => getExportData(exportContext())}
            hideable={hideable}
            onResetLayout={layout.resetLayout}
          />
        )}

        {/*
          The bordered frame: the grid, then (below its header) the status line.
          The status sits outside role="grid", so it is not counted as a row.
        */}
        <div
          className={cn(
            // clip, not hidden: `overflow: hidden` would make the frame a scroll
            // container and stop the header from sticking to the page.
            'overflow-clip rounded-md border border-border bg-background',
            tableRowAppearanceClass({ striped, selectionColor }),
            'has-[[role=grid]:focus-visible]:ring-2 has-[[role=grid]:focus-visible]:ring-ring',
          )}
        >
          <SelectionHeaderContext value={selectionHeader}>
            <div
              ref={frameRef}
              role="grid"
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
              // The grid is the one tab stop; arrow keys move the active cell (aria-activedescendant).
              tabIndex={0}
              aria-activedescendant={visibleColumns.length ? cellId(gridId, navigation.active) : undefined}
              onKeyDown={navigation.onKeyDown}
              onPointerDown={navigation.onPointerDown}
              aria-rowcount={total + 1}
              aria-colcount={visibleColumns.length}
              aria-multiselectable={selecting || undefined}
              aria-busy={loading || undefined}
              data-dt={gridId}
              data-has-selection={rowSelection.selectedRowCount > 0 ? '' : undefined}
              className="relative overflow-clip outline-none"
              // Which way the scroll-driven header moves: content slides left in LTR, right in RTL.
              style={{ '--dt-scroll-sign': dir === 'rtl' ? 1 : -1 } as React.CSSProperties}
            >
              <style data-widths="">{widthCss}</style>
              {/*
                One structure in both modes: the header strip, then the body that
                scrolls sideways (and, virtualized, down). The strip mirrors the
                body's horizontal scroll, and can stick to the top of the page.
              */}
              <div
                ref={headerScrollRef}
                role="rowgroup"
                onScroll={syncBody}
                className={cn('overflow-hidden bg-[var(--table-header)]', sticky ? 'sticky z-20' : 'relative')}
                style={{
                  // The header sits outside the scrolling body: the body's
                  // scrollbar width keeps the last column aligned.
                  paddingInlineEnd: sizing.box.scrollbar,
                  top: sticky ? (typeof stickyHeader === 'object' ? stickyHeader.top : 0) : undefined,
                }}
              >
                <div className={ROW_WIDTH_CLASS} data-dt-header-row="">
                  <HeaderRow
                    grid={grid}
                    headers={headers}
                    rowHeight={rowHeight}
                    dragColumnId={drag?.columnId ?? null}
                    multiSort={sorting.length > 1}
                    selectedColumns={selectedColumnSet}
                    selectableColumns={selectableColumnIds}
                    columnScope={columnSelection.scope}
                    allRowsSelection={rowSelection.headerState}
                    menuColumnId={menu?.columnId ?? null}
                    columnWindow={columnWindow}
                    activeColumn={navigation.active.row === 1 ? navigation.active.col : null}
                    idPrefix={gridId}
                    lockedEdges={lockedEdges}
                  />
                </div>
                {loading && errorMessage == null && (
                  // A hairline travels the header edge instead of dimming the rows:
                  // dimmed text falls below WCAG contrast while it stays readable.
                  // aria-busy tells assistive technology.
                  <div
                    aria-hidden="true"
                    data-loading-bar=""
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden"
                  >
                    <div className="dt-loading-bar" />
                  </div>
                )}
              </div>
              {virtual && rows.length && visibleColumns.length ? (
                <VirtualBody {...bodyProps} height={listHeight} listRef={setListScroller} listApiRef={listApiRef} onScroll={syncHeader} />
              ) : (
                // The rows flow at their own height, so the body only scrolls sideways.
                // `overflow-x: auto` alone turns y to auto as well: a cell taller than its
                // row (a 36px button in a 32px sm row) then opens a vertical scrollbar, whose
                // width in turn pushes the columns into a horizontal one.
                <div ref={setScroller} role="rowgroup" data-dt-body="" onScroll={syncHeader} className="overflow-x-auto overflow-y-hidden">
                  <div className={ROW_WIDTH_CLASS}>
                    {rows.length && visibleColumns.length ? (
                      <FlowBody {...bodyProps} />
                    ) : skeleton ? (
                      <SkeletonRows
                        columns={visibleColumns.map((column) => ({
                          checkbox: column.id === SELECT_COLUMN_ID,
                          className: columnClass(column.id),
                        }))}
                        rows={SKELETON_ROWS}
                        rowHeight={rowHeight}
                        rowClassName={ROW_WIDTH_CLASS}
                      />
                    ) : null}
                  </div>
                </div>
              )}

              {selectedColumns.length > 0 && (
                // Excel's selected columns: one rule, however many rows (or rows still to scroll in).
                <style>
                  {selectedColumns
                    .map((id) => `[data-dt="${cssAttributeValue(gridId)}"] [role="gridcell"][data-col="${cssAttributeValue(id)}"]`)
                    .join(',')}
                  {/* The neutral selection fill; the header's underline marks the column scope. */}
                  {`{background-color:var(--color-selection)}`}
                  {selectedColumns
                    .map((id) => `[data-dt="${cssAttributeValue(gridId)}"] [role="columnheader"][data-col="${cssAttributeValue(id)}"]`)
                    .join(',')}
                  {`{background-color:var(--color-selection);box-shadow:inset 0 -2px 0 var(--color-foreground)}`}
                </style>
              )}
              {drag && (
                <>
                  {/* The dragged column's cells travel with its header, over the columns they pass. */}
                  <style>
                    {`[data-dt="${cssAttributeValue(gridId)}"] [role="gridcell"][data-col="${cssAttributeValue(drag.columnId)}"]`}
                    {`{position:relative;z-index:10;background-color:color-mix(in oklab,var(--color-muted) 60%,var(--color-background));box-shadow:-1px 0 0 var(--color-border),1px 0 0 var(--color-border)}`}
                  </style>
                  {/* Where it will land: under the dragged column, over the ones sliding aside. useColumnDrag places it. */}
                  <div
                    ref={placeholderRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 z-[5] rounded-sm border-2 border-dashed border-border bg-selection"
                    style={{ display: 'none' }}
                  />
                </>
              )}
            </div>
          </SelectionHeaderContext>
          {skeleton ? (
            <div role="status" className="sr-only">
              {labels.loading}
            </div>
          ) : (errorMessage != null || !rows.length) && (
            <div
              role={errorMessage != null ? 'alert' : 'status'}
              className={cn(
                'flex min-h-24 items-center justify-center px-3 text-sm',
                errorMessage != null ? 'text-danger-text' : 'text-muted-foreground',
              )}
            >
              {errorMessage ?? (loading ? props.loadingMessage ?? labels.loading : emptyMessage ?? labels.empty)}
            </div>
          )}
        </div>

        <HeaderMenu
          grid={grid}
          column={menu ? (table.getColumn(menu.columnId) ?? null) : null}
          anchor={menu?.anchor ?? null}
          returnFocus={() => frameRef.current}
          onClose={() => setMenu(null)}
        />

        {paginated && (
          <TablePagination
            page={pageIndex + 1}
            pageSize={pagination.pageSize}
            total={total}
            pageSizeOptions={pageSizeOptions}
            labels={labels}
            disabled={loading}
            onPageChange={(page) => setPagination((current) => ({ ...current, pageIndex: page - 1 }))}
            onPageSizeChange={(next) => setPagination({ pageIndex: 0, pageSize: next })}
          />
        )}
      </div>
    </DirectionProvider>
  )
}
