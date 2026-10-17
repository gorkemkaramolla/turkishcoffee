import type { Column, FilterFn, Row, RowData } from '@tanstack/react-table'
import type {
  TableColumnDateRange,
  TableColumnFilterOption,
  TableColumnNumberRange,
} from '../../table/table-column-filter'
import { isDev } from '../../../lib/dev'
import type { DataTableFeatures, DataTableFilterVariant } from '../features'

const dateFormats = new Map<string, Intl.DateTimeFormat>()

/**
 * The text a filter searches in a value: what the user sees, so typing
 * "12.03" finds a date shown as 12.03.1975 and "42000" finds a number.
 */
function searchableText(value: unknown, locale: string | undefined): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) {
    const key = locale ?? ''
    let format = dateFormats.get(key)
    if (!format) {
      format = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
      dateFormats.set(key, format)
    }
    return Number.isNaN(value.getTime()) ? '' : format.format(value)
  }
  if (typeof value === 'number') return `${value} ${value.toLocaleString(locale)}`
  return String(value)
}

/**
 * Case-folds for matching. Turkish needs its own rules (İ→i, I→ı), and the
 * combining dot some locales leave on a lowered İ is dropped, so "ilker"
 * finds "İlker" whatever the page language.
 */
export function foldCase(text: string, locale: string | undefined): string {
  return text.toLocaleLowerCase(locale).normalize('NFD').replace(/̇/g, '')
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)
}

/** A number filter's value (`{ min, max }`). */
export function isNumberRange(value: unknown): value is TableColumnNumberRange {
  return isPlainObject(value) && ('min' in value || 'max' in value)
}

/** A date filter's value (`{ from, to }`). */
export function isDateRange(value: unknown): value is TableColumnDateRange {
  return isPlainObject(value) && ('from' in value || 'to' in value)
}

/**
 * A cell value as a date: a Date, a timestamp, or a string. A bare
 * `YYYY-MM-DD` is that day in local time, not UTC midnight, which west of
 * Greenwich would fall on the day before.
 */
export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'number') return new Date(value)
  if (typeof value !== 'string' || value === '') return null
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const date = day ? new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3])) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Local midnight starting `date`'s day, plus `days`. */
function dayStart(date: Date, days = 0): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days).getTime()
}

/**
 * DataTable's default `filterFn`, by the filter value's shape:
 * - text: the cell's displayed text contains it, case-insensitively, in
 *   `locale` (default `en-US`);
 * - an array (options): the cell holds one of the values;
 * - `{ min, max }`: the cell is a number within them, both included;
 * - `{ from, to }`: the cell is a date (Date, timestamp or ISO string) on
 *   one of those days, both included.
 * An empty filter removes itself.
 */
export function createContainsFilterFn<TData extends RowData>(locale = 'en-US'): FilterFn<DataTableFeatures, TData> {
  // Folded text per distinct value: a 10,000-row column usually repeats its
  // values, and case-folding in a locale is the expensive part of a pass.
  const folded = new Map<unknown, string>()
  const dates = new Map<number, string>()
  const fold = (value: unknown, resolved: string | undefined) => {
    const cache = value instanceof Date ? dates : folded
    const key = value instanceof Date ? value.getTime() : value
    let text = cache.get(key as number)
    if (text === undefined) {
      if (folded.size + dates.size >= 100_000) { folded.clear(); dates.clear() }
      text = foldCase(searchableText(value, resolved), resolved)
      cache.set(key as number, text)
    }
    return text
  }

  // The filter is the same for every row of a pass: fold the text, or work
  // out a date range's bounds, once.
  let lastFilter: unknown
  let needle = ''
  let lastRange: TableColumnDateRange | undefined
  let bounds: [number, number] = [-Infinity, Infinity]

  const filterFn: FilterFn<DataTableFeatures, TData> = (row, columnId, filterValue) => {
    if (Array.isArray(filterValue)) {
      const value = row.getValue(columnId)
      return filterValue.some((allowed) => Object.is(allowed, value))
    }
    if (isDateRange(filterValue)) {
      if (filterValue !== lastRange) {
        lastRange = filterValue
        bounds = [
          filterValue.from ? dayStart(filterValue.from) : -Infinity,
          filterValue.to ? dayStart(filterValue.to, 1) : Infinity,
        ]
      }
      const time = toDate(row.getValue(columnId))?.getTime()
      return time !== undefined && time >= bounds[0] && time < bounds[1]
    }
    if (isNumberRange(filterValue)) {
      const value = row.getValue(columnId)
      if (value === null || value === undefined || value === '') return false
      const number = Number(value)
      if (Number.isNaN(number)) return false
      return (filterValue.min === undefined || number >= filterValue.min) && (filterValue.max === undefined || number <= filterValue.max)
    }
    const resolved = locale
    if (filterValue !== lastFilter) {
      lastFilter = filterValue
      needle = foldCase(String(filterValue ?? ''), resolved)
    }
    if (!needle) return true
    return fold(row.getValue(columnId), resolved).includes(needle)
  }
  filterFn.autoRemove = (value) => {
    if (value === undefined || value === null) return true
    if (Array.isArray(value)) return value.length === 0
    if (isDateRange(value)) return !value.from && !value.to
    if (isNumberRange(value)) return value.min === undefined && value.max === undefined
    return String(value).trim() === ''
  }
  return filterFn
}

/** What a column's filter panel shows: its kind, and for a checklist the options. */
export type FilterSetup = { variant: DataTableFilterVariant; options?: readonly TableColumnFilterOption[] }

/** The kind a filter value belongs to, when it says. */
function variantOfValue(value: unknown): DataTableFilterVariant | undefined {
  if (Array.isArray(value)) return 'options'
  if (isDateRange(value)) return 'date'
  if (isNumberRange(value)) return 'number'
  return undefined
}

/** The kind a cell value calls for. */
function variantOfCell(value: unknown): DataTableFilterVariant {
  if (value instanceof Date) return 'date'
  if (typeof value === 'number' || typeof value === 'bigint') return 'number'
  if (typeof value === 'boolean') return 'options'
  return 'text'
}

/**
 * Works out a column's filter when its panel opens: `meta.filter.options`,
 * else `meta.filter.variant`, else the applied value's shape, else the first
 * value in the column (Date → date, number → number, boolean → options,
 * anything else → text). A kind seen once is remembered in `seen`, so an empty
 * page, a page of blanks or a server page filtered down to nothing keeps its
 * date or number panel.
 *
 * A checklist lists `meta.filter.options`, or the column's values from the
 * loaded rows. On the client the rows are every row, and each option without
 * a `count` is counted. On the server the page holds only some of the values
 * and its counts would mislead: options are never derived from it (booleans
 * aside, whose values are known) and never counted.
 */
export function resolveFilterSetup<TData extends RowData>({
  column,
  rows,
  value,
  server,
  seen,
  labels,
  locale,
}: {
  column: Column<DataTableFeatures, TData>
  /** Every row before filtering (client), or the loaded page (server). */
  rows: ReadonlyArray<Row<DataTableFeatures, TData>>
  value: unknown
  server: boolean
  seen: Map<string, DataTableFilterVariant>
  labels: { filterTrue: string; filterFalse: string }
  locale: string | undefined
}): FilterSetup {
  const filter = column.columnDef.meta?.filter
  const counts = () => {
    const tally = new Map<unknown, number>()
    for (const row of rows) {
      const cell = row.getValue(column.id)
      if (cell !== null && cell !== undefined && cell !== '') tally.set(cell, (tally.get(cell) ?? 0) + 1)
    }
    return tally
  }
  if (filter?.options) {
    if (server || filter.options.every((option) => option.count !== undefined)) return { variant: 'options', options: filter.options }
    const tally = counts()
    return { variant: 'options', options: filter.options.map((option) => ({ ...option, count: option.count ?? tally.get(option.value) ?? 0 })) }
  }

  let sample: unknown
  for (const row of rows) {
    const cell = row.getValue(column.id)
    if (cell !== null && cell !== undefined && cell !== '') {
      sample = cell
      break
    }
  }
  const variant = filter?.variant ?? variantOfValue(value) ?? seen.get(column.id) ?? (sample !== undefined ? variantOfCell(sample) : 'text')
  if (sample !== undefined && !filter?.variant) seen.set(column.id, variant)
  if (variant !== 'options') return { variant }

  const boolean = typeof sample === 'boolean' || (Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'boolean'))
  if (boolean) {
    const tally = counts()
    return {
      variant: 'options',
      options: [true, false].map((flag) => ({
        value: flag,
        label: flag ? labels.filterTrue : labels.filterFalse,
        count: server ? undefined : (tally.get(flag) ?? 0),
      })),
    }
  }
  if (server) {
    if (isDev) console.warn(`DataTable: column "${column.id}" has an options filter on the server without meta.filter.options; it falls back to text.`)
    return { variant: 'text' }
  }

  const options: TableColumnFilterOption[] = []
  for (const [cell, count] of counts()) {
    if (typeof cell === 'string' || typeof cell === 'number') options.push({ value: cell, label: String(cell), count })
  }
  options.sort((a, b) => a.label.localeCompare(b.label, locale, { numeric: true }))
  return { variant: 'options', options }
}
