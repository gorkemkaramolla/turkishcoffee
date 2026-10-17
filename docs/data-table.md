# DataTable

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

Needs the optional peer `@tanstack/react-table`. It is **not** exported from the root `turkishcoffee` entry.

```tsx
import { DataTable, actionsColumn, DataTableSkeleton, dataTableFeatures, dataTableLabelsForLocale, defaultDataTableLabels, type DataTableProps, type ActionsColumnOptions, type DataTableSkeletonProps, type DataTableColumnMeta, type DataTableColumnFilter, type DataTableFilterVariant, type DataTableFilterControlProps, type DataTableFeatures, type DataTableColumn, type DataTableLabels, type DataTablePagination, type DataTableRowSelection, type DataTableColumnSelection, type DataTableQuery, type DataTableQueryChange, type DataTableServer, type DataTableSelectionOptions, type DataTableColumnSelectionOptions, type DataTableLayoutOptions, type DataTableExportRows, type DataTableExportColumns, type DataTableExportScope, type DataTableExportRequest, type DataTableExportOptions, type DataTableExportData, type DataTableHandle } from 'turkishcoffee/data-table'
```

A data grid over TanStack Table v9. Every
interaction is one boolean away — `sortable`, `resizable` (with Excel's
double-click-to-fit), `reorderable`, `hideable`, `selectable`,
`selectableColumns`, `filterable`, `exportable` — and a feature's options
and state sit in its own prop, as an object in place of `true`. Sorting,
filters and page are one value, the query: controlled (`query` +
`onQueryChange`) or left to the grid (`defaultQuery`). Client-side by
default; `server` hands the query to a backend. Import from
`turkishcoffee/data-table`. For a static table use the root `Table`
primitives instead. Selected rows are grey; `selectable={{ color: 'primary' }}`
tints them with the brand. `striped` alternates the body rows between
`--table-row-odd` and `--table-row-even`, including virtualized rows; hover
and selection override the alternating background.

Use `toolbar` for search and status filters beside the column controls. When
rows or columns are selected, an inline bar groups the selection count,
export (when enabled) and a visible clear-selection button above the grid.

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

### Server data: one query, one request

```tsx
const [query, setQuery] = useState<DataTableQuery>({
sorting: [], columnFilters: [], pagination: { pageIndex: 0, pageSize: 25 },
})
const { data, isFetching, error } = useQuery({ queryKey: ['orders', query], queryFn: () => fetchOrders(query) })

<DataTable
aria-label="Orders"
columns={columns}
data={data?.rows ?? []}
getRowId={(row) => row.id} // required with server + selectable
server={{ rowCount: data?.total ?? 0 }}
loading={isFetching}
errorMessage={error ? 'Orders could not be loaded.' : undefined}
sortable filterable selectable
// A sort on page 3 arrives here once, already on page 1.
query={query} onQueryChange={setQuery}
exportable={{
// The grid writes the file from rows the app fetches...
fetchRows: (request) => api.fetchOrdersForExport(request),
onError: () => toast.error('Export failed'),
}}
/>
```

### Restricted selection

```tsx
// Only open invoices can be selected. The backend counts them, so "every
// matching row" stays available; it checks eligibility again when it acts.
<DataTable aria-label="Invoices" columns={columns} data={page} getRowId={(row) => row.id}
server={{ rowCount }}
selectable={{ isRowSelectable: (row) => row.status === 'open', selectableRowCount: openCount, scopeKey: search }} />
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
meta: { align: 'end', filter: { control: MinimumAmount } },
}]

<DataTable aria-label="Invoices" columns={columns} data={invoices} filterable
toolbar={<Button size="sm" onClick={openNewInvoice}>New invoice</Button>} />
```

### Server export written by the backend

```tsx
<DataTable aria-label="Orders" columns={columns} data={page} server={{ rowCount }}
exportable={{
onServerExport: async (request, format) => download(await api.exportOrders(request, format)),
onError: () => toast.error('Export failed'),
}} />
```

### Imperative export with error handling

```tsx
const ref = useRef<DataTableHandle<Invoice>>(null)
try {
await ref.current?.export('xlsx', { rows: 'loaded' })
} catch {
// Already reported to exportable.onError; the promise rejects as well.
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
- `multiSort?: boolean` — Whether Shift+click adds a second sort (default `true`). `false` keeps one sort column, Shift or not — for a backend that sorts by one column, so the grid never shows a sort the server ignores.
- `resizable?: boolean` — Drag a column's right edge to resize it; double-click the edge to fit the column to its content, as in Excel. Opt out per column with `enableResizing: false`; bound it with `minSize` / `maxSize`.
- `reorderable?: boolean` — Drag a header to move its column. Keep a column in place with `meta: { reorderable: false }`.
- `hideable?: boolean` — Adds a "Columns" menu to show and hide columns. Opt a column out with `enableHiding: false`.
- `selectable?: boolean | 'hover' | DataTableSelectionOptions<TData>` — Adds a checkbox column. `true`: boxes always visible; `'hover'`: a row's box shows on hover, every box once anything is selected. The header box works in two steps: this page, then every row matching the query (on the server too); Shift+click selects a range. Options — the scope, the eligible rows, the controlled selection — in {@link DataTableSelectionOptions}.
- `striped?: boolean` — Alternate the body rows' background. Off by default.
- `selectableColumns?: boolean | DataTableColumnSelectionOptions` — Excel's column selection, from the thin strip above the headers. The first click covers this page, the second every row, the third clears; Ctrl/⌘ adds a column, Shift a range, Escape clears.
- `filterable?: boolean` — A filter per column, behind a funnel that shows on header hover: a checklist, Min and Max, a calendar or "contains", by the column's `meta.filter` or its values. Opt out per column with `enableColumnFilter: false`, or give one its own `filterFn`. With `server`, the server filters.
- `exportable?: boolean | DataTableExportOptions<TData>` — Adds the toolbar's Export menu (CSV or Excel). It writes the selected columns (else the visible ones) of the selected rows (else the rows the column selection covers, else every filtered row). With `server`, rows beyond the loaded page come from `fetchRows`, or the backend writes the file through `onServerExport` ({@link DataTableExportOptions}).
- `height?: number` — Total height in px. Setting it virtualizes the rows with react-window: only the visible ones are in the DOM. Without it, rows render in normal flow — up to 100; past that (a page size of 200 or All) the grid virtualizes on its own, at most 640px of rows tall.
- `size?: 'sm' | 'md'` — Row density: `sm` 32px, `md` 44px (compact and comfortable).
- `columnVirtualization?: boolean | 'auto'` — Render only the columns in view (plus some overscan) on each row. `'auto'` (default) turns it on past 30 visible columns, where scrolling would otherwise render every cell of every row that comes into view.
- `stickyHeader?: boolean | { top: number }` — The header row sticks to the top of the page while the rows scroll by (default). `{ top }` leaves room for a fixed bar above it; `false` turns it off.
- `pageSize?: TablePageSize` — Rows per page; turns on the pagination bar. The uncontrolled query's starting size: changing it later applies the new size and returns to the first page. `'all'` is not offered with `server`. Server pages default to 25.
- `pageSizeOptions?: TablePageSize[]` — Choices in the page-size picker. Defaults to 10, 25, 50, 100, 200 and All (All left out with `server`).
- `server?: DataTableServer` — Server-side data: `data` is the current page; the backend sorts, filters and pages it from the query (`onQueryChange`). DataTable never sorts or filters a loaded page by itself.
- `layout?: DataTableLayoutOptions` — Where the column layout (widths, order, visibility) is kept: `storageKey` (this browser), or `saved` + `onChange` (a cookie, a backend), and the `defaults` it resets to. {@link DataTableLayoutOptions}
- `query?: DataTableQuery` — The controlled query. With it the app owns sorting, filters and page: the grid shows exactly this and asks for changes through `onQueryChange`. Without it the grid keeps the query, from `defaultQuery`.
- `defaultQuery?: Partial<DataTableQuery>` — The uncontrolled query's starting value, read once. Also where `ref.resetQuery()` returns.
- `onQueryChange?: (query: DataTableQuery, change: DataTableQueryChange) => void` — Every change to the query, whole: a new sort or filter also returns to the first page, in the same call. `change` says which part the user changed. On the server, fetch exactly `query` — one change, one request.
- `rowVirtualization?: boolean | 'auto'` — Render only a window of rows. false keeps all rows in normal document flow; auto uses height or the 100-row threshold.
- `autoSize?: 'initial' | 'data' | false` — Fit once (default), fit after data changes, or use explicit/default widths. User sizes always win.
- `toolbar?: React.ReactNode` — Custom content beside the built-in toolbar controls.
- `loading?: boolean` — A request is in flight: a bar runs under the header, the grid is `aria-busy`, paging pauses, and with no rows yet placeholder rows show.
- `loadingMessage?: React.ReactNode` — Initial loading content, outside the grid's data-row count.
- `errorMessage?: React.ReactNode` — Error content; takes precedence over loading and empty content.
- `'aria-label'?: string` — Accessible name of the grid. Supply this or aria-labelledby.
- `'aria-labelledby'?: string` — ID of the visible heading naming the grid.
- `'aria-describedby'?: string` — ID of instructions describing the grid.
- `dir?: 'ltr' | 'rtl'` — Explicit reading direction; defaults to ltr.
- `ref?: React.Ref<DataTableHandle<TData>>` — Imperative access: resets, paging, selected rows, export data.
- `locale?: string` — Locale for the words the grid renders, sorting, filtering, numerals and exports. Defaults to LocaleProvider's, else the page's `<html lang>`, else en-US. English and Turkish words ship complete.
- `emptyMessage?: React.ReactNode` — Shown in place of rows when `data` is empty. Defaults to "No results."
- `labels?: Partial<DataTableLabels>` — Single words to replace, over the locale's own.
- `onRowClick?: (row: TData) => void` — Makes rows clickable (and focusable, Enter activates). Clicks on buttons and links inside a row are ignored.
- `className?: string` — Applied to the outer wrapper (toolbar + grid + pagination row).

### `ActionsColumnOptions`

- `label: string` — The column's name: read by screen readers in place of a visible header, and shown in the Columns menu.
- `cell: (context: CellContext<DataTableFeatures, TData, unknown>) => ReactNode` — The row's actions, usually a DropdownMenu opened by a ghost `size="icon"` Button with an `aria-label` naming the row; `size="icon-sm"` in a `size="sm"` grid, whose 32px rows a 36px button overflows.
- `size?: number` — Width in px. Default 56: a 36px icon button with room on both sides.
- `id?: string` — Default `'actions'`.

### `DataTableSkeletonProps`

- `columns?: number | readonly string[]` — The headers to show, as the real table will (`['Name', 'Email']`), or how many columns to sketch. Default 5.
- `rows?: number` — Placeholder rows. Default 8.
- `size?: 'sm' | 'md'` — Row height, as DataTable's `size`: `sm` 32px or `md` 44px (default).
- `selectable?: boolean` — A checkbox column first, as DataTable's `selectable`.
- `label?: string` — Announced to screen readers. Defaults to "Loading…" in the page's language (see LocaleProvider).

### `DataTableColumnMeta`

- `headerClassName?: string` — Header classes, merged last.
- `cellClassName?: string` — Cell classes, merged last. Rows remain fixed-height and single-line.
- `filter?: DataTableColumnFilter` — The column's header filter. Filtering, cell display and export are set apart: none reads the others.
- `align?: 'start' | 'end'` — `'end'` right-aligns the header and cells — use it for numbers.
- `label?: string` — The column's name in the Columns menu and header menu when `header` is a function.
- `reorderable?: boolean` — `false` keeps the column where it is when `reorderable` is on (an actions column).
- `exportValue?: (row: TData) => unknown` — The value written to CSV/Excel for a row, when the cell's own value is not what should be exported — e.g. `(row) => row.isActive ? 'Active' : 'Passive'` for a Badge column, or anything for a display column with no accessor. `row` is the column's row type.

### `DataTableColumnFilter`

- `options?: readonly TableColumnFilterOption[]` — The column's known values (a status, a type): the filter becomes a checklist of them. Tick the values to show; nothing ticked is no filter, and the filter value is the array of ticked values. A `count` shows beside its option; on the client, options without one are counted. On the server, `options` variant needs them: a page holds only some values.
- `control?: ComponentType<DataTableFilterControlProps>` — A filter editor of your own inside the header popover. Values need not be strings. Wins over `variant` and `options`.

### `DataTableLabels`

- `columns: string` — The column chooser button and its menu heading.
- `resetLayout: string` — Column chooser item that undoes resizing, reordering and hiding.
- `autofit: string` — Header menu item that fits the column to its content.
- `columnMenu: (column: string) => string` — Accessible name of a header's menu button.
- `resizeColumn: (column: string) => string` — Accessible name of a column's resize handle.
- `filter: (column: string) => string` — Column filter title and trigger name: "Filter Name".
- `filterContains: string` — Caption above the filter input.
- `clearFilters: string` — Toolbar button that clears every column filter, shown while one is set.
- `filterSearchOptions: string` — An options filter's search field, from six options.
- `filterNoOptions: string` — An options filter when its search matches none.
- `filterMin: string` — A number filter's lower bound.
- `filterMax: string` — A number filter's upper bound.
- `filterPickDates: string` — A date filter before a day is picked.
- `filterTrue: string` — A boolean column's checklist options, without `exportValue` to name them.
- `selectAll: string` — Accessible name of the header checkbox.
- `selectAllRows: (count: number) => string` — The step from "this page" to "everything": the header box's name once the page is selected, and the toolbar's shortcut.
- `selectColumn: (column: string) => string` — Accessible name of a column's selection strip.
- `columnScopePage: (rows: number) => string` — A column selection that covers the rows on this page.
- `columnScopeAll: (rows: number) => string` — A column selection that covers every row.
- `selectRow: string` — Accessible name of a row checkbox.
- `rowsHiddenByFilter: (count: number) => string` — Selected rows the current filters hide, shown beside the count.
- `rowsOffPage: (count: number) => string` — Server mode: selected rows not in the loaded page, shown beside the count.
- `clearSelection: string` — Label of the button clearing selected rows and columns.
- `exportError: string` — Export failure, displayed as an inline alert.
- `loading: string` — Initial loading status.
- `empty: string` — Empty grid status.
- `sortDescription: (direction: 'asc' | 'desc', priority: number) => string` — Accessible description of secondary sorting.
- `exportScope: (columns: number, rows: number, scope: DataTableExportScope) => string` — Heading of the export menu: what will be written. `scope` says which rows: `selected`, `page` (on screen), `filtered` (every row passing the filters) or `loaded`.
- `exportLoadedOnly: (columns: number, rows: number, scope: DataTableExportScope) => string` — Export menu heading when the rows live on the server but no server export is set up: only the loaded ones are written.

### `DataTableQuery`

- `pagination?: DataTablePagination` — Absent when the grid has no pages (no `pageSize`, no `server`).

### `DataTableServer`

- `rowCount: number` — Rows matching the current query on the server.

### `DataTableSelectionOptions`

- `checkboxes?: 'always' | 'hover'` — `'always'` (default): every row shows its box. `'hover'`: a row's box shows on hover, every box once anything is selected.
- `color?: 'neutral' | 'primary'` — The selected rows' background: `'neutral'` (default) grey, `'primary'` the brand's soft tint.
- `isRowSelectable?: (row: TData) => boolean` — Which rows may be selected.
- `defaultValue?: DataTableRowSelection` — The uncontrolled selection's starting value, read once.
- `scopeKey?: string` — The query's parts that live outside the grid (a search box, status tabs), as one string. Changing it clears an `allMatching` selection, as the grid's own filters do, and an export request carries it.
- `selectableRowCount?: number` — Server with `isRowSelectable`: how many rows matching the query may be selected, counted by the backend. With it the header box can select every matching row, and the backend checks eligibility when it acts on the selection. Without it the selection stays explicit ids of loaded rows.

### `DataTableLayoutOptions`

- `defaults?: Partial<DataTableLayout>` — The layout the grid starts from and resets to.
- `onChange?: (layout: DataTableLayout | null) => void` — Called after an edit is complete (a resize at pointer release, not every pixel), and with `null` after a reset.
- `saved: Partial<DataTableLayout> | null` — A layout the app saved from `onChange`; `null`: nothing saved yet. Malformed fields and unknown columns are ignored.

### `DataTableExportRequest`

- `columns: string[]` — Column ids, in display order.
- `sorting: SortingState` — The order to write the rows in.
- `rows.type: 'ids'` — Exactly these rows, whatever the current filters: rows picked one by one, perhaps on other pages or searches.
- `rows.type: 'matching'` — Every row matching the query, except `excludedIds`.
- `rows.scopeKey?: string` — The selection's `scopeKey`: the app's filters outside the grid.

### `DataTableExportOptions`

- `onError?: (error: unknown, format: TableExportFormat) => void` — Toolbar and `ref.export` failures, the app's own included. `ref.export` also rejects.
- `fetchRows: (request: DataTableExportRequest) => Promise<TData[]>` — Server mode: the rows `request` describes, in the order to write them.
- `onServerExport: (request: DataTableExportRequest, format: TableExportFormat) => void | Promise<void>` — Server mode: have the backend write `request` as `format`, and download it.

### `DataTableExportData`

- `columns: Array<TableExportColumn<TData>>` — They read any row of `TData`, including rows fetched for `request`.
- `rows: TData[]` — The covered rows DataTable holds, in display order.
- `scope: DataTableExportScope` — Which rows are covered, e.g. to say "3 selected rows" before writing.
- `request: DataTableExportRequest | null` — Set when some covered rows are only on the server (server mode). Null when the grid holds them all.

### `DataTableHandle`

- `fitColumns: (columnIds?: string[]) => void` — Fit rendered content and a sample of up to 50 loaded values. Omit ids to fit visible columns.
- `resetQuery: () => void` — Back to `defaultQuery`: one change, reported once.
- `resetLayout: () => void` — Column visibility, order and sizing back to `layout.defaults`, and the stored copy removed.
- `getSelectedRows: () => TData[]` — The selected rows DataTable holds (under `allMatching`: the loaded matching rows not excluded).
- `export: (format: TableExportFormat, options?: { rows?: DataTableExportRows; columns?: DataTableExportColumns }) => Promise<void>` — Exports as the toolbar's menu does. Rows beyond the loaded data go to `exportable.fetchRows` or `onServerExport`; without either the promise rejects unless `rows` is `'page'` or `'loaded'`. Failures also reach `exportable.onError`.

## Parts

- `type DataTableProps` — Public grid props. Server selection requires a stable row identity.
- `type ActionsColumnOptions`
- `actionsColumn` — The column for a row's actions. It has a fixed width, a centred cell and a header only screen readers read. It cannot be sorted, filtered, resized, hidden, moved or exported. Put it last.

  ```tsx
  const columns: DataTableColumn<Person>[] = [
    { accessorKey: 'name', header: 'Name' },
    actionsColumn<Person>({
      label: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={`Actions for ${row.original.name}`} />}>
            <EllipsisIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">…</DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ]
  ```

- `type DataTableSkeletonProps`
- `DataTableSkeleton` — A DataTable on its way: the bordered frame, the header, and rows of Skeleton bars at DataTable's own row height, so nothing jumps when the real table arrives. Use it where the table can't render yet, such as a Suspense fallback around a server fetch. DataTable draws the same rows itself while it loads with no rows. The bars share Skeleton's glint, so the table loads as one surface.

  ```tsx
  <Suspense fallback={<DataTableSkeleton columns={['Name', 'Email', 'Status']} selectable />}>
    <Employees />
  </Suspense>
  ```

- `type DataTableColumnMeta` — What DataTable reads from a column's `meta`. All optional. `TData` is the row type.
- `type DataTableColumnFilter` — A column's filter. Its kind comes from `variant`; unset, from the column's values — a convenience, held once seen: a column of Dates gets a calendar, of numbers Min and Max, of booleans a checklist, anything else "contains". An empty page or a page of blanks never changes it. Set `variant` whenever the values may not say it: dates kept as strings, a column of a few repeated values (`options`), or server data.
- `type DataTableFilterVariant` — A column filter's kind, and the value it puts in `columnFilters`: - `text` — the text the cell contains (`string`); - `options` — the values ticked (`Array<string | number | boolean>`); - `number` — `{ min?: number; max?: number }`, both inclusive; - `date` — `{ from?: Date; to?: Date }`, local days, both inclusive.
- `type DataTableFilterControlProps` — Props for a custom column filter. onApply commits and closes; close cancels.
- `dataTableFeatures` — The TanStack Table v9 feature set DataTable runs with: sorting, filtering, row selection, client pagination, column sizing/resizing, ordering and visibility. Every feature is registered; the DataTable props decide which ones the user can reach. `@tanstack/react-table` is an OPTIONAL peer, so this lives behind its own entry point (`turkishcoffee/data-table`) and never loads for projects that only import the root barrel.
- `type DataTableFeatures`
- `type DataTableColumn` — Column definitions for DataTable — carries the feature set for you. This is TanStack Table v9: type columns as `DataTableColumn<Row>[]`, not v8's `ColumnDef<Row>` or `createColumnHelper`. Per-column switches are TanStack's own: `enableSorting`, `enableResizing`, `enableHiding`, `enableColumnFilter`, `size`, `minSize`, `maxSize`, `sortFn`, `filterFn`; plus `meta` ({@link DataTableColumnMeta}).
- `type DataTableLabels` — Every word DataTable renders itself, in the language of its `locale` (else LocaleProvider's, else `<html lang>`). Override single words through the `labels` prop. The pagination words are TablePagination's, which DataTable renders.
- `dataTableLabelsForLocale` — Every DataTable word in `locale`'s language, numbers in its numerals: the same locale as the grid's sorting, filtering and exports. English and Turkish ship complete; other languages get English.
- `defaultDataTableLabels` — The English labels.
- `type DataTablePagination` — Which page is on screen. `pageIndex` is 0-based; `'all'` puts every row on one page.
- `type DataTableRowSelection` — Which rows are selected. Plain data: store it, or send it to a backend as is. - `ids`: these rows, on any page — picked one by one, or a whole page (the header box's first click adds the page's ids). - `allMatching`: every row matching the query — loaded or not, on the server too — except `excludedIds`. The header box's second click.
- `type DataTableColumnSelection` — Which columns are selected, and over which rows: the page on screen, or every matching row.
- `type DataTableQuery` — What the rows on screen answer to: their order, their filters and their page. One value, so a change that touches two of them — a new sort also returns to the first page — is one change, reported once. On the server it is what the backend is asked for.
- `type DataTableQueryChange` — Which part of the query a change started from. A sort or filter change also returns to the first page; `reset` is `ref.resetQuery()`.
- `type DataTableServer` — Server-side data: `data` is the current page, and sorting, filtering and paging happen on the server, through `onQueryChange`. DataTable never sorts or filters a loaded page on its own, and never reads totals, filter options or selection counts off the one page it holds.
- `type DataTableSelectionOptions` — Row selection: `selectable={true}`, `'hover'`, or these options. Every option is optional; `value` + `onChange` control the selection, or leave it to the grid from `defaultValue`. What survives what, with `scope: 'crossPage'` (default): - rows picked one by one (`ids`) survive paging, sorting, filtering and new searches. Picked rows a filter hides stay selected, and an export of the selection still writes them. - every matching row (`allMatching`) describes one result: it clears when the filters or `scopeKey` change, and survives paging and sorting. With `scope: 'page'`, changing the page, the sorting or the filters clears the selection, and the header box selects the page only.
- `type DataTableColumnSelectionOptions` — Column selection: `selectableColumns={true}`, or these options to control or start it.
- `type DataTableLayoutOptions` — Where the column layout (widths, order, visibility) is kept — one of two ways, never both: - `storageKey`: in this browser's `localStorage`, by the grid; - `saved` + `onChange`: by the app, in a cookie or a backend. Read on the server, the page renders in the saved layout from the first byte. Precedence: the saved layout > `defaults` > the column definitions. A saved layout is fitted to the current columns: columns removed since it was saved are dropped, new ones take their place from the definitions, and a column whose `id` changed counts as new. "Reset layout" returns to `defaults` (else the definitions), clears the stored copy and reports `null`.
- `type DataTableExportRows` — The rows an export covers. `auto`: selected rows, else the column selection's rows, else every filtered row.
- `type DataTableExportColumns` — The columns an export covers. `auto`: the selected columns, else the visible ones.
- `type DataTableExportScope` — Which rows an export covers once `auto` is resolved: the selected rows, the rows on screen, every row passing the filters (`allMatching` included), or all of `data`.
- `type DataTableExportRequest` — Server mode: the rows an export covers that the loaded page doesn't hold, described for the backend.
- `type DataTableExportOptions` — The Export menu (`exportable={true}` or these options). Rows the grid holds it writes itself. In server mode rows beyond the loaded page are the app's to provide, one of two ways: - `fetchRows`: the app fetches them; the grid writes the file; - `onServerExport`: the backend writes the file; the app downloads it. With neither, the menu writes the loaded rows and says so.
- `type DataTableExportData` — Export-ready data: hand `columns` and `rows` to `exportTable`, or `request` to your backend.
- `type DataTableHandle` — Imperative access: `<DataTable ref={ref} />`. A controlled value changes through its `onChange` / `onQueryChange`.
