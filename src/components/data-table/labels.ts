import { DEFAULT_LOCALE, inLanguage } from '../../lib/i18n'
import { tablePaginationLabelsForLocale, type TablePaginationLabels } from '../table/table-pagination'
import type { DataTableExportScope } from './state'

/**
 * Every word DataTable renders itself, in the language of its `locale` (else
 * LocaleProvider's, else `<html lang>`). Override single words through the
 * `labels` prop. The pagination words are TablePagination's, which DataTable
 * renders.
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
  /** Toolbar button that clears every column filter, shown while one is set. */
  clearFilters: string
  cancel: string
  /** An options filter's search field, from six options. */
  filterSearchOptions: string
  /** An options filter when its search matches none. */
  filterNoOptions: string
  /** A number filter's lower bound. */
  filterMin: string
  /** A number filter's upper bound. */
  filterMax: string
  /** A date filter before a day is picked. */
  filterPickDates: string
  /** A boolean column's checklist options, without `exportValue` to name them. */
  filterTrue: string
  filterFalse: string
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
  /** Server mode: selected rows not in the loaded page, shown beside the count. */
  rowsOffPage: (count: number) => string
  columnsSelected: (count: number) => string
  /** Label of the button clearing selected rows and columns. */
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
  /**
   * Heading of the export menu: what will be written. `scope` says which rows:
   * `selected`, `page` (on screen), `filtered` (every row passing the
   * filters) or `loaded`.
   */
  exportScope: (columns: number, rows: number, scope: DataTableExportScope) => string
  /** Export menu heading when the rows live on the server but no server export is set up: only the loaded ones are written. */
  exportLoadedOnly: (columns: number, rows: number, scope: DataTableExportScope) => string
}

/** English: the counts written by `n`, nouns in the singular for one. */
function englishLabels(n: (value: number) => string): Omit<DataTableLabels, keyof TablePaginationLabels> {
  const rows = (count: number) => `${n(count)} ${count === 1 ? 'row' : 'rows'}`
  const columns = (count: number) => `${n(count)} ${count === 1 ? 'column' : 'columns'}`
  const scoped = (count: number, scope: DataTableExportScope) => {
    if (scope === 'selected') return `${n(count)} selected ${count === 1 ? 'row' : 'rows'}`
    if (scope === 'page') return `${rows(count)} on this page`
    if (scope === 'loaded') return `${n(count)} loaded ${count === 1 ? 'row' : 'rows'}`
    return rows(count)
  }
  return {
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
    clearFilters: 'Clear filters',
    filterSearchOptions: 'Search',
    filterNoOptions: 'No matches',
    filterMin: 'Min',
    filterMax: 'Max',
    filterPickDates: 'Pick a day or a range',
    filterTrue: 'Yes',
    filterFalse: 'No',
    cancel: 'Cancel',
    selectAll: 'Select all rows',
    selectAllRows: (count) => `Select all ${rows(count)}`,
    selectColumn: (column) => `Select column ${column}`,
    columnScopePage: (count) => `this page (${rows(count)})`,
    columnScopeAll: (count) => `all ${rows(count)}`,
    selectRow: 'Select row',
    rowsSelected: (count) => `${rows(count)} selected`,
    rowsHiddenByFilter: (count) => `${n(count)} hidden by filters`,
    rowsOffPage: (count) => `${n(count)} not on this page`,
    columnsSelected: (count) => `${columns(count)} selected`,
    clearSelection: 'Clear selection',
    exportError: 'Export failed. Please try again.',
    loading: 'Loading…',
    empty: 'No results.',
    sortDescription: (direction, priority) => `Sorted ${direction === 'asc' ? 'ascending' : 'descending'}, priority ${priority}`,
    export: 'Export',
    exportCsv: 'CSV (.csv)',
    exportExcel: 'Excel (.xlsx)',
    exportScope: (columnCount, rowCount, scope) => `${columns(columnCount)} · ${scoped(rowCount, scope)}`,
    exportLoadedOnly: (columnCount, rowCount) =>
      `${columns(columnCount)} · ${n(rowCount)} loaded ${rowCount === 1 ? 'row' : 'rows'} only`,
  }
}

/** Turkish: a noun after a number stays singular ("3 satır"). */
function turkishLabels(n: (value: number) => string): Omit<DataTableLabels, keyof TablePaginationLabels> {
  const scoped = (count: number, scope: DataTableExportScope) => {
    if (scope === 'selected') return `Seçili ${n(count)} satır`
    if (scope === 'page') return `Bu sayfadaki ${n(count)} satır`
    if (scope === 'loaded') return `Yüklü ${n(count)} satır`
    return `${n(count)} satır`
  }
  return {
    columns: 'Sütunlar',
    resetLayout: 'Düzeni sıfırla',
    sortAscending: 'Artan sırala',
    sortDescending: 'Azalan sırala',
    clearSort: 'Sıralamayı kaldır',
    autofit: 'İçeriğe sığdır',
    moveLeft: 'Sola taşı',
    moveRight: 'Sağa taşı',
    hideColumn: 'Sütunu gizle',
    columnMenu: (column) => `${column} sütunu seçenekleri`,
    resizeColumn: (column) => `${column} sütununu yeniden boyutlandır`,
    filter: (column) => `${column} filtrele`,
    filterContains: 'İçerir',
    apply: 'Uygula',
    clearFilter: 'Filtreyi kaldır',
    clearFilters: 'Filtreleri temizle',
    filterSearchOptions: 'Ara',
    filterNoOptions: 'Eşleşen yok',
    filterMin: 'En az',
    filterMax: 'En çok',
    filterPickDates: 'Bir gün ya da aralık seçin',
    filterTrue: 'Evet',
    filterFalse: 'Hayır',
    cancel: 'Vazgeç',
    selectAll: 'Tüm satırları seç',
    selectAllRows: (count) => `${n(count)} satırın tümünü seç`,
    selectColumn: (column) => `${column} sütununu seç`,
    columnScopePage: (count) => `bu sayfa (${n(count)} satır)`,
    columnScopeAll: (count) => `tüm ${n(count)} satır`,
    selectRow: 'Satırı seç',
    rowsSelected: (count) => `${n(count)} satır seçildi`,
    rowsHiddenByFilter: (count) => `${n(count)} tanesi filtre dışında`,
    rowsOffPage: (count) => `${n(count)} tanesi bu sayfada değil`,
    columnsSelected: (count) => `${n(count)} sütun seçildi`,
    clearSelection: 'Seçimi temizle',
    exportError: 'Dışa aktarılamadı. Lütfen tekrar deneyin.',
    loading: 'Yükleniyor…',
    empty: 'Sonuç yok.',
    sortDescription: (direction, priority) => `${direction === 'asc' ? 'Artan' : 'Azalan'} sıralı, öncelik ${priority}`,
    export: 'Dışa aktar',
    exportCsv: 'CSV (.csv)',
    exportExcel: 'Excel (.xlsx)',
    exportScope: (columns, rows, scope) => `${scoped(rows, scope)} · ${n(columns)} sütun`,
    exportLoadedOnly: (columns, rows) => `Yalnızca yüklü ${n(rows)} satır · ${n(columns)} sütun`,
  }
}

/**
 * Every DataTable word in `locale`'s language, numbers in its numerals: the
 * same locale as the grid's sorting, filtering and exports. English and
 * Turkish ship complete; other languages get English.
 */
export function dataTableLabelsForLocale(locale: string): DataTableLabels {
  const n = (value: number) => value.toLocaleString(locale)
  return {
    ...tablePaginationLabelsForLocale(locale),
    ...inLanguage({ en: englishLabels, tr: turkishLabels }, locale)(n),
  }
}

/** The English labels. */
export const defaultDataTableLabels: DataTableLabels = dataTableLabelsForLocale(DEFAULT_LOCALE)
