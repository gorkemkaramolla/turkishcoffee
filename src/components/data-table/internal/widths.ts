import type { ColumnSizingState, ColumnVisibilityState } from '@tanstack/react-table'
import { distributeWidths } from './autofit'
import type { ColumnDefLeaf } from './columns'

/** Width bounds of a column without its own `minSize` / `maxSize`. */
export const MIN_SIZE = 48
export const MAX_SIZE = 1000
/**
 * `defaultColumn.size` for columns that set none, so they can be told apart
 * from explicit sizes (TanStack would otherwise fill in 150). Such columns are
 * fitted to their content; the clamp to `minSize` keeps it harmless.
 */
export const AUTO_SIZE = 0
/** Width of a column without a size when `autoSize` is off. */
export const DEFAULT_SIZE = 150
/** Rows read to estimate column widths (the server render, explicit fitting). */
export const ESTIMATE_SAMPLE = 50

export const NO_SIZING: ColumnSizingState = {}

/** Whether a column's width is fitted to its content rather than set. */
export function isAuto(size: number | undefined): boolean {
  return size === undefined || size === AUTO_SIZE
}

export function clampSize(width: number, min = MIN_SIZE, max = MAX_SIZE): number {
  return Math.min(Math.max(Math.round(width), min), max)
}

/** The text a cell value shows, for the width estimate: the same on the server and the client. */
export function estimateText(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (value instanceof Date) return '00.00.0000'
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}

/**
 * The widths to show: `base` (the user's, else fitted), with the automatic
 * columns stretched in proportion until the row fills `available`. Columns
 * with a set `size` keep it. Rows wider than `available` are left as they are:
 * the table scrolls.
 */
export function fillWidth(
  leaves: readonly ColumnDefLeaf[],
  visibility: ColumnVisibilityState,
  base: ColumnSizingState,
  available: number,
): ColumnSizingState {
  if (!available) return base
  const visible = leaves.filter((leaf) => visibility[leaf.id] !== false)
  const flexible = visible.filter((leaf) => isAuto(leaf.size))
  // Not measured yet: nothing to stretch.
  if (flexible.some((leaf) => base[leaf.id] === undefined)) return base
  const clamp = (leaf: ColumnDefLeaf, width: number) =>
    Math.min(Math.max(width, leaf.minSize ?? MIN_SIZE), leaf.maxSize ?? MAX_SIZE)
  const fixed = visible
    .filter((leaf) => !isAuto(leaf.size))
    .reduce((sum, leaf) => sum + clamp(leaf, base[leaf.id] ?? leaf.size!), 0)
  const maxById = new Map(flexible.map((leaf) => [leaf.id, leaf.maxSize ?? MAX_SIZE]))
  const stretched = distributeWidths(
    Object.fromEntries(flexible.map((leaf) => [leaf.id, clamp(leaf, base[leaf.id]!)])),
    available - fixed,
    (id) => maxById.get(id) ?? MAX_SIZE,
  )
  return { ...base, ...stretched }
}

export function sameWidths(a: ColumnSizingState, b: ColumnSizingState): boolean {
  const keys = Object.keys(a)
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key])
}

export function sameIds(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index])
}
