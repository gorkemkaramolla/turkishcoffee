---
"turkishcoffee": major
---

DataTable is now a full data grid. Every interaction is an opt-in boolean prop and needs no other setup:

- `sortable`: click a header to sort (Shift+click for a second key). The default comparison sorts by data type: numbers, dates and booleans by value, text in `locale` (default `en-US`), blanks last in both directions.
- `resizable`: drag a column edge to resize; **double-click it to fit the column to its content**, as in Excel. Arrow keys work on the focused edge.
- `reorderable`: drag a header to move its column. `meta: { reorderable: false }` pins a column such as actions.
- `hideable`: a Columns menu with a checkbox per column and "Reset layout".
- `height`: virtualizes the rows with react-window, so only the visible ones are in the DOM.
- `storageKey` keeps widths, order and visibility in `localStorage`. `size` is `'sm' | 'md'`, and `labels` translates the built-in copy. `onRowClick` and `getRowId` are new too.

- `selectable` adds a checkbox column. `true` keeps the boxes visible; `'hover'` shows them on hover only, for dense lists. The header box selects in two steps: first this page (an outlined check), then every filtered row across pages (a filled check). The toolbar also offers "Select all N". Shift+click selects a range, and `onSelectionChange` reports the selection.
- `columnSelection` gives Excel's column selection from a thin strip above the headers; a click on a name still sorts. The first click covers this page, the second every row, the third clears. Ctrl/⌘ adds a column, Shift selects a range, Escape clears.
- `filterable` adds a "contains" filter per column, behind a funnel on header hover. With `locale="tr-TR"` it folds Turkish İ/ı correctly.
- `exportable` adds an Export menu with CSV and Excel (.xlsx). It writes the selected columns of the selected rows; without selected rows, the rows the column selection covers; with no selection at all, everything filtered across all pages. `meta.exportValue` sets what a JSX cell exports. The .xlsx writer (`write-excel-file`) loads only on first export.
- The pagination bar is now rows per page (with All), the range, and first / previous / next / last. `pageSize` accepts `'all'`, and `pageSizeOptions` sets the choices. `serverPagination` drives it for lists paged on the server.
- Past 100 visible rows the grid virtualizes on its own, even without `height`.

Table gains the parts DataTable is built from, usable on their own with the static Table: `TablePagination`, `TableCheckbox` (always / hover, with a `scope="visible"` look for "this page"), `TableColumnFilter`, and `exportTable` / `toCsv`.

Columns without a `size` start fitted to their content and stretched to fill the container. Each header has a menu (sort, fit, move, hide) as the keyboard and touch path. The grid is now built from ARIA `grid` roles on divs instead of a `<table>`.

State and server data:
- Every piece of state can be controlled or left to the grid: `sorting`, `columnFilters`, `pagination`, `rowSelection`, `columnSelection`, `columnVisibility`, `columnOrder` and `columnSizing`, each with an `on…Change(next)` callback. `initialState` seeds the uncontrolled ones. Precedence, highest first: controlled prop, the layout stored under `storageKey`, `initialState`.
- `ref` (`DataTableHandle`) adds resets, `setPageIndex`, `getSelectedRows` and `getExportData`.
- `server={{ rowCount, loading }}`: `data` is one page, and sorting, filtering and paging go to the server. A loaded page is never sorted or filtered on its own. A new sort, filter or page size returns to page 1, and a page index past the end is clamped.
- Row selection is a model, `{ type: 'ids', ids }` or `{ type: 'allMatching', excludedIds }`. "Select all" can therefore cover rows only the server holds, and `selectionScope` is `'crossPage'` or `'page'`. The header box always describes the page on screen; the counter describes the whole selection.

Export:
- DataTable only decides what an export covers: `getExportData({ rows, columns })` with row scopes `selected`, `page`, `filtered`, `loaded` and `allMatching`, and column scopes `visible`, `selected` and `all`.
- Files come from the Table layer: `exportTable`, `toCsv`, `toXlsxBlob` and `downloadFile`. The .xlsx writer is a separate chunk, loaded on the first Excel export.
- In server mode, rows beyond the page come with a `request` for the app's backend, and `exportable={{ onServerExport }}` routes the menu to it. Without that callback the menu says only loaded rows are written.
- `meta.exportValue(row)` infers the row type.
- Dates in .xlsx are wall-clock dates, so a local midnight no longer shifts to the previous day.

Performance and accessibility:
- Dragging a header moves the columns in real time.
  - The dragged column, header and cells, follows the pointer.
  - Each column it passes slides the other way in step: one covered 30% has moved 30% of the way, with no jump at the midpoint.
  - A dashed outline marks where it will land and slides to each new slot.
  - On release past a column's half, everything glides into place in 150 ms, then the order changes. Escape glides back. Reduced motion skips the glide.
- Past 30 visible columns, only the columns in view render (`columnVirtualization`).
  - Scrolling sideways only adds and removes cells: no row re-renders the cells it keeps, and nothing on the grid is restyled. Columns that scroll into view are fitted once scrolling pauses, not mid-scroll.
  - Widths live in one stylesheet scoped to the grid, a rule per column, instead of variables on the grid root that every cell inherits: a resize restyles only the cells of the columns it changes.
  - Measured on a 100-column grid against the previous implementation: sideways scrolling uses about 75% less main-thread time, resizing about 70% less (both within a frame per step), the first render about 30% less.
- One shared header menu instead of one per column.
- The header row sticks to the page (`stickyHeader`).
- The grid is one tab stop, with `aria-activedescendant` navigation: arrows, Home/End, PageUp/PageDown; Enter sorts; Alt+↓ opens a column's menu; Ctrl+Space selects a column; Shift+Space selects a row; Ctrl+A selects all; F2 enters a cell and Escape returns.
- `aria-rowcount`, `aria-rowindex` and `aria-colindex` now count every row and column.
- Stored layouts are versioned and reconciled with the current columns.
- `savedLayout` + `onLayoutChange`: the app keeps the layout itself, e.g. in a cookie read on the server, so a server-rendered page arrives in the user's layout. `localStorage` (`storageKey`) only applies after hydration.
- On the server render, automatic columns start from widths estimated from their text, so fitting them after hydration barely moves them.
- Columns wider than the container scroll inside the table, even in a grid or flex parent. Before, they widened the page.
- While the columns fit their container, the table stays exactly as wide as its frame.
  - Dragging an edge works like a splitter: the columns to the right give way, but never below their content width. Their content widths are measured once, not on every pointer move or key press.
  - The last column's edge has no handle.
  - A double-click fit leaves no gap; a neighbour takes the freed space.
  - User-set widths stretch with the container too.
  - Columns that really don't fit still grow freely, and the table scrolls.
- When a server page already holds every matching row, selecting it counts as "all": no "Select all N" offer, and the next click clears.

Reliability, accessibility and API additions:
- `isRowSelectable(row)` limits which rows can be selected; checkboxes, Shift+click ranges, the header box, Ctrl+A, the counts and exports all respect it. With `server`, a restricted selection is always explicit ids (kept across pages) and "Select all N" is not offered.
- Selected rows hidden by a client filter stay selected and are returned (after the visible ones) by `getSelectedRows` and exports. A server "all matching" selection clears when the filters change, since its exclusions no longer describe the new result.
- Exports read each column's accessor with the row's original index, so sorted exports no longer misreport index-based accessors. The toolbar and `ref.export(format, options)` share one code path; both route rows beyond the loaded page to `onServerExport`. `onExportError(error, format)` reports failures; the toolbar also shows a status, and `ref.export` rejects.
- `aria-label` / `aria-labelledby` / `aria-describedby` name the grid (a development warning asks for a name). The rows-per-page picker is labelled. `aria-sort` marks the primary sort column; secondary sorts are described.
- The active cell follows its row and column through sorting, reordering and paging, stays mounted while virtualized rows or columns scroll away, and controls inside cells keep their own tab order (disabled and roving `tabIndex=-1` controls are skipped).
- `dir="rtl"`: arrows, resizing, reordering and horizontal scrolling follow the reading direction.
- `loading`, `loadingMessage` and `errorMessage` (error wins over loading, loading over empty). The status line renders inside the frame, outside the grid's row count.
- `rowVirtualization` (`'auto'` default, `true`, `false` to render every row, e.g. for printing), `autoSize` (`'initial'` default, `'data'` to refit after data changes, `false`), `ref.fitColumns(ids?)`, `toolbar` (your own controls beside the built-in ones), `meta.headerClassName` / `meta.cellClassName`, and `meta.filterControl` for a custom filter editor whose value need not be a string.
- Column ids with punctuation or non-Latin characters get collision-free CSS variable names. Width distribution respects every column's `maxSize`. Invalid `pageSize`, `pageIndex` or `rowCount` values throw a descriptive error.
- Table: `containerProps` configures the scrolling wrapper (class, attributes, ref) while `className` and `ref` still target the `<table>`.

**Breaking:**
- Sorting used to be always on. Add `sortable` to keep click-to-sort.
- `columnSelection` (the on/off flag) is now `selectableColumns`; `columnSelection` is the controlled `{ ids, scope }`.
- `serverPagination` is replaced by `server` + `pagination` / `onPaginationChange`.
- `onSelectionChange(rows)` still works but is deprecated in favour of `onRowSelectionChange(selection)`.
- Tab moves past the grid in one step; the controls inside it are reached with the keyboard model above.
- The `previous`, `next` and `page` labels are replaced by the pagination bar's labels.
- `react-window` and `write-excel-file` are new dependencies.
- `locale` defaults to `en-US` instead of the page's `<html lang>`, so the server and the browser sort, filter and label alike. Turkish apps pass `locale="tr-TR"`.
- With `server` and `selectable`, `getRowId` is required (a type error, and a runtime error in JavaScript).
- With `server` and `isRowSelectable`, an `allMatching` row selection throws; use explicit ids.
- Automatic column widths are fitted once (`autoSize="initial"`) and kept across data refreshes, sorting, filtering and paging. Pass `autoSize="data"` for the old refit-on-new-data behaviour, or call `ref.fitColumns()`.
- `ref.export` rejects when the requested rows reach past the loaded data and there is no `onServerExport`; ask for `rows: 'page'` or `'loaded'` to export what is loaded. The toolbar keeps its labelled loaded-only fallback.
- Layout persistence (`storageKey`, `onLayoutChange`) is debounced by 200 ms and flushed at the end of a gesture, on `pagehide` and on unmount, instead of writing on every pointer move.
- Grouped (nested) column definitions and footers are rejected; pass leaf columns.
- The empty/loading message is a `role="status"` line below the grid instead of a row inside it.
