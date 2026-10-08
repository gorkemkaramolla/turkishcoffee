import { defaultTablePaginationLabels, type TablePaginationLabels } from '../table/table-pagination'

/**
 * Every word DataTable renders itself. English by default; pass the ones you
 * need to translate through the `labels` prop. The pagination words are
 * TablePagination's, which DataTable renders.
 */
export type DataTableLabels = TablePaginationLabels & {
  /** The column chooser button and its menu heading. */
  columns: string
  /** Column chooser item that undoes resizing, reordering and hiding. */
  resetLayout: string
  sortAscending: string
  sortDescending: string
  clearSort: string
  /** Header menu item that fits the column to its content. */
  autofit: string
  moveLeft: string
  moveRight: string
  hideColumn: string
  /** Accessible name of a header's menu button. */
  columnMenu: (column: string) => string
  /** Accessible name of a column's resize handle. */
  resizeColumn: (column: string) => string
  /** Column filter title and trigger name: "Filter Name". */
  filter: (column: string) => string
  /** Caption above the filter input. */
  filterContains: string
  apply: string
  clearFilter: string
  cancel: string
  /** Accessible name of the header checkbox. */
  selectAll: string
  /**
   * The step from "this page" to "everything": the header box's name once the
   * page is selected, and the toolbar's shortcut.
   */
  selectAllRows: (count: number) => string
  /** Accessible name of a column's selection strip. */
  selectColumn: (column: string) => string
  /** A column selection that covers the rows on this page. */
  columnScopePage: (rows: number) => string
  /** A column selection that covers every row. */
  columnScopeAll: (rows: number) => string
  /** Accessible name of a row checkbox. */
  selectRow: string
  rowsSelected: (count: number) => string
  /** Selected rows the current filters hide, shown beside the count. */
  rowsHiddenByFilter: (count: number) => string
  columnsSelected: (count: number) => string
  /** Accessible name of the ✕ on a selection chip. */
  clearSelection: string
  /** Export failure, displayed as an inline alert. */
  exportError: string
  /** Initial loading status. */
  loading: string
  /** Empty grid status. */
  empty: string
  /** Accessible description of secondary sorting. */
  sortDescription: (direction: 'asc' | 'desc', priority: number) => string
  export: string
  exportCsv: string
  exportExcel: string
  /** Heading of the export menu: what will be written. */
  exportScope: (columns: number, rows: number) => string
  /** Export menu heading when the rows live on the server but no server export is set up: only the loaded ones are written. */
  exportLoadedOnly: (columns: number, rows: number) => string
}

export const defaultDataTableLabels: DataTableLabels = {
  ...defaultTablePaginationLabels,
  columns: 'Columns',
  resetLayout: 'Reset layout',
  sortAscending: 'Sort ascending',
  sortDescending: 'Sort descending',
  clearSort: 'Clear sort',
  autofit: 'Fit to content',
  moveLeft: 'Move left',
  moveRight: 'Move right',
  hideColumn: 'Hide column',
  columnMenu: (column) => `${column} column options`,
  resizeColumn: (column) => `Resize ${column}`,
  filter: (column) => `Filter ${column}`,
  filterContains: 'Contains',
  apply: 'Apply',
  clearFilter: 'Clear filter',
  cancel: 'Cancel',
  selectAll: 'Select all rows',
  selectAllRows: (count) => `Select all ${count.toLocaleString()} rows`,
  selectColumn: (column) => `Select column ${column}`,
  columnScopePage: (rows) => `this page (${rows.toLocaleString()} rows)`,
  columnScopeAll: (rows) => `all ${rows.toLocaleString()} rows`,
  selectRow: 'Select row',
  rowsSelected: (count) => `${count.toLocaleString()} ${count === 1 ? 'row' : 'rows'} selected`,
  rowsHiddenByFilter: (count) => `${count.toLocaleString()} hidden by filters`,
  columnsSelected: (count) => `${count} ${count === 1 ? 'column' : 'columns'} selected`,
  clearSelection: 'Clear selection',
  exportError: 'Export failed. Please try again.',
  loading: 'Loading…',
  empty: 'No results.',
  sortDescription: (direction, priority) => `Sorted ${direction === 'asc' ? 'ascending' : 'descending'}, priority ${priority}`,
  export: 'Export',
  exportCsv: 'CSV (.csv)',
  exportExcel: 'Excel (.xlsx)',
  exportScope: (columns, rows) => `${columns} ${columns === 1 ? 'column' : 'columns'} · ${rows.toLocaleString()} rows`,
  exportLoadedOnly: (columns, rows) =>
    `${columns} ${columns === 1 ? 'column' : 'columns'} · ${rows.toLocaleString()} loaded rows only`,
}

/** Numeric labels use the same locale as the grid's sorting, filtering and exports. */
export function dataTableLabelsForLocale(locale: string): DataTableLabels {
  const n = (value: number) => value.toLocaleString(locale)
  return {
    ...defaultDataTableLabels,
    range: (from, to, total) => `${n(from)}–${n(to)} of ${n(total)}`,
    selectAllRows: (count) => `Select all ${n(count)} rows`,
    columnScopePage: (rows) => `this page (${n(rows)} rows)`,
    columnScopeAll: (rows) => `all ${n(rows)} rows`,
    rowsSelected: (count) => `${n(count)} ${count === 1 ? 'row' : 'rows'} selected`,
    rowsHiddenByFilter: (count) => `${n(count)} hidden by filters`,
    columnsSelected: (count) => `${n(count)} ${count === 1 ? 'column' : 'columns'} selected`,
    exportScope: (columns, rows) => `${n(columns)} ${columns === 1 ? 'column' : 'columns'} · ${n(rows)} rows`,
    exportLoadedOnly: (columns, rows) => `${n(columns)} ${columns === 1 ? 'column' : 'columns'} · ${n(rows)} loaded rows only`,
  }
}
