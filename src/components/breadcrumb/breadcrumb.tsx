'use client'

import type * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { cn } from '../../lib/cn'
import { ChevronRightIcon, EllipsisIcon } from '../../lib/icons'

/**
 * Trail of links to the current page. The last item is a BreadcrumbPage,
 * not a link.
 *
 * @example
 * <Breadcrumb>
 *   <BreadcrumbList>
 *     <BreadcrumbItem>
 *       <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
 *     </BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem>
 *       <BreadcrumbPage>Settings</BreadcrumbPage>
 *     </BreadcrumbItem>
 *   </BreadcrumbList>
 * </Breadcrumb>
 */
export function Breadcrumb(props: React.ComponentProps<'nav'>) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

/** The ordered list holding BreadcrumbItems and BreadcrumbSeparators. */
export function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5',
        className,
      )}
      {...props}
    />
  )
}

/** One step of the trail. */
export function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  )
}

export type BreadcrumbLinkProps = useRender.ComponentProps<'a'>

/** A link to an ancestor page. Pass `render` to use your router's `<Link>`. */
export function BreadcrumbLink({ className, render, ref, ...props }: BreadcrumbLinkProps) {
  return useRender({
    defaultTagName: 'a',
    render,
    ref,
    props: {
      'data-slot': 'breadcrumb-link',
      className: cn('transition-colors hover:text-foreground', className),
      ...props,
    },
  })
}

/**
 * The current page. Not a link: it carries aria-current and is removed from
 * the tab order, which is what screen readers expect at the end of a trail.
 */
export function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('font-normal text-foreground', className)}
      {...props}
    />
  )
}

/** Goes between BreadcrumbItems; a chevron unless you pass children. */
export function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  )
}

/** Stands in for collapsed middle steps of a long trail. */
export function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn('flex size-control items-center justify-center', className)}
      {...props}
    >
      <EllipsisIcon className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}
