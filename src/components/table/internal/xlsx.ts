import writeXlsxFile from 'write-excel-file/browser'
import type { TableExportColumn } from '../export'

/**
 * An .xlsx workbook of the given columns and rows: a bold, frozen header row;
 * numbers, dates and booleans as real Excel values; dates in the locale's
 * short format; column widths from the on-screen widths. The only module that
 * imports `write-excel-file` — `exportTable` loads it on first use.
 */
export async function toXlsx<TRow>(
  columns: Array<TableExportColumn<TRow>>,
  rows: TRow[],
  locale?: string,
): Promise<Blob> {
  const header = columns.map((column) => ({ value: column.label, fontWeight: 'bold' as const }))
  const body = rows.map((row) => columns.map((column) => xlsxCell(column.value(row))))
  return writeXlsxFile([header, ...body], {
    columns: columns.map((column) => ({ width: column.width ? Math.max(8, Math.round(column.width / 7)) : 16 })),
    dateFormat: excelDateFormat(locale),
    stickyRowsCount: 1,
  }).toBlob()
}

function xlsxCell(value: unknown) {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isFinite(value) ? { value, type: Number } : null
  if (typeof value === 'boolean') return { value, type: Boolean }
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : { value: wallClock(value), type: Date }
  return { value: String(value), type: String }
}

/**
 * Excel dates have no time zone: they are the wall-clock time. The writer
 * reads a Date in UTC, so a local 5 Jan 00:00 in Istanbul (UTC+3) would land
 * as 4 Jan 21:00. Hand it the same wall-clock time, in UTC.
 */
function wallClock(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    ),
  )
}

/** The locale's short date as an Excel number format: "dd.mm.yyyy" for Turkish. */
function excelDateFormat(locale: string | undefined): string {
  const parts = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(
    new Date(2000, 0, 2),
  )
  return parts
    .map((part) =>
      part.type === 'day' ? 'dd' : part.type === 'month' ? 'mm' : part.type === 'year' ? 'yyyy' : part.value,
    )
    .join('')
}
