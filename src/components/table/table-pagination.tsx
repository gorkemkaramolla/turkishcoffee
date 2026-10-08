'use client'

import { useId } from 'react'
import { validatePageSize, validateNonnegativeInteger } from './internal/pagination'
import { cn } from '../../lib/cn'
import { ChevronLeftIcon, ChevronLeftPipeIcon, ChevronRightIcon, ChevronRightPipeIcon } from '../../lib/icons'
import { Button } from '../button/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select/select'

/** A page size, or every row on one page. */
export type TablePageSize = number | 'all'

/** Every word TablePagination renders. English by default. */
export type TablePaginationLabels = {
  rowsPerPage: string
  all: string
  /** "1–10 of 1374". `from` is 0 when there are no rows. */
  range: (from: number, to: number, total: number) => string
  firstPage: string
  previousPage: string
  nextPage: string
  lastPage: string
}

export const defaultTablePaginationLabels: TablePaginationLabels = {
  rowsPerPage: 'Rows per page:',
  all: 'All',
  range: (from, to, total) => `${from}–${to} of ${total}`,
  firstPage: 'First page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',
}

export type TablePaginationProps = {
  /** The current page, 1-based. */
  page: number
  pageSize: TablePageSize
  /** Rows across all pages. */
  total: number
  /** Choices in the page-size picker. Defaults to 10, 25, 50, 100, 200 and All. */
  pageSizeOptions?: TablePageSize[]
  onPageChange: (page: number) => void
  /** Omit to hide the page-size picker. */
  onPageSizeChange?: (pageSize: TablePageSize) => void
  labels?: Partial<TablePaginationLabels>
  /** Disables every control, e.g. while the next page is loading. */
  disabled?: boolean
  className?: string
}

const DEFAULT_OPTIONS: TablePageSize[] = [10, 25, 50, 100, 200, 'all']

/**
 * The bar under a table: rows per page, the visible range, and
 * first/previous/next/last buttons. Controlled and data-agnostic, so it pages a
 * server-driven list as well as DataTable's client rows (which renders it for
 * you).
 *
 * @example
 * <TablePagination
 *   page={page}
 *   pageSize={pageSize}
 *   total={1374}
 *   onPageChange={setPage}
 *   onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
 * />
 */
export function TablePagination({
  page,
  pageSize,
  total,
  pageSizeOptions = DEFAULT_OPTIONS,
  onPageChange,
  onPageSizeChange,
  labels: labelOverrides,
  disabled = false,
  className,
}: TablePaginationProps) {
  validatePageSize(pageSize)
  validateNonnegativeInteger(total, 'total')
  validateNonnegativeInteger(page - 1, 'page - 1')
  pageSizeOptions.forEach(validatePageSize)
  const labelId = useId()
  const labels = { ...defaultTablePaginationLabels, ...labelOverrides }
  const size = pageSize === 'all' ? Math.max(total, 1) : pageSize
  const pageCount = Math.max(1, Math.ceil(total / size))
  const current = Math.min(Math.max(page, 1), pageCount)
  const from = total === 0 ? 0 : (current - 1) * size + 1
  const to = Math.min(current * size, total)

  const optionLabel = (option: TablePageSize) => (option === 'all' ? labels.all : String(option))
  const items = pageSizeOptions.map((option) => ({ value: String(option), label: optionLabel(option) }))

  const step = (target: number, label: string, icon: React.ReactNode, blocked: boolean) => (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 rounded-md"
      aria-label={label}
      disabled={disabled || blocked}
      onClick={() => onPageChange(target)}
    >
      {icon}
    </Button>
  )

  return (
    <div
      data-slot="table-pagination"
      className={cn('flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm text-foreground', className)}
    >
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span id={labelId} className="text-muted-foreground">{labels.rowsPerPage}</span>
          <Select
            items={items}
            value={String(pageSize)}
            disabled={disabled}
            onValueChange={(value) => onPageSizeChange(value === 'all' ? 'all' : Number(value))}
          >
            <SelectTrigger aria-labelledby={labelId} size="sm" className="min-w-16 border-transparent bg-transparent hover:bg-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <span className="tabular-nums" aria-live="polite">
        {labels.range(from, to, total)}
      </span>

      <div className="flex items-center gap-0.5">
        {step(1, labels.firstPage, <ChevronLeftPipeIcon />, current <= 1)}
        {step(current - 1, labels.previousPage, <ChevronLeftIcon />, current <= 1)}
        {step(current + 1, labels.nextPage, <ChevronRightIcon />, current >= pageCount)}
        {step(pageCount, labels.lastPage, <ChevronRightPipeIcon />, current >= pageCount)}
      </div>
    </div>
  )
}
