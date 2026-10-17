import { useCallback, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import type { ReactTable, RowData } from '@tanstack/react-table'
import type { DataTableFeatures } from '../features'
import { windowSlots } from './column-slots'
import type { ColumnWindow } from './grid'
import { inlineScroll } from './scroll'

/** How far beyond the viewport columns keep rendering, each side, in px. */
const OVERSCAN = 400

/**
 * Column virtualization: which visible columns render, from the scroll
 * position against the column offsets. The window changes only when its edges
 * cross a column, so scrolling within it re-renders nothing; `retained`
 * columns (the active cell's, the dragged one) stay mounted wherever they are.
 */
export function useColumnWindow({
  enabled,
  sizes,
  scrollerRef,
  dir,
  retained,
}: {
  enabled: boolean
  /** The visible columns' widths, in display order. */
  sizes: readonly number[]
  scrollerRef: RefObject<HTMLElement | null>
  dir: 'ltr' | 'rtl'
  /** Column indexes kept mounted outside the window. */
  retained: readonly number[]
}) {
  const starts = useMemo(() => {
    let x = 0
    return sizes.map((width) => {
      const start = x
      x += width
      return start
    })
  }, [sizes])

  const [range, setRange] = useState<readonly [number, number]>([0, 0])
  const inputs = useRef({ starts, sizes, enabled })
  const update = useCallback(() => {
    const { starts, sizes, enabled } = inputs.current
    const scroller = scrollerRef.current
    if (!enabled || !scroller || !starts.length) return
    const offset = inlineScroll(scroller, dir)
    const left = offset - OVERSCAN
    const right = offset + scroller.clientWidth + OVERSCAN
    let first = starts.findIndex((start, index) => start + sizes[index]! > left)
    if (first === -1) first = starts.length - 1
    let last = first
    while (last < starts.length - 1 && starts[last + 1]! < right) last++
    setRange((current) => (current[0] === first && current[1] === last ? current : [first, last]))
  }, [scrollerRef, dir])
  // Widths moved the offsets: the window may cover other columns now.
  useLayoutEffect(() => {
    inputs.current = { starts, sizes, enabled }
    update()
  }, [starts, sizes, enabled, update])

  const count = sizes.length
  const start = Math.min(range[0], Math.max(count - 1, 0))
  const end = Math.min(Math.max(range[1], start), Math.max(count - 1, 0))
  const retainedKey = retained.join(',')
  // The spacers' widths, as a key: the window object changes only when they do.
  const gapsKey = enabled && count
    ? windowSlots(count, { start, end, retained }).gaps.map(([from, to]) => starts[to - 1]! + sizes[to - 1]! - starts[from]!).join(',')
    : ''
  // One object per window, so memoized rows see the same window while it holds.
  const window = useMemo<ColumnWindow | null>(
    () =>
      enabled && count
        ? {
            start,
            end,
            retained: retainedKey ? retainedKey.split(',').map(Number) : [],
            gaps: gapsKey ? gapsKey.split(',').map(Number) : [],
          }
        : null,
    [enabled, count, start, end, retainedKey, gapsKey],
  )

  return { window, starts, update }
}

/**
 * The visible leaf columns and their headers, with their ids and widths as
 * values that stay the same while nothing about them changes — TanStack hands
 * out new arrays every render.
 */
export function useVisibleColumns<TData extends RowData>(table: ReactTable<DataTableFeatures, TData>) {
  const visibleColumns = table.getVisibleLeafColumns()
  const headers = table.getHeaderGroups().at(-1)?.headers ?? []
  const columnsKey = visibleColumns.map((column) => column.id).join('\u0000')
  const sizesKey = visibleColumns.map((column) => column.getSize()).join(',')
  const columnIds = useMemo(() => (columnsKey ? columnsKey.split('\u0000') : []), [columnsKey])
  const columnSizes = useMemo(() => (sizesKey ? sizesKey.split(',').map(Number) : []), [sizesKey])
  return { visibleColumns, headers, columnsKey, columnIds, columnSizes }
}
