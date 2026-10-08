import type { FilterFn, RowData } from '@tanstack/react-table'
import type { DataTableFeatures } from '../features'

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

/**
 * DataTable's default `filterFn`: the cell's displayed text contains the
 * filter text, case-insensitively, in `locale` (default `en-US`). An empty
 * filter removes itself.
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

  // The filter text is the same for every row of a pass: fold it once.
  let lastFilter: unknown
  let needle = ''

  const filterFn: FilterFn<DataTableFeatures, TData> = (row, columnId, filterValue) => {
    const resolved = locale
    if (filterValue !== lastFilter) {
      lastFilter = filterValue
      needle = foldCase(String(filterValue ?? ''), resolved)
    }
    if (!needle) return true
    return fold(row.getValue(columnId), resolved).includes(needle)
  }
  filterFn.autoRemove = (value) => value === undefined || value === null || String(value).trim() === ''
  return filterFn
}
