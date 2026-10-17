import { exportTable, type TableExportFormat } from '../../table/export'
import type { DataTableExportData, DataTableExportOptions } from '../state'

export type ExportOptions<T> = DataTableExportOptions<T> & { locale?: string }

/**
 * The one export path, for the toolbar menu and `ref.export`. Rows the grid
 * holds it writes itself. Rows beyond the loaded data come from `fetchRows`
 * (then written here) or go to `onServerExport` (the backend writes the file);
 * with neither, only the menu, which says so, may fall back to writing the
 * loaded rows. Failures reach `onError` and reject.
 */
export async function executeExport<T>(
  data: DataTableExportData<T>,
  format: TableExportFormat,
  options: ExportOptions<T>,
  allowLoadedFallback = false,
): Promise<void> {
  const write = (rows: T[]) => exportTable({ format, columns: data.columns, rows, fileName: options.fileName, locale: options.locale })
  try {
    if (data.request && options.fetchRows) return await write(await options.fetchRows(data.request))
    if (data.request && options.onServerExport) return await options.onServerExport(data.request, format)
    if (data.request && !allowLoadedFallback) {
      throw new Error(
        'DataTable: a server-wide export needs exportable.fetchRows or onServerExport. Choose rows: "page" or "loaded" to export local data.',
      )
    }
    await write(data.rows)
  } catch (error) {
    options.onError?.(error, format)
    throw error
  }
}
