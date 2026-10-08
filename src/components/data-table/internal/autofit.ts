import { cssAttributeValue } from '../../../lib/css'

/**
 * Measures how wide each column needs to be to show its widest cell — header
 * included — without truncating. This is what Excel does on a double-click of
 * a column edge.
 *
 * Every cell of the given columns is switched to `width: max-content` at once,
 * read, and switched back, so the whole measurement costs one layout pass. With
 * virtualization only the rendered rows exist, so only they are measured (AG
 * Grid behaves the same way).
 */
export function measureColumnWidths(root: HTMLElement, columnIds: string[]): Record<string, number> {
  const groups = columnIds.map(
    (id) => [id, Array.from(root.querySelectorAll<HTMLElement>(`[data-col="${cssAttributeValue(id)}"]`))] as const,
  )

  const saved: Array<[HTMLElement, string, string]> = []
  for (const [, cells] of groups) {
    for (const cell of cells) {
      saved.push([cell, cell.style.width, cell.style.flex])
      cell.style.width = 'max-content'
      cell.style.flex = 'none'
    }
  }

  const widths: Record<string, number> = {}
  for (const [id, cells] of groups) {
    let max = 0
    for (const cell of cells) max = Math.max(max, cell.getBoundingClientRect().width)
    if (cells.length) widths[id] = Math.ceil(max)
  }

  for (const [cell, width, flex] of saved) {
    cell.style.width = width
    cell.style.flex = flex
  }
  return widths
}

/**
 * Stretches content-fitted widths to fill `available` pixels, in proportion to
 * each column's natural width, so a table narrower than its container still
 * reaches the right edge. Wider tables keep their natural widths and scroll.
 */
export function distributeWidths(
  natural: Record<string, number>,
  available: number,
  maxSize: (id: string) => number,
): Record<string, number> {
  const ids = Object.keys(natural)
  const total = ids.reduce((sum, id) => sum + natural[id]!, 0)
  if (!ids.length || total <= 0 || available <= total) return { ...natural }

  const result = { ...natural }
  let remaining = available - total
  let eligible = ids.filter((id) => result[id]! < maxSize(id))
  while (remaining > 0.01 && eligible.length) {
    const weight = eligible.reduce((sum, id) => sum + natural[id]!, 0)
    let allocated = 0
    for (const id of eligible) {
      const extra = Math.min(maxSize(id) - result[id]!, remaining * natural[id]! / weight)
      result[id]! += extra
      allocated += extra
    }
    if (allocated <= 0) break
    remaining -= allocated
    eligible = eligible.filter((id) => maxSize(id) - result[id]! > 0.01)
  }
  return result
}

/**
 * A column's content width in px, estimated from text alone — what the server
 * renders with, since it can't measure. Deterministic, so the server and the
 * hydrating client agree. Measuring after hydration only fine-tunes it, instead
 * of every column jumping from an even split to its fitted width.
 *
 * `chrome` is the header's fixed parts (padding, sort arrow, buttons).
 */
export function estimateColumnWidth(label: string, values: readonly string[], chrome: number): number {
  let widest = estimateTextWidth(label) * HEADER_WEIGHT + chrome
  for (const value of values) widest = Math.max(widest, estimateTextWidth(value) + CELL_PADDING)
  return Math.ceil(widest)
}

/** Horizontal padding of a cell (`px-3`). */
export const CELL_PADDING = 24
/** Semibold headers run a little wider than body text. */
const HEADER_WEIGHT = 1.06

/**
 * Text width in px at the grid's 14px, by rough character class. The server
 * can't know the client's font, so the averages sit between the narrower
 * Arial / Segoe UI (Windows, Linux) and the wider San Francisco (Apple):
 * measured in Chromium, Arial-class averages are digits 7.7, narrow 3.6,
 * r/t/f 4.1, capitals 9.5, other lowercase 7.5, wide 12.2.
 */
function estimateTextWidth(text: string): number {
  let width = 0
  for (const char of text) {
    if (/[0-9+]/.test(char)) width += 8.1
    else if (/[mwMW@%]/.test(char)) width += 12.2
    else if (/[ijlI.,:;'|!\s]/.test(char)) width += 3.9
    else if (/[rtf]/.test(char)) width += 4.8
    else if (/[A-Z]/.test(char)) width += 9.6
    else width += 7.8
  }
  return width
}

/** A visible column, in display order, as the resize rules see it. */
export type FitColumn = {
  id: string
  width: number
  min: number
  max: number
  resizable: boolean
  /** How narrow another column's drag may squeeze it: its content width. Defaults to `min`. */
  floor?: number
}

/**
 * Resizes one column the way a splitter between panes moves: while the columns
 * fit in `available` px, the row keeps that width exactly, so the table never
 * runs past its frame and never leaves a gap.
 *
 * - Wider: the columns to its right give way, nearest first, down to their
 *   content width (`floor`) — another column's drag never truncates them;
 *   when none can give more, the column stops growing.
 * - Narrower: the freed space goes to the nearest resizable column on its
 *   right (else on its left); when none can take it, the column stops shrinking.
 * - Columns that already overflow (`available` too small for them) grow
 *   freely and the table scrolls, as before.
 *
 * Returns every column's new width.
 */
export function resizeWithin(
  columns: readonly FitColumn[],
  id: string,
  target: number,
  available: number,
): Record<string, number> {
  const widths: Record<string, number> = Object.fromEntries(columns.map((column) => [column.id, column.width]))
  const index = columns.findIndex((column) => column.id === id)
  const column = columns[index]
  if (!column) return widths
  const total = columns.reduce((sum, each) => sum + each.width, 0)
  const wanted = Math.round(Math.min(Math.max(target, column.min), column.max))
  const delta = wanted - column.width
  const right = columns.slice(index + 1).filter((each) => each.resizable)
  const left = columns.slice(0, index).reverse().filter((each) => each.resizable)

  if (delta > 0) {
    if (total > available + 0.5) {
      widths[id] = wanted
      return widths
    }
    const room = Math.max(0, available - total)
    let taken = 0
    for (const each of right) {
      const give = Math.min(each.width - Math.max(each.min, each.floor ?? each.min), delta - room - taken)
      if (give <= 0) continue
      widths[each.id] = each.width - give
      taken += give
    }
    widths[id] = column.width + Math.min(delta, room + taken)
  } else if (delta < 0) {
    widths[id] = wanted
    let gap = available - (total + delta)
    for (const each of [...right, ...left]) {
      if (gap <= 0) break
      const take = Math.min(each.max - each.width, gap)
      if (take <= 0) continue
      widths[each.id] = each.width + take
      gap -= take
    }
    if (gap > 0) widths[id] = Math.min(column.max, wanted + gap)
  }
  return widths
}

/**
 * The columns whose right edge can't move, in one pass. While the columns fit
 * the frame, dragging an edge works only with a resizable column after it to
 * give or take the room — the last column's edge sits on the frame, and the
 * table may not grow past it. Once they overflow, every edge moves.
 */
export function lockedEdgeIds(columns: readonly FitColumn[], available: number): string[] {
  const total = columns.reduce((sum, each) => sum + each.width, 0)
  if (total > available + 0.5) return []
  const locked: string[] = []
  let resizableAfter = false
  for (let index = columns.length - 1; index >= 0; index--) {
    if (!resizableAfter) locked.push(columns[index]!.id)
    if (columns[index]!.resizable) resizableAfter = true
  }
  return locked.reverse()
}
