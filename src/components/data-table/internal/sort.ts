import { pageLocale } from '../../../lib/locale'
import type { Row, RowData, SortFn } from '@tanstack/react-table'
import type { DataTableFeatures } from '../features'

const collators = new Map<string, Intl.Collator>()

/**
 * One cached collator per locale. `numeric` puts "item 2" before "item 10";
 * `sensitivity: 'base'` ignores case, so "can" and "Can" tie instead of
 * splitting the list.
 */
function collatorFor(locale: string | undefined): Intl.Collator {
  const key = locale ?? ''
  let collator = collators.get(key)
  if (!collator) {
    collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' })
    collators.set(key, collator)
  }
  return collator
}

/** No value to sort by: these go to the bottom in both directions, as in Excel. */
export function isBlank(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true
  if (typeof value === 'number') return Number.isNaN(value)
  if (value instanceof Date) return Number.isNaN(value.getTime())
  return false
}

/**
 * Compares two non-blank values by what they are: numbers and dates by
 * magnitude, booleans with `true` first ("Active" before "Passive"), and
 * everything else as text in the given locale — so Turkish "Çelik" lands after
 * "Can", not after "Zeynep".
 */
export function compareValues(a: unknown, b: unknown, locale?: string): number {
  return compareWith(collatorFor(locale), a, b)
}

function compareWith(collator: Intl.Collator, a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'bigint' && typeof b === 'bigint') return a < b ? -1 : a > b ? 1 : 0
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? -1 : 1
  if (typeof a === 'string' && typeof b === 'string') return collator.compare(a, b)
  return collator.compare(String(a), String(b))
}

/**
 * DataTable's default `sortFn`, so no column needs one. Text compares in
 * `locale` (DataTable passes its own, `en-US` by default), else the page's
 * `<html lang>`. The collator is resolved once, not per comparison: a 10,000-
 * row sort makes ~130,000 of them. TanStack flips the result for descending
 * sorts, so blanks pre-flip themselves to stay last either way.
 */
export function createSmartSortFn<TData extends RowData>(locale?: string): SortFn<DataTableFeatures, TData> {
  let collator: Intl.Collator | undefined
  return (rowA: Row<DataTableFeatures, TData>, rowB: Row<DataTableFeatures, TData>, columnId: string) => {
    const a = rowA.getValue(columnId)
    const b = rowB.getValue(columnId)
    const blankA = isBlank(a)
    const blankB = isBlank(b)
    if (blankA || blankB) {
      if (blankA && blankB) return 0
      const last = blankA ? 1 : -1
      return rowA.table.getColumn(columnId)?.getIsSorted() === 'desc' ? -last : last
    }
    // Resolved on first use: on the server, `<html lang>` isn't readable at creation.
    collator ??= collatorFor(locale ?? pageLocale())
    return compareWith(collator, a, b)
  }
}
