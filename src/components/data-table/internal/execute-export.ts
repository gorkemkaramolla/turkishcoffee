import { exportTable, type TableExportFormat } from '../../table/export'
import type { DataTableExportData, DataTableExportRequest } from '../state'

export type ExportOptions = {
  fileName?: string
  locale?: string
  onServerExport?: (request: DataTableExportRequest, format: TableExportFormat) => void | Promise<void>
  onExportError?: (error: unknown, format: TableExportFormat) => void
}

/**
 * The one export path, for the toolbar menu and `ref.export`. Rows beyond the
 * loaded data go to `onServerExport`; without it only the menu, which says so,
 * may fall back to writing the loaded rows. Failures reach `onExportError` and
 * reject.
 */
export async function executeExport<T>(
  data: DataTableExportData<T>,
  format: TableExportFormat,
  options: ExportOptions,
  allowLoadedFallback = false,
): Promise<void> {
  try {
    if (data.request && options.onServerExport) {
      await options.onServerExport(data.request, format)
      return
    }
    if (data.request && !allowLoadedFallback) {
      throw new Error(
        'DataTable: server-wide export requires onServerExport. Choose rows: "page" or "loaded" to export local data.',
      )
    }
    await exportTable({ format, columns: data.columns, rows: data.rows, fileName: options.fileName, locale: options.locale })
  } catch (error) {
    options.onExportError?.(error, format)
    throw error
  }
}
