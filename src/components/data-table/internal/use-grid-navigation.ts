import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react'

/** A cell by its ARIA position: `row` 1 is the header row; `col` counts visible columns from 1. */
export type CellPosition = { row: number; col: number }

/** Elements a keyboard user could tab to. Inside the grid they are taken out of the tab order. */
export const FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'

const originalTabIndex = new WeakMap<HTMLElement, number>()

/** Remember consumer tab stops, including roving widgets, before removing them from the page tab order. */
export function suspendTabStops(root: HTMLElement | null): void {
  for (const control of root?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []) {
    if (control.closest('[data-interacting]')) continue
    if (!originalTabIndex.has(control) || control.tabIndex >= 0) originalTabIndex.set(control, control.tabIndex)
    control.tabIndex = -1
  }
}

/** The id `aria-activedescendant` points at for a cell. */
export function cellId(prefix: string, position: CellPosition): string {
  return `${prefix}-${position.row}-${position.col}`
}

/**
 * Keyboard navigation for the grid, on the `aria-activedescendant` model (ARIA
 * APG "Grid"): the grid itself is the one tab stop and keeps focus; arrow keys
 * move the active cell, which renders highlighted and is announced through
 * `aria-activedescendant`. Rows and columns that scroll out of the DOM
 * (virtualization) can't strand focus, since focus never sits on them.
 *
 * - Arrows, Home/End (row), Ctrl+Home/End (grid), PageUp/PageDown.
 * - F2, or Enter on a cell without its own Enter action: work with the
 *   cell's controls (they become tabbable); Escape returns to the grid.
 * - Every other key goes to `onCellKey`, which returns true when it acted.
 */
export function useGridNavigation(options: {
  frameRef: RefObject<HTMLElement | null>
  /** aria-rowindex of the last row on screen (the header is 1). */
  lastRow: number
  /** aria-rowindex of the first body row. */
  firstRow: number
  colCount: number
  rowIds: readonly string[]
  columnIds: readonly string[]
  dir: 'ltr' | 'rtl'
  /** Rows a PageUp/PageDown moves. */
  pageStep: number
  /** Scrolls a row / column into view (virtualized rows and columns aren't in the DOM until then). */
  revealRow: (row: number) => void
  revealColumn: (col: number) => void
  onCellKey: (position: CellPosition, event: React.KeyboardEvent) => boolean
}) {
  const { frameRef, lastRow, firstRow, colCount, rowIds, columnIds, dir, pageStep, revealRow, revealColumn, onCellKey } = options
  const [active, setActive] = useState<{ rowId: string | null; columnId: string | null; col: number }>({ rowId: null, columnId: null, col: 1 })
  const rowIndex = active.rowId === null ? -1 : rowIds.indexOf(active.rowId)
  const columnIndex = active.columnId === null ? -1 : columnIds.indexOf(active.columnId)
  const position: CellPosition = {
    row: active.rowId === null || !rowIds.length ? 1 : rowIndex < 0 ? firstRow : firstRow + rowIndex,
    col: columnIndex < 0 ? Math.min(active.col, Math.max(colCount, 1)) : columnIndex + 1,
  }
  // Commit the fallback identity (during render, before anything paints) so a
  // removed record cannot unexpectedly become active again when it returns.
  const committedRowId = position.row === 1 ? null : rowIds[position.row - firstRow] ?? null
  const committedColumnId = columnIds[position.col - 1] ?? null
  if (active.rowId !== committedRowId || active.columnId !== committedColumnId) {
    setActive({ rowId: committedRowId, columnId: committedColumnId, col: position.col })
  }
  const selectPosition = useCallback((next: CellPosition) => {
    setActive({ rowId: next.row === 1 ? null : rowIds[next.row - firstRow] ?? null, columnId: columnIds[next.col - 1] ?? null, col: next.col })
  }, [rowIds, columnIds, firstRow])

  const scrollPending = useRef(false)

  const moveTo = useCallback(
    (next: CellPosition) => {
      selectPosition(next)
      if (next.row >= firstRow) revealRow(next.row)
      revealColumn(next.col)
      scrollPending.current = true
    },
    [firstRow, revealRow, revealColumn, selectPosition],
  )

  // Once the active cell is rendered, bring it fully into view.
  useLayoutEffect(() => {
    if (!scrollPending.current) return
    const reveal = () => {
      const cell = findCell(frameRef.current, position)
      cell?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
    }
    reveal()
    // A newly visible column can be measured in this commit. Correct the scroll
    // after its final width has reached layout, without following manual scrolls.
    if (typeof requestAnimationFrame === 'undefined') { scrollPending.current = false; return }
    const frame = requestAnimationFrame(() => { reveal(); scrollPending.current = false })
    return () => cancelAnimationFrame(frame)
  })

  const enterCell = useCallback(
    (at: CellPosition) => {
      const cell = findCell(frameRef.current, at)
      const controls = cell ? [...cell.querySelectorAll<HTMLElement>(`${FOCUSABLE}, [tabindex="-1"]`)].filter((control) =>
        !control.matches(':disabled, [aria-disabled="true"], [hidden], input[type="hidden"]') &&
        (originalTabIndex.get(control) ?? (control.hasAttribute('data-grid-control') ? 0 : control.tabIndex)) >= 0,
      ) : []
      if (!cell || !controls.length) return false
      cell.setAttribute('data-interacting', '')
      for (const control of controls) control.tabIndex = originalTabIndex.get(control) ?? 0
      controls[0]!.focus()
      // Leaving the cell — by Tab, a click, or Escape — puts its controls back out of the tab order.
      const leave = (event: FocusEvent) => {
        if (cell.contains(event.relatedTarget as Node | null)) return
        cell.removeAttribute('data-interacting')
        for (const control of controls) control.tabIndex = -1
        cell.removeEventListener('focusout', leave)
      }
      cell.addEventListener('focusout', leave)
      return true
    },
    [frameRef],
  )

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const frame = frameRef.current
    // Keys from portals (menus, popovers) bubble here through React too.
    if (!frame || !frame.contains(event.target as Node)) return

    if (event.target !== frame) {
      // Working inside a cell: only Escape (or F2) comes back to the grid.
      if (event.key === 'Escape' || event.key === 'F2') {
        event.preventDefault()
        frame.focus()
      }
      return
    }

    if (!colCount) return
    const { row, col } = position
    const ctrl = event.ctrlKey || event.metaKey
    let next: CellPosition | null = null
    // Alt+arrows are shortcuts (Alt+ArrowDown opens a header's menu), not moves.
    switch (event.altKey ? '' : event.key) {
      case 'ArrowUp':
        next = { row: row === firstRow ? 1 : Math.max(row - 1, 1), col }
        break
      case 'ArrowDown':
        next = { row: row === 1 ? firstRow : Math.min(row + 1, lastRow), col }
        break
      case 'ArrowLeft':
        next = { row, col: dir === 'rtl' ? Math.min(col + 1, colCount) : Math.max(col - 1, 1) }
        break
      case 'ArrowRight':
        next = { row, col: dir === 'rtl' ? Math.max(col - 1, 1) : Math.min(col + 1, colCount) }
        break
      case 'Home':
        next = ctrl ? { row: 1, col: 1 } : { row, col: 1 }
        break
      case 'End':
        next = ctrl ? { row: lastRow, col: colCount } : { row, col: colCount }
        break
      case 'PageUp':
        next = { row: row <= firstRow ? 1 : Math.max(row - pageStep, firstRow), col }
        break
      case 'PageDown':
        next = { row: row === 1 ? firstRow : Math.min(row + pageStep, lastRow), col }
        break
    }
    if (next) {
      event.preventDefault()
      if (lastRow < firstRow && next.row > 1) next = { ...next, row: 1 }
      moveTo(next)
      return
    }

    if (event.key === 'F2') {
      event.preventDefault()
      enterCell(position)
      return
    }
    if (onCellKey(position, event)) {
      event.preventDefault()
      return
    }
    if (event.key === 'Enter' && enterCell(position)) event.preventDefault()
  }

  /** A click on a cell makes it the active one (its own controls still get the click). */
  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    const cell = (event.target as Element).closest<HTMLElement>('[role="gridcell"], [role="columnheader"]')
    if (!cell || !frameRef.current?.contains(cell)) return
    const at = positionOf(cell)
    if (at) selectPosition(at)
  }

  return { active: position, moveTo, onKeyDown, onPointerDown }
}

function findCell(frame: HTMLElement | null, { row, col }: CellPosition): HTMLElement | null {
  if (!frame) return null
  return frame.querySelector<HTMLElement>(
    `[role="row"][aria-rowindex="${row}"] > [aria-colindex="${col}"]`,
  )
}

function positionOf(cell: HTMLElement): CellPosition | null {
  const row = Number(cell.closest('[role="row"]')?.getAttribute('aria-rowindex'))
  const col = Number(cell.getAttribute('aria-colindex'))
  return row && col ? { row, col } : null
}
