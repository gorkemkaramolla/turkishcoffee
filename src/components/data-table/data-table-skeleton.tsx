import { cn } from '../../lib/cn'
import { Skeleton } from '../skeleton/skeleton'
import { tableCellPaddingClass, tableHeadTextClass } from '../table/internal/styles'
import { ROW_HEIGHT } from './internal/grid'
import { SkeletonRows, type SkeletonColumn } from './internal/skeleton-rows'
import { LocaleText } from '../locale-provider/locale-provider'

const LOADING = { en: 'Loading…', tr: 'Yükleniyor…' }

export type DataTableSkeletonProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The headers to show, as the real table will (`['Name', 'Email']`), or how many columns to sketch. Default 5. */
  columns?: number | readonly string[]
  /** Placeholder rows. Default 8. */
  rows?: number
  /** Row height, as DataTable's `size`: `sm` 32px or `md` 44px (default). */
  size?: 'sm' | 'md'
  /** A checkbox column first, as DataTable's `selectable`. */
  selectable?: boolean
  /** Announced to screen readers. Defaults to "Loading…" in the page's language (see LocaleProvider). */
  label?: string
}

/**
 * A DataTable on its way: the bordered frame, the header, and rows of
 * Skeleton bars at DataTable's own row height, so nothing jumps when the
 * real table arrives. Use it where the table can't render yet, such as a
 * Suspense fallback around a server fetch. DataTable draws the same rows
 * itself while it loads with no rows. The bars share Skeleton's glint, so
 * the table loads as one surface.
 *
 * @example
 * <Suspense fallback={<DataTableSkeleton columns={['Name', 'Email', 'Status']} selectable />}>
 *   <Employees />
 * </Suspense>
 */
export function DataTableSkeleton({
  columns = 5,
  rows = 8,
  size = 'md',
  selectable = false,
  label,
  className,
  ...props
}: DataTableSkeletonProps) {
  const headers = typeof columns === 'number' ? Array.from({ length: columns }, () => null) : [...columns]
  const cells: SkeletonColumn[] = [
    ...(selectable ? [{ checkbox: true, className: 'w-11 shrink-0' }] : []),
    ...headers.map(() => ({ className: 'flex-1' })),
  ]
  const rowHeight = ROW_HEIGHT[size]

  return (
    <div
      data-slot="data-table-skeleton"
      className={cn('overflow-clip rounded-md border border-border bg-background', className)}
      {...props}
    >
      <span role="status" className="sr-only">
        {label ?? <LocaleText message={LOADING} />}
      </span>
      <div aria-hidden="true">
        <div className="flex border-b border-border bg-[var(--table-header)]" style={{ height: rowHeight }}>
          {selectable && (
            <div className="flex w-11 shrink-0 items-center justify-center">
              <Skeleton className="size-4 rounded-sm" />
            </div>
          )}
          {headers.map((header, index) => (
            <div key={index} className={cn('flex min-w-0 flex-1 items-center', tableCellPaddingClass, tableHeadTextClass)}>
              {header === null ? <Skeleton className="h-2.5 w-2/5 rounded-sm" /> : <span className="truncate">{header}</span>}
            </div>
          ))}
        </div>
        <SkeletonRows columns={cells} rows={rows} rowHeight={rowHeight} />
      </div>
    </div>
  )
}
