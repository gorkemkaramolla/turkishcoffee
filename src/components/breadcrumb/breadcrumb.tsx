'use client'

import { Children, useEffect, useState } from 'react'
import type * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { cn } from '../../lib/cn'
import { ChevronRightIcon, EllipsisIcon } from '../../lib/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip/tooltip'

/**
 * Trail of links to the current page. The last item is a BreadcrumbPage,
 * not a link. A step's text truncates at about 30 characters and shows in full
 * in a tooltip; change the limit with `className="[--breadcrumb-text-max:50ch]"`.
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
        'flex flex-wrap items-center gap-1 text-sm break-words text-muted-foreground',
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
      className={cn('inline-flex items-center', className)}
      {...props}
    />
  )
}

// Each step is a padded segment, so the hover background has room around the
// text and an icon. Shared by links, buttons and the current page so they line up.
const step = 'inline-flex h-control-sm items-center gap-1.5 rounded-md px-2 [&>svg]:size-4 [&>svg]:shrink-0'

// Hover, or a menu held open: the neutral selection fill, full-strength text and a primary icon.
const interactiveStep = cn(
  step,
  'outline-none transition-colors hover:bg-selection hover:text-foreground hover:[&>svg]:text-primary-text',
  'data-popup-open:bg-selection data-popup-open:text-foreground data-popup-open:[&>svg]:text-primary-text',
  'focus-visible:ring-2 focus-visible:ring-ring',
)

/**
 * Wraps a step's text in a span that can truncate (bare text in a flex row
 * can't), and reports whether it is cut off so the full text can go in a
 * tooltip. Icons and other elements pass through.
 */
function useStepText(children: React.ReactNode) {
  const [span, setSpan] = useState<HTMLSpanElement | null>(null)
  const [truncated, setTruncated] = useState(false)
  const text = Children.toArray(children)
    .filter((c) => typeof c === 'string' || typeof c === 'number')
    .join('')

  useEffect(() => {
    if (!span || typeof ResizeObserver === 'undefined') return
    const check = () => setTruncated(span.scrollWidth > span.clientWidth)
    const observer = new ResizeObserver(check)
    observer.observe(span)
    return () => observer.disconnect()
  }, [span, text])

  // Consecutive text children ("Mona", " ", "Kane") share one span.
  const content: React.ReactNode[] = []
  let run: Array<string | number> = []
  const flush = () => {
    if (!run.length) return
    content.push(
      <span
        key={`text-${content.length}`}
        ref={setSpan}
        data-slot="breadcrumb-text"
        className="max-w-[var(--breadcrumb-text-max,30ch)] min-w-0 truncate"
      >
        {run.join('')}
      </span>,
    )
    run = []
  }
  for (const child of Children.toArray(children)) {
    if (typeof child === 'string' || typeof child === 'number') run.push(child)
    else {
      flush()
      content.push(child)
    }
  }
  flush()

  return { text, content, truncated }
}

/** Shows a step's full text in a tooltip, only while it is truncated. */
function StepTooltip({
  text,
  truncated,
  children,
}: {
  text: string
  truncated: boolean
  children: React.ReactElement
}) {
  // Disabled rather than left out, so the step doesn't remount when it starts
  // or stops being truncated.
  return (
    <Tooltip disabled={!truncated}>
      <TooltipTrigger render={children} />
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  )
}

export type BreadcrumbLinkProps = useRender.ComponentProps<'a'>

/**
 * A link to an ancestor page. Pass `render` to use your router's `<Link>`.
 * Put an icon before the text as a child; it turns primary on hover.
 */
export function BreadcrumbLink({ className, render, ref, children, ...props }: BreadcrumbLinkProps) {
  const { text, content, truncated } = useStepText(children)
  const link = useRender({
    defaultTagName: 'a',
    render,
    ref,
    props: {
      'data-slot': 'breadcrumb-link',
      'data-truncated': truncated ? '' : undefined,
      className: cn(interactiveStep, className),
      children: content,
      ...props,
    },
  })
  return (
    <StepTooltip text={text} truncated={truncated}>
      {link}
    </StepTooltip>
  )
}

/**
 * The current page. Not a link: it carries aria-current and is removed from
 * the tab order, which is what screen readers expect at the end of a trail.
 */
export function BreadcrumbPage({ className, children, ...props }: React.ComponentProps<'span'>) {
  const { text, content, truncated } = useStepText(children)
  return (
    <StepTooltip text={text} truncated={truncated}>
      <span
        data-slot="breadcrumb-page"
        data-truncated={truncated ? '' : undefined}
        role="link"
        aria-disabled="true"
        aria-current="page"
        className={cn(step, 'font-semibold text-foreground', className)}
        {...props}
      >
        {content}
      </span>
    </StepTooltip>
  )
}

/**
 * A step that acts instead of navigating, styled like BreadcrumbLink. Use it as
 * the trigger for a menu of collapsed steps:
 * `<DropdownMenuTrigger render={<BreadcrumbButton aria-label="Show 3 more" />}><BreadcrumbEllipsis /></DropdownMenuTrigger>`.
 */
export function BreadcrumbButton({ className, type = 'button', ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      data-slot="breadcrumb-button"
      type={type}
      // The button supplies the box, so an ellipsis inside drops its own.
      className={cn(interactiveStep, '[&>[data-slot=breadcrumb-ellipsis]]:size-auto', className)}
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

/**
 * Stands in for collapsed middle steps of a long trail. Decorative: to let
 * people reach those steps, put it inside a BreadcrumbButton that opens a menu.
 */
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
