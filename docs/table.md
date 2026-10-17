# Table

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption, exportTable, toXlsxBlob, toCsv, downloadFile, TableCheckbox, tableColumnFilterLabelsForLocale, defaultTableColumnFilterLabels, columnFilterTriggerClass, ColumnFilterPopover, TextFilterPanel, OptionsFilterPanel, NumberFilterPanel, DateFilterPanel, TableColumnFilter, TableColumnOptionsFilter, TableColumnNumberFilter, TableColumnDateFilter, tablePaginationLabelsForLocale, defaultTablePaginationLabels, TablePagination, type TableProps, type TableExportFormat, type TableExportColumn, type TableExportOptions, type TableCheckboxProps, type TableColumnFilterLabels, type TableColumnFilterOption, type TableColumnNumberRange, type TableColumnDateRange, type TableColumnFilterProps, type TableColumnOptionsFilterProps, type TableColumnNumberFilterProps, type TableColumnDateFilterProps, type TablePageSize, type TablePaginationLabels, type TablePaginationProps } from 'turkishcoffee'
```

Plain styled table primitives — no data library, server-renderable; wraps the
table in a horizontally scrolling container. For sorting/pagination over a
column model, use `turkishcoffee/data-table`.

## Example

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {invoices.map((inv) => (
      <TableRow key={inv.id}>
        <TableCell>{inv.id}</TableCell>
        <TableCell className="text-right">{inv.amount}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

### `TableProps`

- `containerProps?: React.ComponentProps<'div'>` — Props and ref for the scrolling wrapper; className and ref on Table still target the native table.
- `selectionColor?: TableRowAppearance['selectionColor']` — The background of rows with `data-state="selected"`: `'neutral'` (default) is grey, `'primary'` the brand's soft tint.
- `striped?: boolean` — Alternate the body rows' background. Off by default.

### `TableExportColumn`

- `width?: number` — On-screen width in px; becomes the .xlsx column width.

### `TableExportOptions`

- `fileName?: string` — Without extension. Defaults to "export".
- `locale?: string` — Formats dates and numbers in CSV and picks its delimiter. Defaults to `<html lang>`.

### `TableCheckboxProps`

- `appearance?: 'always' | 'hover'` — `always` (default): visible on every row. `hover`: subtle selection, for dense lists — hidden until its row (`group/row`) or header (`group/header`) is hovered or focused, and shown for good once it is checked, or anything in the table is: pass `revealed`, or put `data-has-selection` on an ancestor (DataTable does, so no row has to re-render).
- `revealed?: boolean` — Keeps a `hover` checkbox visible, e.g. while any row is selected.
- `scope?: 'visible' | 'all'` — For a checked header box: `'all'` (default) — every row is selected, a filled box. `'visible'` — only the rows on screen (this page) are; an outlined box, so it reads differently from "everything". The usual two-step: first click selects the page, the next one everything.

### `TableColumnFilterLabels`

- `filter: (column: string) => string` — Title and trigger name: "Filter Name".
- `contains: string` — Caption above the text filter's input.
- `searchOptions: string` — The options filter's search field, shown from six options.
- `noOptions: string` — The options filter when its search matches none.
- `min: string` — The number filter's lower bound.
- `max: string` — The number filter's upper bound.
- `pickDates: string` — The date filter before a day is picked.

### `TableColumnFilterOption`

- `count?: number` — Shown beside the label: the rows with this value, when the app knows.

### `TableColumnFilterProps`

- `column: string` — The column's name, for the title and the trigger's accessible name.
- `value: string` — The applied filter text; empty when none.
- `onApply: (value: string) => void` — Called with the new text, or `''` to clear.
- `tabIndex?: number` — The funnel's tab order; a grid that manages focus itself passes -1.

### `TableColumnOptionsFilterProps`

- `column: string` — The column's name, for the title and the trigger's accessible name.
- `value: readonly unknown[] | undefined` — The values shown; `undefined` when nothing is filtered out.
- `onApply: (value: Array<TableColumnFilterOption['value']> | undefined) => void` — The ticked values, or `undefined` when none is ticked.
- `locale?: string` — Formats the counts and folds case for the search; the page's language.
- `tabIndex?: number` — The funnel's tab order; a grid that manages focus itself passes -1.

### `TableColumnNumberFilterProps`

- `column: string` — The column's name, for the title and the trigger's accessible name.
- `onApply: (value: TableColumnNumberRange | undefined) => void` — The bounds, or `undefined` when both are empty.
- `tabIndex?: number` — The funnel's tab order; a grid that manages focus itself passes -1.

### `TableColumnDateFilterProps`

- `column: string` — The column's name, for the title and the trigger's accessible name.
- `onApply: (value: TableColumnDateRange | undefined) => void` — The days picked (`from` and `to` the same for one day), or `undefined` to clear.
- `locale?: string` — Month and day names, the first day of the week and the summary's format.
- `tabIndex?: number` — The funnel's tab order; a grid that manages focus itself passes -1.

### `TablePaginationLabels`

- `range: (from: number, to: number, total: number) => string` — "1–10 of 1374". `from` is 0 when there are no rows.

### `TablePaginationProps`

- `page: number` — The current page, 1-based.
- `total: number` — Rows across all pages.
- `pageSizeOptions?: TablePageSize[]` — Choices in the page-size picker. Defaults to 10, 25, 50, 100, 200 and All.
- `onPageSizeChange?: (pageSize: TablePageSize) => void` — Omit to hide the page-size picker.
- `locale?: string` — The labels' language and numerals. Defaults to LocaleProvider's, else the page's `<html lang>`.
- `disabled?: boolean` — Disables every control, e.g. while the next page is loading.

## Parts

- `type TableProps`
- `TableHeader` — The `<thead>`.
- `TableBody` — The `<tbody>`.
- `TableFooter` — The `<tfoot>`, e.g. for totals.
- `TableRow` — A `<tr>`; in a `striped` Table body rows alternate between `--table-row-odd` and `--table-row-even`. Headers and footers keep their own background. Highlights on hover and when `data-state="selected"`.
- `TableHead` — A header cell (`<th>`).
- `TableCell` — A body cell (`<td>`). Does not wrap by default (`whitespace-nowrap`).
- `TableCaption` — The `<caption>`, rendered below the table.
- `type TableExportFormat` — What a table export writes.
- `type TableExportColumn` — One exported column: its heading, how to read a row's value, and optionally its width in px.
- `type TableExportOptions`
- `exportTable` — Downloads rows as a CSV or Excel file. Data-agnostic: pass the columns and rows to write, in order — DataTable's `getExportData` hands over exactly that. Values keep their type: numbers, dates and booleans are real Excel numbers, dates and booleans in .xlsx. The .xlsx writer (`write-excel-file`) is imported on first use: pages that never export to Excel never download it.

  ```tsx
  await exportTable({
    format: 'xlsx',
    fileName: 'employees',
    columns: [
      { label: 'Name', value: (e) => e.name },
      { label: 'Start date', value: (e) => e.startDate },
    ],
    rows: employees,
  })
  ```

- `toXlsxBlob` — The .xlsx workbook for `exportTable`, as a Blob — to upload or attach instead of downloading. A bold, frozen header row; numbers, dates and booleans as real Excel values; dates in the locale's short format. Loads the writer on first use.
- `toCsv` — The CSV text for `exportTable`: a UTF-8 BOM so Excel reads Turkish letters, and `;` between fields where the locale writes decimals with a comma (Turkish Excel expects that), `,` elsewhere.
- `downloadFile` — Saves a blob as a file through a temporary link.
- `type TableCheckboxProps`
- `TableCheckbox` — The selection checkbox of a table row or header. A header box shows the mixed state with `indeterminate`, and "this page only" with `scope="visible"`. Give every box an `aria-label`.

  ```tsx
  <TableRow data-state={selected ? 'selected' : undefined} className="group/row">
    <TableCell>
      <TableCheckbox appearance="hover" checked={selected} onCheckedChange={setSelected} aria-label="Select row" />
    </TableCell>
  </TableRow>
  ```

- `type TableColumnFilterLabels` — Every word the column filters render, in the locale's language (see LocaleProvider).
- `tableColumnFilterLabelsForLocale` — The labels in `locale`'s language.
- `defaultTableColumnFilterLabels` — The English labels.
- `columnFilterTriggerClass` — The funnel: hidden until its header (`group/header`) is hovered or focused, and visible, filled, in the brand colour, while a filter is applied.
- `ColumnFilterPopover` — The funnel and its panel, shared by every column filter. The panel is as wide as its content needs (translated buttons, a calendar) and never narrower than 16rem, so nothing in it runs past its edge. `children` renders only while the panel is open, so each opening starts from the applied value.
- `TextFilterPanel` — The "contains" panel. Applies the trimmed text, `''` to clear.
- `type TableColumnFilterOption` — One choice of an options filter: the value matched, its label, and how many rows hold it.
- `OptionsFilterPanel` — The checklist panel: tick the values to show. Nothing ticked is no filter, so there is no "Select all" to keep in step. From six options a search field above narrows the list; ArrowDown moves from it into the list.
- `type TableColumnNumberRange` — A number filter's value: the inclusive bounds, either of which may be missing.
- `NumberFilterPanel` — Min and Max side by side. Either may stay empty; reversed bounds are swapped.
- `type TableColumnDateRange` — A date filter's value: whole days, both ends included; either may be missing.
- `DateFilterPanel` — A calendar to pick one day (click it once) or a range (click both ends). Month and year are drop-downs, to reach years back quickly. Month and day names follow `locale`.
- `type TableColumnFilterProps`
- `TableColumnFilter` — A column header's "contains" filter: a funnel that opens a small panel with a text field and Apply / Clear / Cancel. Enter applies, Escape cancels. The funnel stays hidden until its header (`group/header`) is hovered or focused, and stays visible — filled — while a filter is applied. Controlled: the caller owns the applied value and does the filtering.

  ```tsx
  <TableHead className="group/header">
    Name
    <TableColumnFilter column="Name" value={nameFilter} onApply={setNameFilter} />
  </TableHead>
  ```

- `type TableColumnOptionsFilterProps`
- `TableColumnOptionsFilter` — A column header's filter for a column of known values (a status, a type, a department): the same funnel as TableColumnFilter, opening a checklist with each option's count beside it, and Apply / Clear / Cancel. Tick the values to show; with none ticked nothing is filtered. From six options a search field above the list narrows it. Controlled: the caller owns the applied values and does the filtering.

  ```tsx
  <TableColumnOptionsFilter
    column="Status"
    options={[{ value: 'active', label: 'Active', count: 12 }, { value: 'passive', label: 'Passive', count: 3 }]}
    value={statuses}
    onApply={setStatuses}
  />
  ```

- `type TableColumnNumberFilterProps`
- `TableColumnNumberFilter` — A column header's filter for numbers: Min and Max, both inclusive, either optional. Same funnel and actions as TableColumnFilter. Controlled.

  ```tsx
  <TableColumnNumberFilter column="Salary" value={salary} onApply={setSalary} />
  ```

- `type TableColumnDateFilterProps`
- `TableColumnDateFilter` — A column header's filter for dates: a calendar picking one day or a range, both ends included. Same funnel and actions as TableColumnFilter. Controlled.

  ```tsx
  <TableColumnDateFilter column="Start date" value={started} onApply={setStarted} locale="tr-TR" />
  ```

- `type TablePageSize` — A page size, or every row on one page.
- `type TablePaginationLabels` — Every word TablePagination renders, in the locale's language (see LocaleProvider).
- `tablePaginationLabelsForLocale` — The labels in `locale`'s language, with its numerals.
- `defaultTablePaginationLabels` — The English labels.
- `type TablePaginationProps`
- `TablePagination` — The bar under a table: rows per page, the visible range, and first/previous/next/last buttons. Controlled and data-agnostic, so it pages a server-driven list as well as DataTable's client rows (which renders it for you).

  ```tsx
  <TablePagination
    page={page}
    pageSize={pageSize}
    total={1374}
    onPageChange={setPage}
    onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
  />
  ```
