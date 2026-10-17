'use client'

import { useState } from 'react'
import type { ReactTable, RowData } from '@tanstack/react-table'
import { cn } from '../../../lib/cn'
import { DownloadIcon, FilterOffIcon, XIcon } from '../../../lib/icons'
import { Button } from '../../button/button'
import { CommandButton } from '../../command-button/command-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../../dropdown-menu/dropdown-menu'
import { type TableExportFormat } from '../../table/export'
import { executeExport, type ExportOptions } from './execute-export'
import type { DataTableFeatures } from '../features'
import type { DataTableLabels } from '../labels'
import type { DataTableExportData } from '../state'
import type { TableRowAppearance } from '../../table/internal/styles'
import { ColumnsMenu } from './columns-menu'
import type { HeaderSelection } from './row-selection'
import type { ColumnScope } from './use-column-selection'


/**
 * One row: the app's own controls on the left, then the selection's count,
 * Export and Columns on the right. A selection adds its count beside Export
 * instead of a row of its own, so nothing on the page moves when a checkbox
 * is ticked: Export stays where it was, and Export is what a selection is for.
 * Column filters add Clear filters the same way, so one click undoes every
 * funnel instead of a trip through each header.
 */
export function Toolbar<TData extends RowData>({
  custom,
  table,
  labels,
  selectedRows,
  hiddenSelectedRows,
  offPageSelectedRows,
  selectionColor,
  rowScope,
  matchingRows,
  pageRows,
  onSelectAllRows,
  onClearRows,
  selectedColumns,
  columnScope,
  onClearColumns,
  onWidenColumns,
  exportable,
  prepareExport,
  hideable,
  onResetLayout,
}: {
  custom?: React.ReactNode
  table: ReactTable<DataTableFeatures, TData>
  labels: DataTableLabels
  selectedRows: number
  /** Selected rows the current filters hide (`ids` selections only). */
  hiddenSelectedRows: number
  /** Server mode: selected rows not in the loaded page (another page, or filtered out). */
  offPageSelectedRows: number
  /** Tints the count like the selected rows. */
  selectionColor: TableRowAppearance['selectionColor']
  /** The header checkbox's state; `page` offers the step to every row. */
  rowScope: HeaderSelection
  matchingRows: number
  pageRows: number
  onSelectAllRows: () => void
  onClearRows: () => void
  selectedColumns: number
  columnScope: ColumnScope
  onClearColumns: () => void
  /** Widens the column selection from this page to every row. */
  onWidenColumns: () => void
  exportable: ExportOptions<TData> | null
  prepareExport: () => DataTableExportData<TData>
  hideable: boolean
  onResetLayout: () => void
}) {
  // Selected rows decide an export; a column selection's own scope only matters without them.
  const columnLabel =
    selectedRows > 0
      ? labels.columnsSelected(selectedColumns)
      : `${labels.columnsSelected(selectedColumns)} · ${
          columnScope === 'all' ? labels.columnScopeAll(matchingRows) : labels.columnScopePage(pageRows)
        }`
  const rowLabel =
    hiddenSelectedRows > 0
      ? `${labels.rowsSelected(selectedRows)} · ${labels.rowsHiddenByFilter(hiddenSelectedRows)}`
      : offPageSelectedRows > 0
        ? `${labels.rowsSelected(selectedRows)} · ${labels.rowsOffPage(offPageSelectedRows)}`
        : labels.rowsSelected(selectedRows)
  const hasSelection = selectedRows > 0 || selectedColumns > 0
  const hasFilters = table.state.columnFilters.length > 0
  const exportMenu = exportable && (
    <ExportMenu labels={labels} options={exportable} prepare={prepareExport} matchingRows={matchingRows} />
  )

  if (!custom && !hideable && !exportable && !hasSelection && !hasFilters) return null
  return (
    <div data-slot="data-table-controls" className="flex min-h-control min-w-0 flex-wrap items-center gap-2">
      {custom}
      <div className="ms-auto flex min-w-0 flex-wrap items-center justify-end gap-1">
        {hasSelection && (
          <div
            data-slot="data-table-selection"
            className={cn(
              'me-1 flex min-h-control-sm min-w-0 flex-wrap items-center gap-x-3 rounded-md py-0.5 ps-2.5 pe-0.5 text-sm text-foreground',
              selectionColor === 'primary' ? 'bg-primary-soft' : 'bg-selection',
            )}
          >
            <span role="status" className="flex flex-wrap items-center gap-x-3 font-medium">
              {selectedRows > 0 && <span>{rowLabel}</span>}
              {selectedColumns > 0 && <span>{columnLabel}</span>}
            </span>
            {selectedRows > 0 && rowScope === 'page' && matchingRows > pageRows && (
              <Button variant="link" className="h-auto p-0" onClick={onSelectAllRows}>
                {labels.selectAllRows(matchingRows)}
              </Button>
            )}
            {selectedRows === 0 && selectedColumns > 0 && columnScope === 'page' && matchingRows > pageRows && (
              <Button variant="link" className="h-auto p-0" onClick={onWidenColumns}>
                {labels.selectAllRows(matchingRows)}
              </Button>
            )}
            <button
              type="button"
              aria-label={labels.clearSelection}
              title={labels.clearSelection}
              className="grid size-6 shrink-0 place-items-center rounded-sm text-muted-foreground outline-none transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5"
              onClick={() => {
                if (selectedRows > 0) onClearRows()
                if (selectedColumns > 0) onClearColumns()
              }}
            >
              <XIcon />
            </button>
          </div>
        )}
        {hasFilters && (
          // Through the table, so the grid goes back to the first page as for any filter change.
          <CommandButton onClick={() => table.resetColumnFilters(true)}>
            <FilterOffIcon />
            {labels.clearFilters}
          </CommandButton>
        )}
        {exportMenu}
        {hideable && <ColumnsMenu table={table} labels={labels} onReset={onResetLayout} />}
      </div>
    </div>
  )
}

/**
 * The built-in Export menu. It asks DataTable what the export covers and hands
 * that to the file writer (`exportTable`) — for rows only the server holds,
 * after `fetchRows`, or to `onServerExport`. With neither it writes the loaded
 * rows and says so. The scope is read only when the menu opens.
 */
function ExportMenu<TData extends RowData>({
  labels,
  options,
  prepare,
  matchingRows,
}: {
  labels: DataTableLabels
  options: ExportOptions<TData>
  prepare: () => DataTableExportData<TData>
  matchingRows: number
}) {
  const [heading, setHeading] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const run = async (format: TableExportFormat) => {
    setBusy(true)
    try {
      setFailed(false)
      await executeExport(prepare(), format, options, true)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
    {failed && <span role="alert" className="text-sm text-danger-text">{labels.exportError}</span>}
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) return
        const data = prepare()
        const columns = data.columns.length
        if (!data.request) return setHeading(labels.exportScope(columns, data.rows.length, data.scope))
        if (!options.fetchRows && !options.onServerExport) {
          return setHeading(labels.exportLoadedOnly(columns, data.rows.length, data.scope))
        }
        // The server holds some of the rows: count what the request covers.
        const covered = data.request.rows
        const rows = covered.type === 'ids' ? covered.ids.length : Math.max(0, matchingRows - covered.excludedIds.length)
        setHeading(labels.exportScope(columns, rows, data.scope))
      }}
    >
      <DropdownMenuTrigger render={<CommandButton disabled={busy} />}>
        <DownloadIcon />
        {labels.export}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          {heading && <DropdownMenuLabel>{heading}</DropdownMenuLabel>}
          <DropdownMenuItem onClick={() => void run('csv')}>{labels.exportCsv}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => void run('xlsx')}>{labels.exportExcel}</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  )
}
