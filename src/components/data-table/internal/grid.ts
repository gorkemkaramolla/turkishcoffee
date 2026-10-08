import type { DataTableLabels } from '../labels'

/**
 * What the header needs from DataTable, passed down as one object. Stable
 * across renders (memoized, actions behind a ref) so memoized header cells
 * only re-render for their own state.
 */
export type GridApi = {
  sortable: boolean
  resizable: boolean
  reorderable: boolean
  hideable: boolean
  filterable: boolean
  dir: 'ltr' | 'rtl'
  /** Header clicks select columns (Excel) instead of sorting. */
  columnSelection: boolean
  labels: DataTableLabels
  /** Fits the given columns to their content. */
  autofit: (columnIds: string[]) => void
  /** Grows or shrinks a column by `delta` px (keyboard resizing). */
  resizeBy: (columnId: string, delta: number) => void
  /** Moves a column one visible slot left (-1) or right (1). */
  move: (columnId: string, direction: -1 | 1) => void
  startDrag: (event: React.PointerEvent<HTMLElement>, columnId: string) => void
  /** Opens the shared options menu for a column, anchored to its chevron. */
  openMenu: (columnId: string, anchor: HTMLElement) => void
  /** Selects a column: plain click, Ctrl/⌘ to toggle, Shift for a range. */
  selectColumn: (columnId: string, modifiers: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => void
}

/**
 * The slice of the visible columns that renders under column virtualization:
 * indexes `start`..`end`, plus `retained` ones kept mounted outside it (the
 * active cell's column, the dragged column). The columns left out become
 * spacers, `gaps` px wide in order (see `windowSlots`). The object changes only
 * when one of these does, so a scroll within the window, or resizing a
 * rendered column, re-renders no row. `null`: every column renders.
 */
export type ColumnWindow = { start: number; end: number; retained?: readonly number[]; gaps?: readonly number[] }

/** Body row height per `size`: compact and comfortable. */
export const ROW_HEIGHT = { sm: 32, md: 44 } as const
