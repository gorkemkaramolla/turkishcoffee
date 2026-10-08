'use client'

import { useState } from 'react'
import type { ReactTable, RowData } from '@tanstack/react-table'
import { DownloadIcon, XIcon } from '../../../lib/icons'
import { Button } from '../../button/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../../dropdown-menu/dropdown-menu'
import { type TableExportFormat } from '../../table/export'
import { executeExport } from './execute-export'
import type { DataTableFeatures } from '../features'
import type { DataTableLabels } from '../labels'
import type { DataTableExportData, DataTableExportRequest } from '../state'
import { ColumnsMenu } from './columns-menu'
import type { HeaderSelection } from './row-selection'
import type { ColumnScope } from './use-column-selection'

/** The built-in Export menu's options (`exportable`). */
export type ToolbarExport = {
  onExportError?: (error: unknown, format: TableExportFormat) => void
  fileName?: string
  locale?: string
  /** Server mode: export every covered row through the app's backend. */
  onServerExport?: (request: DataTableExportRequest, format: TableExportFormat) => void | Promise<void>
}

/**
 * The row above the grid. Left: what is selected, each with a ✕ to clear it
 * and, while a selection covers only this page, a shortcut to all rows
 * (Gmail's "Select all 57"). Right: Export and the Columns menu. Fixed
 * height, so selecting the first row does not push the grid down.
 */
export function Toolbar<TData extends RowData>({
  custom,
  table,
  labels,
  selectedRows,
  hiddenSelectedRows,
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
  exportable: ToolbarExport | null
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
      : labels.rowsSelected(selectedRows)

  return (
    <div className="flex min-h-8 flex-wrap items-center gap-2">
      {selectedRows > 0 && (
        <SelectionChip
          label={rowLabel}
          clearLabel={labels.clearSelection}
          onClear={onClearRows}
          action={rowScope === 'page' ? { label: labels.selectAllRows(matchingRows), run: onSelectAllRows } : undefined}
        />
      )}
      {selectedColumns > 0 && (
        <SelectionChip
          label={columnLabel}
          clearLabel={labels.clearSelection}
          onClear={onClearColumns}
          action={
            selectedRows === 0 && columnScope === 'page' && matchingRows > pageRows
              ? { label: labels.selectAllRows(matchingRows), run: onWidenColumns }
              : undefined
          }
        />
      )}
      {custom}
      <div className="ms-auto flex items-center gap-2">
        {exportable && (
          <ExportMenu labels={labels} options={exportable} prepare={prepareExport} matchingRows={matchingRows} />
        )}
        {hideable && <ColumnsMenu table={table} labels={labels} onReset={onResetLayout} />}
      </div>
    </div>
  )
}

function SelectionChip({
  label,
  clearLabel,
  onClear,
  action,
}: {
  label: string
  clearLabel: string
  onClear: () => void
  action?: { label: string; run: () => void }
}) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-md bg-selection pr-1 pl-3 text-xs font-medium text-foreground">
      {label}
      {action && (
        <button
          type="button"
          onClick={action.run}
          className="ml-1 rounded-sm px-1 font-semibold text-primary-text underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {action.label}
        </button>
      )}
      <button
        type="button"
        aria-label={clearLabel}
        onClick={onClear}
        className="flex size-5 items-center justify-center rounded-md outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <XIcon className="size-3" />
      </button>
    </span>
  )
}

/**
 * The built-in Export menu. It asks DataTable what the export covers and hands
 * that to the file writer (`exportTable`) — or, for rows only the server holds,
 * to `onServerExport`. Without `onServerExport` it writes the loaded rows and
 * says so. The scope is read only when the menu opens.
 */
function ExportMenu<TData extends RowData>({
  labels,
  options,
  prepare,
  matchingRows,
}: {
  labels: DataTableLabels
  options: ToolbarExport
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
        if (!data.request) return setHeading(labels.exportScope(columns, data.rows.length))
        if (!options.onServerExport) return setHeading(labels.exportLoadedOnly(columns, data.rows.length))
        // The server writes the file: count what it will cover.
        const selection = data.request.selection
        const rows =
          selection?.type === 'ids'
            ? selection.ids.length
            : Math.max(0, matchingRows - (selection?.type === 'allMatching' ? selection.excludedIds.length : 0))
        setHeading(labels.exportScope(columns, rows))
      }}
    >
      <DropdownMenuTrigger render={<Button variant="secondary" size="sm" disabled={busy} />}>
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
