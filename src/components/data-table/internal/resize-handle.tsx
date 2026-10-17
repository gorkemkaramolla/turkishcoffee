'use client'

import type { Header, RowData } from '@tanstack/react-table'
import { cn } from '../../../lib/cn'
import { columnLabel } from './columns'
import type { DataTableFeatures } from '../features'
import type { GridApi } from './grid'

/**
 * The grab strip on a header's right edge. Drag to resize, double-click to fit
 * the column to its content (as in Excel). It is a focusable `separator`: ←/→
 * resize by 16px (Shift for 64px), Enter fits.
 */
export function ResizeHandle<TData extends RowData>({
  grid,
  header,
  last,
}: {
  grid: GridApi
  header: Header<DataTableFeatures, TData, unknown>
  last: boolean
}) {
  const { column } = header
  const resizing = column.getIsResizing()
  const startResize = header.getResizeHandler()

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={grid.labels.resizeColumn(columnLabel(column))}
      aria-valuenow={Math.round(column.getSize())}
      aria-valuemin={column.columnDef.minSize}
      aria-valuemax={column.columnDef.maxSize}
      // Out of the tab order: the grid is one tab stop. F2 on the header reaches it.
      tabIndex={-1}
      data-grid-control=""
      data-no-drag=""
      data-resizing={resizing ? '' : undefined}
      onMouseDown={startResize}
      onTouchStart={startResize}
      onDoubleClick={() => grid.autofit([column.id])}
      onKeyDown={(event) => {
        const step = (event.shiftKey ? 64 : 16) * (grid.dir === 'rtl' ? -1 : 1)
        if (event.key === 'ArrowLeft') grid.resizeBy(column.id, -step)
        else if (event.key === 'ArrowRight') grid.resizeBy(column.id, step)
        else if (event.key === 'Enter') grid.autofit([column.id])
        else return
        event.preventDefault()
      }}
      className={cn(
        'group/resize absolute top-0 z-10 flex h-full w-2 cursor-col-resize touch-none justify-center outline-none select-none',
        // Straddle the boundary; the last column keeps it inside so it adds no scroll width.
        last ? 'end-0' : '-end-1',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          // Revealed by hovering the header row. A touch screen has no hover, so it stays visible there.
          'h-1/2 w-px self-center rounded-full bg-border opacity-0 transition-[height,background-color,opacity]',
          'group-hover/headers:opacity-100 [@media(hover:none)]:opacity-100',
          'group-hover/resize:h-full group-hover/resize:w-0.5 group-hover/resize:bg-primary group-hover/resize:opacity-100',
          'group-focus-visible/resize:h-full group-focus-visible/resize:w-0.5 group-focus-visible/resize:bg-primary group-focus-visible/resize:opacity-100',
          'group-data-resizing/resize:h-full group-data-resizing/resize:w-0.5 group-data-resizing/resize:bg-primary group-data-resizing/resize:opacity-100',
        )}
      />
    </div>
  )
}
