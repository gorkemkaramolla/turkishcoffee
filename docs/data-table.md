# DataTable

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

Needs the optional peer `@tanstack/react-table`. It is **not** exported from the root `turkishcoffee` entry.

```tsx
import { DataTable, dataTableFeatures, defaultDataTableLabels, dataTableLabelsForLocale, type DataTableInitialState, type DataTableProps, type DataTableColumnMeta, type DataTableFilterControlProps, type DataTableFeatures, type DataTableColumn, type DataTableLabels, type DataTablePagination, type DataTableRowSelection, type DataTableColumnSelection, type DataTableState, type DataTableServer, type DataTableExportRows, type DataTableExportColumns, type DataTableExportRequest, type DataTableExportData, type DataTableHandle } from 'turkishcoffee/data-table'
```

A data grid over TanStack Table v9. Every
interaction is one boolean away — `sortable`, `resizable` (with Excel's
double-click-to-fit), `reorderable`, `hideable`, `selectable`,
`selectableColumns`, `filterable`, `exportable` — and every piece of state
can be controlled or left to the grid. Client-side by default; `server`
hands sorting, filtering and paging to a backend. Import from
`turkishcoffee/data-table`. For a static table use the root `Table`
primitives instead. Body rows alternate between `--table-row-odd` and
`--table-row-even`, including virtualized rows; hover and selection override
the alternating background.

Keyboard: the grid is one tab stop. Arrows, Home/End, Ctrl+Home/End and
PageUp/PageDown move the active cell; F2 (or Enter on a cell without its own
action) moves focus into the cell's controls and Escape returns to the grid.
Enter sorts a header, Alt+↓ opens its menu, Shift+Space selects a row,
Ctrl+Space a column, Ctrl+A every row. In `dir="rtl"` the arrows follow the
reading direction.

Not supported: grouped (nested) column headers, footers, cell editing, tree
rows and variable-height rows. Rows are fixed-height and single-line, and
`columns` must be leaf columns.

## Example

```tsx
const columns: DataTableColumn<Payment>[] = [
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: (info) => `$${info.getValue<number>().toFixed(2)}`,
    meta: { align: 'end' },
  },
]

<DataTable aria-label="Payments" columns={columns} data={payments} sortable resizable reorderable hideable pageSize={25} />
```

## More examples

### Server data with controlled state

```tsx
const [sorting, setSorting] = useState<SortingState>([])
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
const [pagination, setPagination] = useState<DataTablePagination>({ pageIndex: 0, pageSize: 25 })
const { data, isFetching, error } = useQuery({
queryKey: ['orders', sorting, columnFilters, pagination],
queryFn: () => fetchOrders({ sorting, columnFilters, pagination }),
})

<DataTable
aria-label="Orders"
columns={columns}
data={data?.rows ?? []}
getRowId={(row) => row.id} // required with server + selectable
server={{ rowCount: data?.total ?? 0 }}
loading={isFetching}
errorMessage={error ? 'Orders could not be loaded.' : undefined}
sortable filterable selectable
sorting={sorting} onSortingChange={setSorting}
columnFilters={columnFilters} onColumnFiltersChange={setColumnFilters}
pagination={pagination} onPaginationChange={setPagination}
exportable={{ onServerExport: (request, format) => api.exportOrders(request, format) }}
onExportError={(error) => toast.error('Export failed')}
/>
```

### Restricted selection

```tsx
// Only open invoices can be selected. On the server, the selection is then
// always explicit ids (no "select all matching"), kept across pages.
<DataTable aria-label="Invoices" columns={columns} data={page} getRowId={(row) => row.id}
server={{ rowCount }} selectable isRowSelectable={(row) => row.status === 'open'} />
```

### Custom filter control and toolbar

```tsx
const MinimumAmount = ({ value, onApply, close }: DataTableFilterControlProps) => (
<form onSubmit={(event) => { event.preventDefault(); onApply(Number(new FormData(event.currentTarget).get('min'))) }}>
<Input name="min" type="number" defaultValue={typeof value === 'number' ? value : ''} />
<Button type="submit">Apply</Button> <Button variant="ghost" onClick={close}>Cancel</Button>
</form>
)
const columns: DataTableColumn<Invoice>[] = [{
accessorKey: 'amount', header: 'Amount',
filterFn: (row, id, min) => row.getValue<number>(id) >= (min as number),
meta: { align: 'end', filterControl: MinimumAmount },
}]

<DataTable aria-label="Invoices" columns={columns} data={invoices} filterable
toolbar={<Button size="sm" onClick={openNewInvoice}>New invoice</Button>} />
```

### Imperative export with error handling

```tsx
const ref = useRef<DataTableHandle<Invoice>>(null)
try {
await ref.current?.export('xlsx', { rows: 'loaded' })
} catch {
// Already reported to onExportError; the promise rejects as well.
}
```

### Turkish locale, right-to-left, printing

```tsx
// Locale drives sorting, the "contains" filter, numeric labels and exports (default en-US).
<DataTable aria-label="Çalışanlar" locale="tr-TR" columns={columns} data={rows} />
<DataTable aria-label="الموظفون" dir="rtl" columns={columns} data={rows} />
// Every row in normal flow (no virtualization), e.g. for a print view.
<DataTable aria-label="Report" rowVirtualization={false} columns={columns} data={rows} />
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

### `DataTableProps`

- `columns: Array<DataTableColumn<TData>>` — TanStack Table v9 column definitions: `DataTableColumn<Row>[]`.
- `getRowId?: (row: TData, index: number) => string` — A stable id per row (e.g. `(row) => row.id`). Defaults to the row's index. Needed for selections that outlive a sort, new data or a page change.
- `sortable?: boolean` — Click a header to sort: ascending → descending → off; Shift+click adds a second sort. Numbers, dates and booleans compare by value, text in the page's language, and blanks always go last. Opt a column out with `enableSorting: false`, or give it its own `sortFn`. With `server`, the server sorts.
- `resizable?: boolean` — Drag a column's right edge to resize it; double-click the edge to fit the column to its content, as in Excel. Opt out per column with `enableResizing: false`; bound it with `minSize` / `maxSize`.
- `reorderable?: boolean` — Drag a header to move its column. Keep a column in place with `meta: { reorderable: false }`.
- `hideable?: boolean` — Adds a "Columns" menu to show and hide columns. Opt a column out with `enableHiding: false`.
- `selectable?: boolean | 'hover'` — Adds a checkbox column. `true`: boxes always visible. `'hover'`: subtle selection, for dense lists — a row's box shows on hover, every box once anything is selected. The header box works in two steps: this page, then every row matching the filters (on the server too); Shift+click selects a range.
- `selectionScope?: 'page' | 'crossPage'` — `'crossPage'` (default): a selection survives page changes. `'page'`: changing the page, the sorting or the filters clears it, and the header box selects the page only.
- `selectableColumns?: boolean` — Excel's column selection, from the thin strip above the headers. The first click covers this page, the second every row, the third clears; Ctrl/⌘ adds a column, Shift a range, Escape clears.
- `filterable?: boolean` — A "contains" filter per column, behind a funnel that shows on header hover. Case-insensitive in the page's language; dates and numbers match as shown. Opt out per column with `enableColumnFilter: false`, or give one its own `filterFn`. With `server`, the server filters.
- `exportable?: | boolean | { fileName?: string onServerExport?: (request: DataTableExportRequest, format: TableExportFormat) => void | Promise<void> }` — Adds the toolbar's Export menu (CSV or Excel). It writes the selected columns (else the visible ones) of the selected rows (else the rows the column selection covers, else every filtered row). DataTable only picks the rows and columns — `exportTable` writes the file. For a button of your own, use the ref's `getExportData`. With `server`, rows beyond the loaded page go to `onServerExport`; without it, only loaded rows are written and the menu says so.
- `height?: number` — Total height in px. Setting it virtualizes the rows with react-window: only the visible ones are in the DOM. Without it, rows render in normal flow — up to 100; past that (a page size of 200 or All) the grid virtualizes on its own, at most 640px of rows tall.
- `size?: 'sm' | 'md'` — Row density: `sm` 32px, `md` 44px (compact and comfortable).
- `columnVirtualization?: boolean | 'auto'` — Render only the columns in view (plus some overscan) on each row. `'auto'` (default) turns it on past 30 visible columns, where scrolling would otherwise render every cell of every row that comes into view.
- `stickyHeader?: boolean | { top: number }` — The header row sticks to the top of the page while the rows scroll by (default). `{ top }` leaves room for a fixed bar above it; `false` turns it off.
- `pageSize?: TablePageSize` — Rows per page, or `'all'`; turns on the pagination bar. Shorthand for `initialState.pagination.pageSize`. Changing it later (uncontrolled) applies the new size and returns to the first page.
- `pageSizeOptions?: TablePageSize[]` — Choices in the pagination bar's page-size picker. Defaults to 10, 25, 50, 100, 200 and All.
- `server?: DataTableServer` — Server-side data: `data` is the current page; sorting, filtering and paging happen on the server through the state callbacks (`onSortingChange`, `onColumnFiltersChange`, `onPaginationChange`). DataTable never sorts or filters a loaded page by itself.
- `initialState?: DataTableInitialState` — Uncontrolled starting values. Precedence for each piece of state: controlled prop > layout stored under `storageKey` (visibility, order, sizing) > `initialState` > default.
- `storageKey?: string` — Remembers column widths, order and visibility in `localStorage` under this key, per browser. The server can't read `localStorage`: on a server-rendered page the defaults show until hydration, then the saved layout. To avoid that jump, keep the layout where the server can read it (a cookie) with `savedLayout` + `onLayoutChange` instead.
- `savedLayout?: Partial<DataTableLayout> | null` — A layout the app saved itself (from `onLayoutChange`), e.g. read from a cookie on the server: the page then renders in it from the first byte. Takes the place of `storageKey`'s `localStorage` copy. Malformed fields and unknown columns are ignored. `null`: nothing saved yet.
- `onLayoutChange?: (layout: DataTableLayout | null) => void` — The whole layout after edits and content-width measurements; null after "Reset layout".
- `columnSizing?: ColumnSizingState` — Widths the user set; automatic (fitted) widths are not state.
- `onSelectionChange?: (rows: TData[]) => void` — 
- `rowVirtualization?: boolean | 'auto'` — Render only a window of rows. false keeps all rows in normal document flow; auto uses height or the 100-row threshold.
- `autoSize?: 'initial' | 'data' | false` — Fit once (default), fit after data changes, or use explicit/default widths. User sizes always win.
- `toolbar?: React.ReactNode` — Custom content beside the built-in toolbar controls.
- `isRowSelectable?: (row: TData) => boolean` — A row's eligibility for selection. Restricted server selection uses explicit IDs only.
- `loading?: boolean` — Overrides server.loading when supplied.
- `loadingMessage?: React.ReactNode` — Initial loading content, outside the grid's data-row count.
- `errorMessage?: React.ReactNode` — Error content; takes precedence over loading and empty content.
- `onExportError?: (error: unknown, format: TableExportFormat) => void` — Called for toolbar and imperative export failures. Imperative calls also reject.
- `'aria-label'?: string` — Accessible name of the grid. Supply this or aria-labelledby.
- `'aria-labelledby'?: string` — ID of the visible heading naming the grid.
- `'aria-describedby'?: string` — ID of instructions describing the grid.
- `dir?: 'ltr' | 'rtl'` — Explicit reading direction; defaults to ltr.
- `ref?: React.Ref<DataTableHandle<TData>>` — Imperative access: resets, paging, selected rows, export data.
- `locale?: string` — Locale for sorting, filtering, numeric labels and exports. Defaults to en-US; pass tr-TR in Turkish apps, including SSR.
- `emptyMessage?: React.ReactNode` — Shown in place of rows when `data` is empty. Defaults to "No results."
- `labels?: Partial<DataTableLabels>` — Translations for the words DataTable renders itself.
- `onRowClick?: (row: TData) => void` — Makes rows clickable (and focusable, Enter activates). Clicks on buttons and links inside a row are ignored.
- `className?: string` — Applied to the outer wrapper (toolbar + grid + pagination row).

### `DataTableColumnMeta`

- `headerClassName?: string` — Header classes, merged last.
- `cellClassName?: string` — Cell classes, merged last. Rows remain fixed-height and single-line.
- `filterControl?: ComponentType<DataTableFilterControlProps>` — Custom filter editor inside the header filter popover. Values need not be strings.
- `align?: 'start' | 'end'` — `'end'` right-aligns the header and cells — use it for numbers.
- `label?: string` — The column's name in the Columns menu and header menu when `header` is a function.
- `reorderable?: boolean` — `false` keeps the column where it is when `reorderable` is on (an actions column).
- `exportValue?: (row: TData) => unknown` — The value written to CSV/Excel for a row, when the cell's own value is not what should be exported — e.g. `(row) => row.isActive ? 'Active' : 'Passive'` for a Badge column, or anything for a display column with no accessor. `row` is the column's row type.

### `DataTableLabels`

- `columns: string` — The column chooser button and its menu heading.
- `resetLayout: string` — Column chooser item that undoes resizing, reordering and hiding.
- `autofit: string` — Header menu item that fits the column to its content.
- `columnMenu: (column: string) => string` — Accessible name of a header's menu button.
- `resizeColumn: (column: string) => string` — Accessible name of a column's resize handle.
- `filter: (column: string) => string` — Column filter title and trigger name: "Filter Name".
- `filterContains: string` — Caption above the filter input.
- `selectAll: string` — Accessible name of the header checkbox.
- `selectAllRows: (count: number) => string` — The step from "this page" to "everything": the header box's name once the page is selected, and the toolbar's shortcut.
- `selectColumn: (column: string) => string` — Accessible name of a column's selection strip.
- `columnScopePage: (rows: number) => string` — A column selection that covers the rows on this page.
- `columnScopeAll: (rows: number) => string` — A column selection that covers every row.
- `selectRow: string` — Accessible name of a row checkbox.
- `rowsHiddenByFilter: (count: number) => string` — Selected rows the current filters hide, shown beside the count.
- `clearSelection: string` — Accessible name of the ✕ on a selection chip.
- `exportError: string` — Export failure, displayed as an inline alert.
- `loading: string` — Initial loading status.
- `empty: string` — Empty grid status.
- `sortDescription: (direction: 'asc' | 'desc', priority: number) => string` — Accessible description of secondary sorting.
- `exportScope: (columns: number, rows: number) => string` — Heading of the export menu: what will be written.
- `exportLoadedOnly: (columns: number, rows: number) => string` — Export menu heading when the rows live on the server but no server export is set up: only the loaded ones are written.

### `DataTableState`

- `columnSizing: ColumnSizingState` — Widths the user set (dragged, typed or fitted). Automatic widths are not state.

### `DataTableServer`

- `rowCount: number` — Rows matching the current filters on the server.
- `loading?: boolean` — A request is in flight: rows dim, the grid is `aria-busy`, paging pauses.

### `DataTableExportRequest`

- `columns: string[]` — Column ids, in display order.
- `selection: DataTableRowSelection | null` — `null`: every row matching `columnFilters`.

### `DataTableExportData`

- `rows: TData[]` — The covered rows DataTable holds, in display order.
- `request: DataTableExportRequest | null` — Set when the covered rows live on the server (server mode): fetch or export them there.

### `DataTableHandle`

- `fitColumns: (columnIds?: string[]) => void` — Fit rendered content and a sample of up to 50 loaded values. Omit ids to fit visible columns.
- `resetLayout: () => void` — Column visibility, order and sizing — and the stored copy under `storageKey`.
- `getSelectedRows: () => TData[]` — The selected rows DataTable holds (under `allMatching`: the loaded matching rows not excluded).
- `export: (format: TableExportFormat, options?: { rows?: DataTableExportRows; columns?: DataTableExportColumns }) => Promise<void>` — Exports with the built-in writer, as the toolbar's menu does. Rows beyond the loaded data go to `exportable.onServerExport`; without it the promise rejects unless `rows` is `'page'` or `'loaded'`. Failures also reach `onExportError`.

## Parts

- `type DataTableInitialState` — Starting values for uncontrolled state. A layout stored under `storageKey` wins over them.
- `type DataTableProps` — Public grid props. Server selection requires a stable row identity.
- `type DataTableColumnMeta` — What DataTable reads from a column's `meta`. All optional. `TData` is the row type.
- `type DataTableFilterControlProps` — Props for a custom column filter. onApply commits and closes; close cancels.
- `dataTableFeatures` — The TanStack Table v9 feature set DataTable runs with: sorting, filtering, row selection, client pagination, column sizing/resizing, ordering and visibility. Every feature is registered; the DataTable props decide which ones the user can reach. `@tanstack/react-table` is an OPTIONAL peer, so this lives behind its own entry point (`turkishcoffee/data-table`) and never loads for projects that only import the root barrel.
- `type DataTableFeatures`
- `type DataTableColumn` — Column definitions for DataTable — carries the feature set for you. This is TanStack Table v9: type columns as `DataTableColumn<Row>[]`, not v8's `ColumnDef<Row>` or `createColumnHelper`. Per-column switches are TanStack's own: `enableSorting`, `enableResizing`, `enableHiding`, `enableColumnFilter`, `size`, `minSize`, `maxSize`, `sortFn`, `filterFn`; plus `meta` ({@link DataTableColumnMeta}).
- `type DataTableLabels` — Every word DataTable renders itself. English by default; pass the ones you need to translate through the `labels` prop. The pagination words are TablePagination's, which DataTable renders.
- `defaultDataTableLabels`
- `dataTableLabelsForLocale` — Numeric labels use the same locale as the grid's sorting, filtering and exports.
- `type DataTablePagination` — Which page is on screen. `pageIndex` is 0-based; `'all'` puts every row on one page.
- `type DataTableRowSelection` — Which rows are selected. Plain data: store it, or send it to a backend as is. - `ids`: these rows, on any page. - `allMatching`: every row matching the current filters — on the server too — except `excludedIds`. What the header box's second click selects.
- `type DataTableColumnSelection` — Which columns are selected, and over which rows: the page on screen, or every matching row.
- `type DataTableState` — Every piece of state DataTable keeps. Each can be controlled (`sorting` + `onSortingChange`, …) or left to DataTable, starting from `initialState`.
- `type DataTableServer` — Server-side data: `data` is the current page, and sorting, filtering and paging happen on the server (through the state callbacks). DataTable never sorts or filters a loaded page on its own.
- `type DataTableExportRows` — The rows an export covers. `auto`: selected rows, else the column selection's rows, else every filtered row.
- `type DataTableExportColumns` — The columns an export covers. `auto`: the selected columns, else the visible ones.
- `type DataTableExportRequest` — What a backend needs to produce an export of rows it holds (server mode).
- `type DataTableExportData` — Export-ready data: hand `columns` and `rows` to `exportTable`, or `request` to your backend.
- `type DataTableHandle` — Imperative access: `<DataTable ref={ref} />`. On a controlled slice, each call goes through its `on…Change`.
