import type { ReactTable, Row, RowData } from '@tanstack/react-table'
import type { TableExportColumn } from '../../table/export'
import type { DataTableFeatures } from '../features'
import type {
  DataTableColumnSelection,
  DataTableExportColumns,
  DataTableExportData,
  DataTableExportRows,
  DataTableExportRequest,
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

/**
 * Export columns: label, how to read a row, width. Reads `meta.exportValue`
 * first. A row the grid does not hold, such as one fetched for a server
 * export, is read through the column's accessor; it has no index in `data`.
 */
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
      value: (row: TData) => {
        if (exportValue) return exportValue(row)
        const model = models.get(row)
        return model ? model.getValue(column.id) : column.accessorFn?.(row, -1)
      },
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
  /** The selection's `scopeKey`, carried to a request for every matching row. */
  scopeKey: string | undefined
  /** Server mode: `server.rowCount`, of which the loaded rows are one page. Null on the client. */
  serverRowCount: number | null
  /** Server mode: selected rows' data kept from when they were loaded (`useHeldRows`). */
  heldRows?: ReadonlyMap<string, TData>
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
 * describes it for the app's backend; `rows` still holds the loaded part. A
 * page that holds all `rowCount` rows reaches nothing past it.
 */
export function getExportData<TData extends RowData>(
  context: ExportContext<TData>,
  options: { rows?: DataTableExportRows; columns?: DataTableExportColumns } = {},
): DataTableExportData<TData> {
  const { table, pageRows, selection, columnSelection, scopeKey, serverRowCount, heldRows } = context

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
  const partial = serverRowCount !== null && filtered.length < serverRowCount
  const selectedRows = selectedLoadedRows(table, selection)
  const hasSelection = selection.type === 'allMatching' || selection.ids.length > 0
  let mode = options.rows ?? 'auto'
  if (mode === 'auto') {
    mode = hasSelection ? 'selected' : columnSelection.ids.length && columnSelection.scope === 'page' ? 'page' : 'filtered'
  }

  let rows: Array<GridRow<TData>>
  // Selected rows from other pages or searches, kept from when they were loaded.
  let held: TData[] = []
  let reachesServer = false
  switch (mode) {
    case 'selected': {
      rows = selectedRows
      const loaded = table.getCoreRowModel().rowsById
      const offPage = selection.type === 'ids' ? selection.ids.filter((id) => !loaded[id]) : []
      held = offPage.flatMap((id) => (heldRows?.has(id) ? [heldRows.get(id)!] : []))
      // The page and the held rows don't cover it: an allMatching selection, or ids never loaded here.
      reachesServer = (selection.type === 'allMatching' && partial) || held.length < offPage.length
      break
    }
    case 'page':
      rows = pageRows
      break
    case 'loaded':
      rows = table.getCoreRowModel().rows
      break
    case 'filtered':
    case 'allMatching':
      rows = filtered
      reachesServer = partial
      break
  }

  const columns = toExportColumns(chosenColumns, table.getCoreRowModel().rows)
  // Rows picked one by one are asked for by id: the current filters may hide
  // some of them, and the export must not lose them.
  const request: DataTableExportRequest | null =
    serverRowCount !== null && reachesServer
      ? {
          columns: chosenColumns.map((column) => column.id),
          sorting: table.state.sorting,
          rows:
            mode === 'selected' && selection.type === 'ids'
              ? { type: 'ids', ids: selection.ids }
              : {
                  type: 'matching',
                  columnFilters: table.state.columnFilters,
                  ...(scopeKey !== undefined ? { scopeKey } : {}),
                  excludedIds: mode === 'selected' && selection.type === 'allMatching' ? selection.excludedIds : [],
                },
        }
      : null

  return {
    columns,
    rows: [...rows.map((row) => row.original), ...held],
    scope: mode === 'allMatching' ? 'filtered' : mode,
    request,
  }
}
