import { cn } from '../../../lib/cn'
import { Skeleton } from '../../skeleton/skeleton'
import { tableCellPaddingClass } from '../../table/internal/styles'

/** Bar widths, varied so a column of placeholders reads as text of different lengths. */
const BAR_WIDTHS = ['72%', '56%', '84%', '64%', '48%', '76%', '60%']

export type SkeletonColumn = {
  /** A checkbox column: a square, centred. */
  checkbox?: boolean
  /** Sizes the cell: DataTable's column class, or a flex share on its own. */
  className?: string
}

/**
 * Placeholder rows at DataTable's row height: a Skeleton bar per cell, the
 * same hairline between rows. Inside DataTable the cells take the real
 * columns' widths, so the rows line up under the headers already drawn.
 * Decorative: whoever renders them announces the loading.
 */
export function SkeletonRows({
  columns,
  rows,
  rowHeight,
  rowClassName,
}: {
  columns: SkeletonColumn[]
  rows: number
  rowHeight: number
  rowClassName?: string
}) {
  return Array.from({ length: rows }, (_, row) => (
    <div
      key={row}
      aria-hidden="true"
      data-slot="data-table-skeleton-row"
      className={cn(
        'flex border-b border-[color:var(--table-row-divider)] last:border-b-0',
        rowClassName,
      )}
      style={{ height: rowHeight }}
    >
      {columns.map((column, index) => (
        <div
          key={index}
          className={cn(
            'flex min-w-0 items-center',
            column.checkbox ? 'justify-center' : tableCellPaddingClass,
            column.className,
          )}
        >
          {column.checkbox ? (
            <Skeleton className="size-4 rounded-sm" />
          ) : (
            <Skeleton className="h-2.5 rounded-sm" style={{ width: BAR_WIDTHS[(row * 3 + index) % BAR_WIDTHS.length] }} />
          )}
        </div>
      ))}
    </div>
  ))
}
