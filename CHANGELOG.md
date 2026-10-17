# turkishcoffee

## 4.0.0

### Major Changes

- 9392385: DataTable is now a full data grid. Every interaction is an opt-in boolean prop and needs no other setup:
  
  - `sortable`: click a header to sort (Shift+click for a second key). The default comparison sorts by data type: numbers, dates and booleans by value, text in `locale` (default `en-US`), blanks last in both directions.
  - `resizable`: drag a column edge to resize; **double-click it to fit the column to its content**, as in Excel. Arrow keys work on the focused edge.
  - `reorderable`: drag a header to move its column. `meta: { reorderable: false }` pins a column such as actions.
  - `hideable`: a Columns menu with a checkbox per column and "Reset layout".
  - `height`: virtualizes the rows with react-window, so only the visible ones are in the DOM.
  - `layout={{ storageKey }}` keeps widths, order and visibility in `localStorage`. `size` is `'sm' | 'md'`, and `labels` translates the built-in copy. `onRowClick` and `getRowId` are new too.
  
  - `selectable` adds a checkbox column. `true` keeps the boxes visible; `'hover'` shows them on hover only, for dense lists. The header box selects in two steps: first this page (an outlined check), then every filtered row across pages (a filled check). The toolbar also offers "Select all N". Shift+click selects a range, and `selectable={{ onChange }}` reports the selection.
  - `selectableColumns` gives Excel's column selection from a thin strip above the headers; a click on a name still sorts. The first click covers this page, the second every row, the third clears. Ctrl/⌘ adds a column, Shift selects a range, Escape clears.
  - `filterable` adds a filter per column, behind a funnel on header hover, that fits the column's values (a checklist, Min and Max, a calendar or "contains"); `meta.filter` sets it. With `locale="tr-TR"` it folds Turkish İ/ı correctly.
  - `exportable` adds an Export menu with CSV and Excel (.xlsx). It writes the selected columns of the selected rows; without selected rows, the rows the column selection covers; with no selection at all, everything filtered across all pages. `meta.exportValue` sets what a JSX cell exports. The .xlsx writer (`write-excel-file`) loads only on first export.
  - The pagination bar is now rows per page (with All), the range, and first / previous / next / last. `pageSize` accepts `'all'`, and `pageSizeOptions` sets the choices. With `server` the backend pages, and All is not offered.
  - Past 100 visible rows the grid virtualizes on its own, even without `height`.
  
  Table gains the parts DataTable is built from, usable on their own with the static Table: `TablePagination`, `TableCheckbox` (always / hover, with a `scope="visible"` look for "this page"), `TableColumnFilter`, and `exportTable` / `toCsv`.
  
  Columns without a `size` start fitted to their content and stretched to fill the container. Each header has a menu (sort, fit, move, hide) as the keyboard and touch path. The grid is now built from ARIA `grid` roles on divs instead of a `<table>`.
  
  State and server data:
  - The simple table stays short: `<DataTable data={data} columns={columns} sortable />`. A feature's options and its state sit in its own prop, as an object in place of `true`: `selectable={{ value, defaultValue, onChange, scope, color, checkboxes, isRowSelectable, scopeKey, selectableRowCount }}`, `selectableColumns={{ value, defaultValue, onChange }}`, `exportable={{ fileName, fetchRows | onServerExport, onError }}` and `layout={{ storageKey | saved, onChange, defaults }}`.
  - Sorting, filters and page are one value, the query (`{ sorting, columnFilters, pagination }`): controlled with `query` + `onQueryChange(query, change)`, or kept by the grid from `defaultQuery`. A change that touches two parts is one change, reported once: a sort or filter on page 3 arrives as the new sort on page 1, so a server table makes one request per user action and needs no bookkeeping of its own. A page index past the end is clamped.
  - `ref` (`DataTableHandle`) adds `resetQuery` (one change, back to `defaultQuery`), the other resets, `setPageIndex`, `getSelectedRows` and `getExportData`.
  - `server={{ rowCount }}`: `data` is one page, and the backend sorts, filters and pages it from the query. A loaded page is never sorted or filtered on its own, and filter options, totals and selection counts never come from it. Server page sizes leave out All and default to 25. `loading` is the one loading flag.
  - Row selection is a model, `{ type: 'ids', ids }` or `{ type: 'allMatching', excludedIds }`. "Select all" can therefore cover rows only the server holds, and `selectable.scope` is `'crossPage'` or `'page'`. Rows picked one by one survive paging, sorting, filtering and searches; "every matching row" clears when the filters or `selectable.scopeKey` (the app's filters outside the grid, such as a search box) change. The header box always describes the page on screen; the counter describes the whole selection.
  
  Export:
  - DataTable only decides what an export covers: `getExportData({ rows, columns })` with row scopes `selected`, `page`, `filtered`, `loaded` and `allMatching`, and column scopes `visible`, `selected` and `all`.
  - Files come from the Table layer: `exportTable`, `toCsv`, `toXlsxBlob` and `downloadFile`. The .xlsx writer is a separate chunk, loaded on the first Excel export.
  - In server mode, rows beyond the page come with a `request`: the columns, the sorting, and the rows — `{ type: 'ids', ids }` for rows picked one by one, whatever the current filters, or `{ type: 'matching', columnFilters, scopeKey, excludedIds }`. The menu completes the export itself in either of two ways: `exportable.fetchRows(request)` returns the rows and the grid writes the file, or `exportable.onServerExport(request, format)` has the backend write it. With neither, the menu says only loaded rows are written.
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
  - `layout={{ saved, onChange }}`: the app keeps the layout itself, e.g. in a cookie read on the server, so a server-rendered page arrives in the user's layout. `localStorage` (`layout.storageKey`) only applies after hydration; the two are exclusive. A saved layout is fitted to today's columns: removed ones drop, new ones take their place from the definitions. "Reset layout" returns to `layout.defaults` and reports `null`.
  - On the server render, automatic columns start from widths estimated from their text, so fitting them after hydration barely moves them.
  - Columns wider than the container scroll inside the table, even in a grid or flex parent. Before, they widened the page.
  - While the columns fit their container, the table stays exactly as wide as its frame.
    - Dragging an edge works like a splitter: the columns to the right give way, but never below their content width. Their content widths are measured once, not on every pointer move or key press.
    - The last column's edge has no handle.
    - A double-click fit leaves no gap: the other columns share the difference, so fitting columns one after another never piles the freed space into the last one.
    - User-set widths stretch with the container too.
    - Columns that really don't fit still grow freely, and the table scrolls.
  - When a server page already holds every matching row, selecting it counts as "all": no "Select all N" offer, and the next click clears.
  
  Reliability, accessibility and API additions:
  - `selectable.isRowSelectable(row)` limits which rows can be selected; checkboxes, Shift+click ranges, the header box, Ctrl+A, the counts and exports all respect it. With `server`, a restricted selection is explicit ids (kept across pages) and "Select all N" is not offered — unless the backend counts the eligible rows (`selectable.selectableRowCount`); it then checks eligibility again when it acts on the selection.
  - Selected rows hidden by a client filter stay selected and are returned (after the visible ones) by `getSelectedRows` and exports. An "all matching" selection clears when the filters change, on the client and the server alike, since it no longer describes the new result.
  - Exports read each column's accessor with the row's original index, so sorted exports no longer misreport index-based accessors. The toolbar and `ref.export(format, options)` share one code path; both route rows beyond the loaded page to `fetchRows` or `onServerExport`. `exportable.onError(error, format)` reports failures; the toolbar also shows a status, and `ref.export` rejects.
  - `aria-label` / `aria-labelledby` / `aria-describedby` name the grid (a development warning asks for a name). The rows-per-page picker is labelled. `aria-sort` marks the primary sort column; secondary sorts are described.
  - The active cell follows its row and column through sorting, reordering and paging, stays mounted while virtualized rows or columns scroll away, and controls inside cells keep their own tab order (disabled and roving `tabIndex=-1` controls are skipped).
  - `dir="rtl"`: arrows, resizing, reordering and horizontal scrolling follow the reading direction.
  - `loading`, `loadingMessage` and `errorMessage` (error wins over loading, loading over empty). The status line renders inside the frame, outside the grid's row count. While loading, a thin bar runs under the header; rows keep full contrast instead of dimming.
  - `rowVirtualization` (`'auto'` default, `true`, `false` to render every row, e.g. for printing), `autoSize` (`'initial'` default, `'data'` to refit after data changes, `false`), `ref.fitColumns(ids?)`, `toolbar` (your own controls beside the built-in ones), `meta.headerClassName` / `meta.cellClassName`, and `meta.filter.control` for a custom filter editor whose value need not be a string.
  - Column ids with punctuation or non-Latin characters get collision-free CSS variable names. Width distribution respects every column's `maxSize`. Invalid `pageSize`, `pageIndex` or `rowCount` values throw a descriptive error.
  - Table: `containerProps` configures the scrolling wrapper (class, attributes, ref) while `className` and `ref` still target the `<table>`.
  
  **Breaking:**
  - Sorting used to be always on. Add `sortable` to keep click-to-sort.
  - `columnSelection` (the on/off flag) is now `selectableColumns`.
  - `serverPagination` is replaced by `server` + `query` / `onQueryChange`.
  - `onSelectionChange(rows)` is removed: `selectable={{ onChange }}` reports the selection, `ref.getSelectedRows()` its loaded rows.
  - Tab moves past the grid in one step; the controls inside it are reached with the keyboard model above.
  - The `previous`, `next` and `page` labels are replaced by the pagination bar's labels.
  - `react-window` and `write-excel-file` are new dependencies.
  - `locale` defaults to `en-US` instead of the page's `<html lang>`, so the server and the browser sort, filter and label alike. Turkish apps pass `locale="tr-TR"`.
  - With `server` and `selectable`, `getRowId` is required (a type error, and a runtime error in JavaScript).
  - With `server` and `isRowSelectable` but no `selectableRowCount`, an `allMatching` row selection throws; use explicit ids.
  - Automatic column widths are fitted once (`autoSize="initial"`) and kept across data refreshes, sorting, filtering and paging. Pass `autoSize="data"` for the old refit-on-new-data behaviour, or call `ref.fitColumns()`.
  - `ref.export` rejects when the requested rows reach past the loaded data and there is neither `fetchRows` nor `onServerExport`; ask for `rows: 'page'` or `'loaded'` to export what is loaded. The toolbar keeps its labelled loaded-only fallback.
  - Layout persistence (`layout.storageKey`, `layout.onChange`) is debounced by 200 ms and flushed at the end of a gesture, on `pagehide` and on unmount, instead of writing on every pointer move.
  - Grouped (nested) column definitions and footers are rejected; pass leaf columns.
  - The empty/loading message is a `role="status"` line below the grid instead of a row inside it.
- 448fcc8: Every component now answers two questions with two props, using the same names everywhere. `tone` says what something means: `neutral` · `info` · `success` · `warning` · `danger`. `variant` says how loud it is. Before, Badge, Alert, Toast and DropdownMenu each had their own names for the same meaning (`destructive`, `error`, `inverse`, `outline`), and Badge mixed meaning and emphasis in one list of seven.
  
  Button drops its `destructive` and `success` variants, so a screen has one coloured action. For a dangerous action keep the button primary, name the consequence in its label and confirm in an AlertDialog. `outline` and the grey `secondary` were the same emphasis, so they merge into one bordered `secondary`.
  
  | Before | After |
  |---|---|
  | `<Button variant="default">` / `buttonVariants({ variant: 'default' })` | `variant="primary"` (still the default) |
  | `<Button variant="outline">` | `variant="secondary"` |
  | `<Button variant="secondary">` (grey fill) | `variant="secondary"` (now bordered) |
  | `<Button variant="destructive">` / `"success"` | `variant="primary"` |
  | `<SplitButton variant="default" \| "outline">` | `"primary"` \| `"secondary"` |
  | `<Badge variant="default">` | `<Badge tone="info" variant="solid">` |
  | `<Badge variant="secondary">` / `"outline"` | `<Badge>` (`tone="neutral"`, `variant="soft"`) |
  | `<Badge variant="inverse">` | `<Badge variant="solid">` |
  | `<Badge variant="success" \| "warning" \| "destructive">` | `<Badge tone="success" \| "warning" \| "danger">` (soft); add `variant="solid"` for the old filled look |
  | `<Alert variant="default">` | `<Alert>` (`tone="neutral"`) |
  | `<Alert variant="info" \| "success" \| "warning" \| "destructive">` | `<Alert tone="info" \| "success" \| "warning" \| "danger">` |
  | `<DropdownMenuItem variant="destructive">` | `<DropdownMenuItem tone="danger">` |
  
  Tokens: `--destructive` / `--destructive-foreground` are renamed `--danger` / `--danger-foreground` (`bg-destructive` → `bg-danger`). Each tone gains a soft tint and a readable text colour: `--primary-soft`, `--danger-soft`, `--danger-text`, `--success-soft`, `--success-text`, `--warning-soft`, `--warning-text`. The `-text` colours are at least 4.5:1 on the page and on their tint, so a warning Alert now colours its text and gets a default icon like the other status tones.

### Minor Changes

- 496383b: Export the icons an app shell needs from the root: SearchIcon, BellIcon, SettingsIcon, MenuIcon, SidebarIcon, LogoutIcon, HomeIcon, BuildingIcon, BriefcaseIcon, WalletIcon, ClockIcon, MapPinIcon, PhoneIcon, PencilIcon, UploadIcon, CloudUploadIcon, FileIcon, FolderIcon, FolderOpenIcon, plus MailIcon, CalendarIcon, PlusIcon, DownloadIcon and EllipsisIcon (Tabler Icons, MIT).
- c3036fa: AvatarGroup: overlapping avatars that spread on hover and keyboard focus. Past `max` (4) the rest collapse into a `+N` button that lists them by name. Each AvatarGroupItem takes a `name`, which screen readers announce and which supplies the initials.
  
  The avatar under the pointer or keyboard focus grows above its neighbours and shows the person's name in a tooltip. Pass `render={<Link href="…" />}` to AvatarGroupItem to make it a profile link, in the stack and in the `+N` list.
- 448fcc8: Breadcrumb steps are padded segments that take the selection fill on hover, so the hover target is clear. An icon placed before the text turns primary on hover, and the current page is semibold. BreadcrumbButton is a step that acts instead of navigating, e.g. the trigger for a menu of collapsed steps.
  
  A step's text truncates at about 30 characters (`[--breadcrumb-text-max:50ch]` on Breadcrumb changes it) and shows in full in a tooltip, only when it is cut off.
- f539577: A column of known values (a status, a type, a department) filters from a checklist. Give it `meta.filter.options`, each option a `value`, a `label` and optionally a `count` (on the client, options without one are counted), and its header funnel opens one checkbox per option, with the count beside it, instead of a "contains" field. Tick the values to show; with none ticked nothing is filtered, so there is no "Select all" to keep in step. From six options a search field above the list narrows it, and ArrowDown moves from it into the list. The filter value is the array of ticked values: on the client a row passes when its cell holds one of them; on the server the app reads it from the query's `columnFilters`.
  
  The checklist is also `TableColumnOptionsFilter`, for a static Table, beside `TableColumnFilter`. New labels: `filterSearchOptions`, `filterNoOptions` on DataTable; `searchOptions`, `noOptions` on the column filters.
- 363e824: Add Combobox on Base UI's combobox: type to filter a long list, single value with clear and open buttons, or several as chips with `multiple`. Groups, an empty message, and the same field edge, sizes and focus as Input and Select.
- c3036fa: CommandButton and SplitButton. CommandButton is a borderless toolbar command with a brand-coloured icon; as a DropdownMenuTrigger it adds a chevron and stays filled while the menu is open. SplitButton pairs a main action with a chevron that opens a menu of related actions, as two buttons with their own names; `variant` and `size` apply to both halves, and the action can be disabled alone.
  
  The split button's menu opens under the whole button from its left edge, so the menu lines up with the whole control. For that, DropdownMenuContent takes `anchor` (an element or ref) to position against something other than its trigger, like PopoverContent.
- f539577: Add `actionsColumn` to `turkishcoffee/data-table`, the column for a row's actions menu. It is 56px wide and its cell is centred. Its header is read by screen readers only, and its `label` names it in the Columns menu. It cannot be sorted, filtered, resized, hidden, moved or exported. `EllipsisIcon` is now exported from the package root for its trigger.
- f539577: DataTable's toolbar shows a Clear filters button (a struck-through funnel) while any column filter is set, so every filter goes in one click instead of opening each header's funnel. It returns the grid to the first page like any other filter change. Translate it through the new `clearFilters` label. Adds `FilterOffIcon`.
- f539577: DataTable's export menu names the rows it will write: "2 selected rows", "20 rows on this page", "120 rows". `getExportData()` returns the resolved `scope` (`selected`, `page`, `filtered` or `loaded`; DataTable picks one when `rows` is `auto`), and the `exportScope` and `exportLoadedOnly` labels receive it as a third argument. Labels written for two arguments keep working.
- f539577: DataTable's selection no longer moves the page. The count joins the controls row beside Export, tinted like the selected rows, with a clear button. It used to open a grey row of its own under the controls, carrying Export down with it and pushing the grid about 50px. Export and Columns are CommandButtons now: borderless, the icon in the brand colour, with a chevron that shows they open a menu.
  
  Server tables keep a selection across pages and searches, and can export it. A row can only be ticked while it is loaded, so DataTable keeps the data of each selected row; an export of the selection writes rows from other pages and earlier searches without asking the backend. The count says how many selected rows are not on the page (new label `rowsOffPage`). New `selectable.scopeKey`: pass the filters that live outside the grid (a search box, status tabs) as one string, and an "every matching row" selection resets when they change, as it does with the grid's own filters. An export request carries it.
- f539577: DataTable loading its first page draws placeholder rows under its real headers, one Skeleton bar per column at the columns' own widths, instead of a "Loading…" line in an empty frame. The rows share Skeleton's glint and are not grid rows; a screen reader still hears the loading label. `loadingMessage` still replaces them with the app's own content.
  
  New `DataTableSkeleton`, from `turkishcoffee/data-table`: the same frame, header and rows, for where DataTable can't render yet, such as a Suspense fallback around a server fetch. Pass the real headers (`columns={['Name', 'Email']}`) or a column count, and `selectable` and `size` as the table will have them, so nothing jumps when it arrives.
- f539577: DataTable's column filters fit the column's values. Dates get a calendar picking one day or a range (`{ from, to }`, whole local days, both included), with month and year drop-downs and month and day names in `locale`. Numbers get Min and Max (`{ min, max }`, both included). Booleans get a checklist, named by `meta.filter.options` or Yes/No; the filter never borrows the export's or the cell's wording. Anything else keeps "contains". Set `meta.filter.variant` (`text`, `options`, `number`, `date`) when the values do not say it, such as dates kept as ISO strings, or `options` for a column of a few repeated values: on the client its checklist lists them with their counts. The default `filterFn` handles every shape; A kind seen once is kept, so an empty page or a page of blanks never turns a calendar back into a text field. On the server the app reads the values from the query's `columnFilters`.
  
  The panels are also `TableColumnNumberFilter` and `TableColumnDateFilter` for a static Table. Every filter panel now grows to fit its content, so translated buttons no longer run past its edge. `Calendar` styles `captionLayout="dropdown"`. New DataTable labels: `filterMin`, `filterMax`, `filterPickDates`, `filterTrue`, `filterFalse`; on the column filters `min`, `max`, `pickDates`.
- 363e824: Add FileUpload: a drop zone that also opens the file picker by click or keyboard, checks `accept`, `maxSize` and `maxFiles`, reports rejections with a reason and announces results to screen readers. FileUploadItem shows a file's size, upload progress or error, with remove and custom actions. The app keeps the files and does the uploading. `formatFileSize` is exported.
- fd7afaa: Improve FormTabs with compact scrolling steps, persistent error indicators, localized navigation labels, and an optional FormTabsActions row. Track validated completion separately from visitation, invalidate completion when fields change, serialize asynchronous navigation, and focus errors after controlled panels open. Expose isNavigating and getStepState from useFormTabs.
- f33df76: FormTabs marked a tab with errors by a small red dot. On the active tab it was red on blue, close to 1:1, so it read as a rendering glitch, and it carried the error by colour alone. A stepper (`linear`) also looked exactly like free tabs, so nothing showed the order, how far along you are or which steps are done.
  
  - A tab with errors now shows an error icon and how many fields to fix, in the danger colour (white on the active tab), with the count in its accessible name.
  - With `linear`, the new `FormTabsList` draws a stepper instead of tabs: a progress line, a numbered marker and the step's name. Done steps show a check, the current one is filled and bold, a step left with errors shows an error icon and "N fields to fix", and steps past the next one can't be picked until the ones before them are done. The current step carries `aria-current="step"`. On a phone only the current step keeps its name. Use `FormTabsList` in place of `TabsList` inside FormTabs; it renders the usual tabs when `linear` is off.
  - New `FormErrorSummary`: after a failed submit, a danger Alert above the form lists every error, each a link that opens the tab holding the field and focuses it. Optional — worth it on long or tabbed forms.
  - `useFormTabs()` also returns `errorCount(step)`.
- c3036fa: InfoLabel: a Label with an info button that explains the field on click, tap or Enter; while open its icon fills in primary, so it is clear the explanation is showing. FormLabel takes `info` to render one inside a form field.
- 09efaf1: Text is now set in Inter, shipped with the library, instead of the platform's own font. The platform font drew every screen differently: Segoe UI on Windows has no 500 weight, so medium and semibold looked alike, and widths and line breaks changed from one operating system to the next. Inter gives the same widths, weights and line breaks on Windows, macOS and Linux.
  
  - Nothing to install: `turkishcoffee/theme.css` loads the fonts. Your bundler picks up the two files from `dist/styles/fonts/` (78 KB upright, 86 KB italic; the italic downloads only when something is set in italic).
  - Subset for Turkish and English interfaces (ğ, İ, ı, ş, ₺ and typographic punctuation), with both variable axes: weight 100–900, and optical size, which moves large headings to a tighter display cut on its own.
  - A fallback face resized to Inter's metrics holds the layout while the font loads, so text does not jump when Inter arrives.
  - Greyscale antialiasing on macOS and no synthesized bold or italic.
  - To keep the platform font, redeclare `--font-sans` after importing the theme; Inter is then never downloaded.
- 496383b: Components speak the page's language. Every word a component renders itself (DataTable, TablePagination, the column filters, FileUpload, FormTabs, SearchField, Combobox, DatePicker and Calendar, Dialog and Sheet close buttons, Pagination, Spinner, InfoLabel, Sidebar, DataTableSkeleton) ships in English and Turkish, with the locale's numerals and dates.
  
  The language comes from, in order: the component's own `locale` (and single words from `labels`), the new `LocaleProvider`, the page's `<html lang>`, and English. `<html lang>` is read after hydration, so a server-rendered page wraps its root in `<LocaleProvider locale="tr-TR">` to render in Turkish from the first byte. A locale in any other language gets English words with its own formatting. `useLocale`, `LocaleText`, `languageOf` and the per-component `*LabelsForLocale` helpers are exported for building the same.
  
  Behaviour changes: DataTable's `locale` no longer defaults to `en-US` but to the provider's or the page's, and now also picks the language of its words; `Spinner` is a client component; `PaginationPrevious`/`PaginationNext` are named by their visible word ("Previous", "Next"), which stays readable below `sm`; `DateRangePicker` formats with `PP` by default, so a Turkish range reads "15 Eki 2026".
- a027a6a: A new palette of its own: warm greys with a trace of coffee brown instead of pure greys, a #1760B0 brand blue, new status colours, and a warm #1C1A18 dark page instead of pure black, which is easier on the eyes. Every text pair stays at least 4.5:1 and every control edge and focus ring 3:1, in light and dark.
  
  - New `primary-text` token: brand-coloured text and icons use `text-primary-text`. In dark mode `primary` is now a fill too dark to read as text. Replace `text-primary` with `text-primary-text` in your own code.
  - New `field` and `field-hover` tokens: text fields, selects, checkboxes and radios get one even edge that reaches 3:1 on its own and darkens on hover. A focused text field turns that edge into a 2px brand line inside the box instead of an outer ring.
  - Focus rings are a solid 2px `ring-ring` (was 3px at 50%, under 3:1); buttons and switches add a 2px offset.
  - Alert's warning variant keeps its text dark and colours only the icon; orange text on white was unreadable.
  - Dark mode status fills are bright with dark text, so they pass 4.5:1 both as fills and as text.
- 363e824: New `PasswordInput`: a password field with a button that shows what was typed, built on InputGroup. The button is a toggle with one name ("Show password", in the page's language) and `aria-pressed`, so a screen reader hears its state instead of a label that changes under the cursor. Every other prop goes to the `<input>`, so it drops into a `FormControl`. `EyeIcon` and `EyeOffIcon` are exported.
- 496383b: SearchField shows a search icon and takes `hideLabel` (the label stays for screen readers) and `size="sm"` (32px), for toolbars and top bars.
- c3036fa: Add SearchField with debounced search, immediate Enter and clear actions, loading feedback, and external value synchronization.
- 363e824: Add `SegmentedControl`, `SegmentedControlItem` and `SegmentedControlCount`: a row of mutually exclusive options that change what the page shows, such as a list's status filter. It is built on Base UI's ToggleGroup and takes a single `value`. One segment always stays pressed. The pressed segment has the page background and a `--field` edge, at least 3:1 against the track in light and dark. All segments use the same font weight, so pressing one does not change the widths. `SegmentedControlCount` shows a count in tabular figures.
- 363e824: Add `SidebarSwitcher` and `SidebarSwitcherItem`: switch the company, branch or workspace the app is looking at from the top of the sidebar. The current one's logo, name and a second line open a menu of the others, with a check on the current one; on the icon rail it shrinks to the logo.
  
  Add `SidebarProvider`: it holds the collapsed state above the Sidebar, so a `SidebarTrigger` can sit outside it, in the page's top bar beside the breadcrumb. A Sidebar with its own `collapsed` (the copy in a mobile Sheet) ignores it. `SidebarTrigger` no longer pushes itself to the end with `ms-auto`; SidebarHeader does that for a trigger inside it.
- 363e824: Tab reaches every row of a Sidebar, as it does the links of any menu. Before, the whole navigation was one tab stop, and its other pages could be reached only with the arrow keys, which few people try in a sidebar. The arrow keys still work, and a disabled item is skipped by Tab but still reachable with them. The behaviour comes from a new Tree option, `tabStops="every"`; Tree's default stays one tab stop, the ARIA tree pattern, right for a file tree.
- 363e824: Add Sidebar, the app's side navigation, built on Tree and drawn like one: folders (SidebarCategory) with the chevron on the left fold their pages (SidebarItem) in and out, to any depth, one indent step per level. One tab stop with arrow keys, sections, counts, real links (`href` or your router's `<Link>`), `active` for the current page (a soft brand fill with brand text and icon), and an icon rail (`collapsed`) with labels in tooltips. It draws no edge line: its own faint grey, the new `--sidebar` token (`bg-sidebar`), sets it apart from the page, and hover fills inside it step up to `--selection` so they still show.
- 09efaf1: Skeleton has its own motion in place of Tailwind's `animate-pulse`. A brand-blue glint crosses the page diagonally from the bottom-left corner to the top-right, comes back fainter, then rests. It is pinned to the viewport, so all the skeletons on a page share one light and the page loads as one surface instead of many boxes blinking on their own. Reduced motion keeps a still fill. The colours are tokens: `--skeleton`, `--skeleton-glint` and `--skeleton-glint-return`. A background utility in `className` still overrides the fill.
- 8037792: Table and DataTable take two props for how body rows look. `striped` alternates the rows' background, virtualized rows included; it is off by default. Customize it through the `--table-row-odd` and `--table-row-even` theme tokens; hover and selection keep precedence. `selectionColor` colours selected rows: `neutral` (default) is grey, `primary` the brand's soft tint. Customize them through `--table-row-selected` and `--table-row-selected-primary`.
- 8037792: Table rows and headers share DataTable's look: semibold, full-contrast headers and 12px cell padding.
- f539577: Clearer hierarchy on tables, mostly in dark.
  
  - Table and DataTable headers sit on their own faint surface (`--table-header`) and their labels drop to medium `--muted-foreground`, so the data reads first and the labels second.
  - A hovered row is a lighter wash (`--table-row-hover`) than a selected one; in dark the two were 1.06:1 apart.
  - Dark: row hairlines are fainter, the Sidebar sits closer to the page, and `--muted-foreground` steps down to `#a8a29b` (still 4.5:1 on every surface).
  - Badge text is semibold, so small status badges stay legible.
  - Dark: `--primary-text` is a softer `#74a8dc`, closer to the `--primary` fill; `--success` and `--success-text` brighten to `#6cc584` (6.6:1 on `--success-soft`). Light `--success-text` darkens to `#0e632f` (6.8:1 on `--success-soft`).
- 448fcc8: TrashIcon (Tabler Icons `trash`), exported from the root for delete actions.
- 363e824: Add Tree: an expandable hierarchy (folders, org charts, nested categories) with one tab stop and full keyboard support — arrows, Home/End, `*` to open siblings and type-ahead. Single or multiple selection, controlled or uncontrolled open and selected items, `onAction`, and two row layouts (TreeItemLayout with hover actions, TreeItemPersonaLayout). Rows keep a fixed height and hover never moves them. TreeItemRow and useTreeItem build custom rows, including link rows.

### Patch Changes

- 09efaf1: Brighter brand blue in light mode: `--primary` is `#156cdd` and `--primary-soft` is `#def0ff`, so a primary button and an active nav item share one blue. `--primary-text` is `#1466d2`, a shade darker, because `#156cdd` as text on `--primary-soft` reads 4.27:1 and text pairs stay at 4.5:1 or more. Dark mode is unchanged.
- 496383b: `secondary` and `ghost` Buttons turn their icon `--primary-text` on hover, as a breadcrumb step does, so an icon button (SidebarTrigger, toolbar and pagination buttons) answers the pointer the same way across the app.
- 496383b: Fix Calendar without `mode`: a read-only month collapsed its day cells to the width of their text, because only the day button gave the column its size.
- 448fcc8: Checkbox's mixed state (`indeterminate`) showed a check mark, so a partly selected list looked fully selected. It now shows a distinct mark: a primary outline around a small filled square.
- 09efaf1: Fix `cn()` keeping both classes when `className` overrides a control-size or float-shadow class: `size-6` now replaces `size-control`, `h-8` replaces `h-control`, `shadow-none` replaces `shadow-float`. Before, the stylesheet's order picked the winner, so `<Button size="icon" className="size-6">` stayed 36px.
- 496383b: CommandButton's icon is grey at rest and takes the brand colour on hover, when pressed and while its menu is open, as a Button's icon does. A toolbar of blue icons read as several commands already active.
- f539577: The columns `getExportData()` returns now read any row, not only the rows DataTable holds. A server export can fetch the rows its `request` covers and write them with those columns — what `exportable.fetchRows` does for the menu. Before, every column without `meta.exportValue` came out empty for such rows.
- f539577: In server mode, a page that already holds every matching row (`server.rowCount`) exports itself. `getExportData()` returns no `request` for it, so the export no longer calls `fetchRows` or `onServerExport`. Without them, the menu no longer calls the export "loaded rows only", and `ref.export()` no longer throws.
- f539577: Fix DataTable's header shaking while the table scrolls sideways. The header strip was mirrored from the body's scroll event, which arrives a frame after the browser has already moved the body. Where scroll-driven animations exist (Chrome, Edge, Safari) the browser now moves the header in the same frame as the body; Firefox keeps the event mirror. Also fixes virtualized rows in `dir="rtl"`, which sat in the unscrollable overflow on the right, so the body could not scroll sideways and the cells did not line up with the header.
- f539577: DataTable gains `multiSort` (default `true`). `multiSort={false}` keeps one sort column: Shift+click and Shift+Enter replace the sort instead of adding to it. For a backend that sorts by one column, the grid no longer shows a second sort that the server ignores.
- f539577: A `size="sm"` DataTable no longer grows scrollbars when a cell is taller than its 32px row, such as a row-actions button at the default 36px. The body scrolls only sideways now: before, the overflowing cell opened a vertical scrollbar, and the room it took pushed the columns into a horizontal one too. Button gains `size="icon-sm"`, a 32px square, so an icon button fits an sm row exactly.
- ffe6494: README describes v3 (Base UI, `render`, sonner toasts, transitions) instead of v2; AGENTS.md lists the FormTabs exports and when to pick FormTabs over Tabs.
- f539577: On a DataTable whose columns can be dragged (`reorderable`), a click on a header's label no longer sorts: the label is what you grab to move the column, and the grab cursor said so while a click sorted anyway. The arrow after the label sorts, with a hover target of its own, and on touch screens it stays faintly visible. Enter or Space on a header and a screen reader's press still sort. Columns that can't be moved sort from the whole label, as before.
- 496383b: A `secondary` or `ghost` Button holding its menu or popover open keeps a pressed look: the fill deepens to `--selection` and the icon stays `--primary-text`. Before, the hover state dropped as soon as the pointer moved into the menu, so the trigger of an open menu looked idle. Pressing gives the same fill, as on a CommandButton. A breadcrumb step that opens a menu does the same.
- 09efaf1: Hover and selection surfaces are a cool neutral grey in light mode: `--accent`, `--muted` and `--secondary` are `#f3f4f6`, `--selection` is `#e8eaee`. The warm greys over white read as cream on a hovered row or menu item. Text, borders and dark mode keep their warm greys. `--selection` is also a shade lighter than before, so `--primary-text` (a link in a selected row) now clears 4.5:1 on it.
- f539577: Quieter table lines. Body rows in Table and DataTable are now separated by `--table-row-divider`, a fainter hairline than `--border`. The header line and the table frame keep `--border`. DataTable's column resize lines are hidden until the pointer is over the header row, and the handle under the pointer, in focus or being dragged still shows the primary line. On a touch screen, which has no hover, the lines stay visible. `TableCheckbox` takes clicks up to 8px around its 16px box, a 32px target.
- f539577: Keep custom table controls and column settings together, and group selection counts, export and a visible clear-selection action in an inline bar above the grid. Use the standard control height for toolbar buttons.

## 3.1.0

### Minor Changes

- 8e08c3d: Add `FormTabs` to `turkishcoffee/form`: one react-hook-form form split across tabs that keep their values while hidden. Tabs with an error get a dot and a failed submit opens the first one; `linear` turns it into a stepper whose Next (`FormTabsNext`/`FormTabsPrevious`, `useFormTabs`) validates the current step first.
- 8e08c3d: Add `UsersIcon`, `UserIcon` and `FolderUserIcon` (Tabler Icons, MIT), exported from the package root.

### Patch Changes

- 8e08c3d: Drop the primary tint from active states: the active tab drops its blue underline for a solid primary fill, the open accordion header its tint and left edge, and the selected table row its left edge. `--selection` is now the neutral `--accent` grey, so highlighted menu items, selected rows and calendar ranges stay grey.
- 8e08c3d: Redraw the stroke icons (X, Check, Chevrons, ChevronsUpDown, Ellipsis, Calendar) and `SuccessIcon` from Tabler Icons (MIT); the license ships in `THIRD_PARTY_LICENSES.md`. `InfoIcon` and `ErrorIcon` are unchanged.

## 3.0.2

### Patch Changes

- 46586e6: `theme.css` now sets the body font: the platform's own UI font (San Francisco on Apple devices, Segoe UI on Windows, then Helvetica Neue, Tahoma and Arial) through `--font-sans`. Nothing is downloaded. An app that loads its own font keeps it by redeclaring `--font-sans`.

## 3.0.1

### Patch Changes

- e271314: A design language of its own for business screens, driven by theme tokens:
  
  - **Sharp corners:** `--radius` is 4px, with a 2/4/6/8px scale. Cards, dialogs and toasts are 6px; small parts are 2px.
  - **Compact controls:** `--spacing-control*` tokens (28/32/36px, so `h-control`). Button, Input, Select, NativeSelect, InputGroup and TabsList share them. The default button is now 32px (was 36px).
  - **Flat surfaces:** resting controls and cards lose their shadows. `shadow-float` is the single elevation for popovers, menus, dialogs, sheets and toasts.
  - **Tinted active states:** `--selection` replaces the grey highlight in menus, select and calendar ranges. The open accordion header, the active tab and the selected table row get a 2px primary edge.
  
  Visual only, no API changes. Layouts that assumed the 36px control height may need a look.

## 3.0.0

### Major Changes

- 8c0a3d1: Move every component from Radix UI (and vaul) to Base UI. Radix is no longer in the dependency tree.
  
  Breaking changes — see "Upgrading from v2 (Radix) to v3 (Base UI)" in AGENTS.md:
  
  - `asChild` is replaced by `render`: `<Button render={<Link href="/x" />}>Go</Button>`.
  - Accordion: `type="single" | "multiple"` + `collapsible` become `multiple?: boolean`; `value` is always an array.
  - Checkbox: `checked="indeterminate"` becomes the `indeterminate` prop.
  - DropdownMenuItem: `onSelect` becomes `onClick`.
  - Tooltip: `delayDuration` becomes `delay`.
  - Select: pass `items` so SelectValue shows the item's label.
  - `PopoverAnchor` is removed; use the `anchor` prop on PopoverContent.
  - Change handlers receive a second `eventDetails` argument.
  - `data-[state=*]` selectors become `data-open`, `data-checked`, `data-active`, …
  - The `animate-ui-*` animation tokens are removed from theme.css; overlays use CSS transitions.
  - Drawer, and Dialog on mobile, run on Base UI's Drawer instead of vaul.
  - Button and BreadcrumbLink are now client components; Label, Separator and AspectRatio are now server-renderable.

### Minor Changes

- d3b27c0: Ship docs for AI agents inside the package: `AGENTS.md` (setup, import map,
  differences from shadcn/ui, rules), `docs/<component>.md` for every component,
  and `llms.txt` / `llms-full.txt`. Every export now carries JSDoc with an
  example, so hover and go-to-definition explain the API.
  
  Point your agent at it with one line in your project's `CLAUDE.md` or `AGENTS.md`:
  `UI: use turkishcoffee — read node_modules/turkishcoffee/AGENTS.md before writing components.`

## 2.0.0

### Major Changes

- 918eebc: Add `Calendar`, `DatePicker` and `DateRangePicker` (built on react-day-picker, styled with theme tokens, localizable via date-fns locales), and a standalone vaul-based `Drawer`.
  
  `Dialog` is now responsive: it stays a centered modal on `sm` screens and up and becomes a vaul bottom drawer (swipe to dismiss, no X button) below 640px. The API is unchanged. It renders as a drawer during SSR and switches after hydration, and a dialog that is open while the viewport crosses the breakpoint remounts. The date pickers follow the same rule: a popover on desktop, a drawer on mobile.
- d616718: Toast is now built on [sonner](https://sonner.emilkowal.ski). `Toaster` wraps sonner's `Toaster` with theme tokens, and `toast` is sonner's API: `toast('Saved', { description })`, `toast.success(...)`, `toast.error(...)`, `toast.dismiss(id)`.
  
  Removed: `Toast`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`, `dismissToast`, `useToasts`, and the `ToastProps` / `ToastOptions` / `ToastRecord` / `ToastVariant` types. Migrate `toast({ title, description })` to `toast(title, { description })` and `dismissToast(id)` to `toast.dismiss(id)`. Pass `richColors` to `<Toaster />` for solid success/error colors like the old variants.

## 1.1.2

### Patch Changes

- f1d7fd3: Ship declaration maps and the TypeScript sources next to `dist`, so that
  go-to-definition in a consuming app lands on the component's own source file
  instead of the generated `dist/**/*.d.ts`.
  
  `dts` now runs with `sourcemap: true` and `files` carries `src` alongside
  `dist` — a `.d.ts.map` is worthless if the file it points at was never
  published. Stories and tests stay out of the tarball, which more than pays for
  the sources: the package goes from 87.2 kB to 79.1 kB.

## 1.1.1

### Patch Changes

- af3cb26: Add the components the library was missing next to a full shadcn set:
  Accordion, Alert, AlertDialog, AspectRatio, Breadcrumb, Collapsible, HoverCard,
  InputGroup, NativeSelect, Progress and Spinner.
  
  All eleven are built on the `radix-ui` package and the inline icons that are
  already dependencies, so the install footprint does not change. Six of them
  render on the server; only the ones holding Radix state carry `"use client"`.
  
  Accordion and Collapsible animate their measured height, which needs the new
  `--animate-ui-accordion-*` and `--animate-ui-collapsible-*` tokens in
  `theme.css`.
