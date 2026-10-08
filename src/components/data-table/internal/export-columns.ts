import type { ReactTable, Row, RowData } from '@tanstack/react-table'
import type { TableExportColumn } from '../../table/export'
import type { DataTableFeatures } from '../features'
import type {
  DataTableColumnSelection,
  DataTableExportColumns,
  DataTableExportData,
  DataTableExportRows,
  DataTableExportRequest,
  DataTablePagination,
  DataTableRowSelection,
} from '../state'
import { columnLabel } from './columns'
import { SELECT_COLUMN_ID } from './selection'

type GridTable<TData extends RowData> = ReactTable<DataTableFeatures, TData>
type GridRow<TData extends RowData> = Row<DataTableFeatures, TData>

/**
 * Columns that hold data: an accessor, or `meta.exportValue`. The checkbox
 * column and pure display columns (actions) are not data. `visible`: in
 * display order; otherwise every leaf column, hidden ones included, in the
 * column order.
 */
export function dataColumns<TData extends RowData>(table: GridTable<TData>, which: 'visible' | 'all' = 'visible') {
  const columns = which === 'visible' ? table.getVisibleLeafColumns() : orderedLeafColumns(table)
  return columns.filter(
    (column) => column.id !== SELECT_COLUMN_ID && (column.accessorFn || column.columnDef.meta?.exportValue),
  )
}

function orderedLeafColumns<TData extends RowData>(table: GridTable<TData>) {
  const all = table.getAllLeafColumns()
  const order = table.state.columnOrder
  const ranks = new Map(all.map((column, index) => [column.id, order.length + index]))
  order.forEach((id, index) => ranks.set(id, index))
  return [...all].sort((a, b) => ranks.get(a.id)! - ranks.get(b.id)!)
}

/** Export columns: label, how to read a row, width. Reads `meta.exportValue` first. */
function toExportColumns<TData extends RowData>(
  columns: ReturnType<typeof dataColumns<TData>>,
  coreRows: Array<GridRow<TData>>,
): Array<TableExportColumn<TData>> {
  const models = new Map(coreRows.map((row) => [row.original, row]))
  return columns.map((column) => {
    const exportValue = column.columnDef.meta?.exportValue as ((row: TData) => unknown) | undefined
    return {
      label: columnLabel(column),
      width: column.getSize(),
      value: (row: TData) => exportValue ? exportValue(row) : models.get(row)?.getValue(column.id),
    }
  })
}

/** Explicit IDs survive filtering; allMatching follows the filtered universe. */
export function selectedLoadedRows<TData extends RowData>(table: GridTable<TData>, selection: DataTableRowSelection): Array<GridRow<TData>> {
  const filtered = table.getRowModel().rows
  const visible = filtered.filter((row) => row.getCanSelect() && row.getIsSelected())
  if (selection.type === 'allMatching') return visible
  const seen = new Set(filtered.map((row) => row.id))
  return [...visible, ...table.getCoreRowModel().rows.filter((row) => !seen.has(row.id) && row.getCanSelect() && row.getIsSelected())]
}

/** Everything export scoping needs to know about the grid at the moment of the export. */
export type ExportContext<TData extends RowData> = {
  table: GridTable<TData>
  /** Rows on screen, in display order. */
  pageRows: Array<GridRow<TData>>
  selection: DataTableRowSelection
  columnSelection: DataTableColumnSelection
  pagination: DataTablePagination
  /** Server mode: the loaded rows are one page of `rowCount`. */
  server: boolean
}

/**
 * The columns and rows an export covers. DataTable only decides *what* to
 * export; `exportTable` (or the app) writes the file.
 *
 * Rows — `selected`: the selected loaded rows; `page`: the rows on screen;
 * `filtered`: every row passing the filters, across pages; `loaded`: all of
 * `data`, filters ignored; `allMatching`: `filtered`, or on the server the
 * loaded page plus a `request` for the rest; `auto`: selected, else the column
 * selection's scope, else filtered.
 *
 * Columns — `visible`, `selected` (the column selection), `all` (hidden ones
 * too), `auto`: selected, else visible.
 *
 * In server mode, whenever the scope reaches past the loaded page, `request`
 * describes it for the app's backend; `rows` still holds the loaded part.
 */
export function getExportData<TData extends RowData>(
  context: ExportContext<TData>,
  options: { rows?: DataTableExportRows; columns?: DataTableExportColumns } = {},
): DataTableExportData<TData> {
  const { table, pageRows, selection, columnSelection, pagination, server } = context

  // Columns.
  const visible = dataColumns(table, 'visible')
  const selectedColumns = visible.filter((column) => columnSelection.ids.includes(column.id))
  const columnsMode = options.columns ?? 'auto'
  const chosenColumns =
    columnsMode === 'all'
      ? dataColumns(table, 'all')
      : columnsMode === 'selected' || (columnsMode === 'auto' && selectedColumns.length)
        ? selectedColumns
        : visible

  // Rows.
  const filtered = table.getRowModel().rows // manual pagination: every filtered, sorted row
  const selectedRows = selectedLoadedRows(table, selection)
  const hasSelection = selection.type === 'allMatching' || selection.ids.length > 0
  let mode = options.rows ?? 'auto'
  if (mode === 'auto') {
    mode = hasSelection ? 'selected' : columnSelection.ids.length && columnSelection.scope === 'page' ? 'page' : 'filtered'
  }

  let rows: Array<GridRow<TData>>
  let reachesServer = false
  switch (mode) {
    case 'selected':
      rows = selectedRows
      // Selected rows the page doesn't hold: an allMatching selection, or ids from other pages.
      reachesServer =
        selection.type === 'allMatching' || selection.ids.some((id) => !table.getCoreRowModel().rowsById[id])
      break
    case 'page':
      rows = pageRows
      break
    case 'loaded':
      rows = table.getCoreRowModel().rows
      break
    case 'filtered':
    case 'allMatching':
      rows = filtered
      reachesServer = true
      break
  }

  const columns = toExportColumns(chosenColumns, table.getCoreRowModel().rows)
  const request: DataTableExportRequest | null =
    server && reachesServer
      ? {
          columns: chosenColumns.map((column) => column.id),
          selection: mode === 'selected' ? selection : null,
          sorting: table.state.sorting,
          columnFilters: table.state.columnFilters,
          pagination,
        }
      : null

  return { columns, rows: rows.map((row) => row.original), request }
}
