import { Fragment, type ReactNode } from 'react'
import type { ColumnWindow } from './grid'

/**
 * The column indexes a row renders under column virtualization — the window,
 * plus the retained columns (the active cell's, the dragged one) wherever they
 * are — and the gaps between them as `[from, to)` index ranges, in order.
 */
export function windowSlots(count: number, window: ColumnWindow): { indices: number[]; gaps: Array<[number, number]> } {
  const wanted = new Set<number>()
  for (let index = window.start; index <= window.end; index++) wanted.add(index)
  for (const index of window.retained ?? []) wanted.add(index)
  const indices = [...wanted].filter((index) => index >= 0 && index < count).sort((a, b) => a - b)
  const gaps: Array<[number, number]> = []
  let next = 0
  for (const index of indices) {
    if (index > next) gaps.push([next, index])
    next = index + 1
  }
  if (next < count) gaps.push([next, count])
  return { indices, gaps }
}

/**
 * Renders a row's cells under column virtualization: the slots of
 * `windowSlots`, with a spacer of the window's px width for each gap — a plain
 * length, not a sum of the columns it stands in for, and nothing set on the
 * grid root (an inherited variable there would restyle every cell).
 */
export function columnSlots<T>(
  items: readonly T[],
  window: ColumnWindow | null,
  id: (item: T) => string,
  render: (item: T, index: number) => ReactNode,
): ReactNode {
  if (!window) return items.map(render)
  const { indices, gaps } = windowSlots(items.length, window)
  const spacer = (k: number) => (
    <div key={`gap-${k}`} aria-hidden="true" style={{ flex: `0 0 ${window.gaps?.[k] ?? 0}px` }} />
  )
  const result: ReactNode[] = []
  let gap = 0
  for (const index of indices) {
    if (gaps[gap] && gaps[gap]![1] === index) result.push(spacer(gap++))
    result.push(<Fragment key={id(items[index]!)}>{render(items[index]!, index)}</Fragment>)
  }
  if (gaps[gap]) result.push(spacer(gap))
  return result
}
