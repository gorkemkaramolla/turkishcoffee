import { pageLocale } from '../../lib/locale'
/** What a table export writes. */
export type TableExportFormat = 'csv' | 'xlsx'

/** One exported column: its heading, how to read a row's value, and optionally its width in px. */
export type TableExportColumn<TRow> = {
  label: string
  value: (row: TRow) => unknown
  /** On-screen width in px; becomes the .xlsx column width. */
  width?: number
}

export type TableExportOptions<TRow> = {
  format: TableExportFormat
  columns: Array<TableExportColumn<TRow>>
  rows: TRow[]
  /** Without extension. Defaults to "export". */
  fileName?: string
  /** Formats dates and numbers in CSV and picks its delimiter. Defaults to `<html lang>`. */
  locale?: string
}

/**
 * Downloads rows as a CSV or Excel file. Data-agnostic: pass the columns and
 * rows to write, in order — DataTable's `getExportData` hands over exactly
 * that. Values keep their type: numbers, dates and booleans are real Excel
 * numbers, dates and booleans in .xlsx. The .xlsx writer (`write-excel-file`)
 * is imported on first use: pages that never export to Excel never download it.
 *
 * @example
 * await exportTable({
 *   format: 'xlsx',
 *   fileName: 'employees',
 *   columns: [
 *     { label: 'Name', value: (e) => e.name },
 *     { label: 'Start date', value: (e) => e.startDate },
 *   ],
 *   rows: employees,
 * })
 */
export async function exportTable<TRow>({ format, columns, rows, fileName = 'export', locale }: TableExportOptions<TRow>) {
  const resolvedLocale = locale ?? pageLocale()
  if (format === 'csv') {
    downloadFile(new Blob([toCsv(columns, rows, resolvedLocale)], { type: 'text/csv;charset=utf-8' }), `${fileName}.csv`)
    return
  }
  downloadFile(await toXlsxBlob(columns, rows, resolvedLocale), `${fileName}.xlsx`)
}

/**
 * The .xlsx workbook for `exportTable`, as a Blob — to upload or attach
 * instead of downloading. A bold, frozen header row; numbers, dates and
 * booleans as real Excel values; dates in the locale's short format. Loads
 * the writer on first use.
 */
export async function toXlsxBlob<TRow>(
  columns: Array<TableExportColumn<TRow>>,
  rows: TRow[],
  locale?: string,
): Promise<Blob> {
  const { toXlsx } = await import('./internal/xlsx')
  return toXlsx(columns, rows, locale ?? pageLocale())
}

/**
 * The CSV text for `exportTable`: a UTF-8 BOM so Excel reads Turkish letters,
 * and `;` between fields where the locale writes decimals with a comma (Turkish
 * Excel expects that), `,` elsewhere.
 */
export function toCsv<TRow>(columns: Array<TableExportColumn<TRow>>, rows: TRow[], locale?: string): string {
  const delimiter = decimalSeparator(locale) === ',' ? ';' : ','
  const numbers = new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: 20 })
  const dates = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
  const dateTimes = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const field = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'number') return Number.isFinite(value) ? quote(numbers.format(value), delimiter) : ''
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return ''
      const midnight = value.getHours() === 0 && value.getMinutes() === 0
      return quote((midnight ? dates : dateTimes).format(value), delimiter)
    }
    const text = String(value)
    // A leading = + - @ makes Excel run the cell as a formula (CSV injection).
    return quote(/^[=+\-@\t\r]/.test(text) ? `'${text}` : text, delimiter)
  }

  const lines = [
    columns.map((column) => field(column.label)).join(delimiter),
    ...rows.map((row) => columns.map((column) => field(column.value(row))).join(delimiter)),
  ]
  return `﻿${lines.join('\r\n')}`
}

function quote(text: string, delimiter: string): string {
  return /["\r\n]/.test(text) || text.includes(delimiter) ? `"${text.replace(/"/g, '""')}"` : text
}

/** The locale's decimal mark: "," picks `;` as the CSV delimiter. */
function decimalSeparator(locale: string | undefined): string {
  return new Intl.NumberFormat(locale).formatToParts(1.5).find((part) => part.type === 'decimal')?.value ?? '.'
}

/** Saves a blob as a file through a temporary link. */
export function downloadFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
