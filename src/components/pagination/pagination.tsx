import type * as React from 'react'
import { cn } from '../../lib/cn'
import { buttonVariants } from '../button/button'
import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from '../../lib/icons'

/**
 * Page navigation built from plain anchors, so it works with any router:
 * pass `href` to each link. Server-renderable.
 *
 * @example
 * <Pagination>
 *   <PaginationContent>
 *     <PaginationItem><PaginationPrevious href="?page=1" /></PaginationItem>
 *     <PaginationItem><PaginationLink href="?page=1">1</PaginationLink></PaginationItem>
 *     <PaginationItem><PaginationLink href="?page=2" isActive>2</PaginationLink></PaginationItem>
 *     <PaginationItem><PaginationEllipsis /></PaginationItem>
 *     <PaginationItem><PaginationNext href="?page=3" /></PaginationItem>
 *   </PaginationContent>
 * </Pagination>
 */
export function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
}

/** The `<ul>` holding PaginationItems. */
export function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  )
}

/** One `<li>` slot; wraps a link, Previous/Next or an ellipsis. */
export function PaginationItem(props: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />
}

export type PaginationLinkProps = React.ComponentProps<'a'> & {
  /** Marks the current page: outline style and `aria-current="page"`. */
  isActive?: boolean
  /** A Button size; defaults to `icon` (square). */
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

/**
 * A page number link. `isActive` marks the current page (outline style +
 * aria-current). `size` follows Button sizes and defaults to `icon`.
 */
export function PaginationLink({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({ variant: isActive ? 'outline' : 'ghost', size }),
        className,
      )}
      {...props}
    />
  )
}

/** Link to the previous page; the label hides below `sm`. */
export function PaginationPrevious({ className, ...props }: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="md"
      className={cn('gap-1 px-2.5', className)}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  )
}

/** Link to the next page; the label hides below `sm`. */
export function PaginationNext({ className, ...props }: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="md"
      className={cn('gap-1 px-2.5', className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon className="size-4" />
    </PaginationLink>
  )
}

/** Stands in for skipped page numbers. */
export function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <EllipsisIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}
