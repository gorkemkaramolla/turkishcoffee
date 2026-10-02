'use client'

import type * as React from 'react'
import { Accordion as AccordionPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'
import { ChevronDownIcon } from '../../lib/icons'

/**
 * Vertically stacked sections that expand one (`type="single"`) or several
 * (`type="multiple"`) at a time. For a single show/hide region use Collapsible.
 *
 * @example
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="shipping">
 *     <AccordionTrigger>Shipping</AccordionTrigger>
 *     <AccordionContent>Ships in 2–3 days.</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */
export const Accordion = AccordionPrimitive.Root

/** One section of an Accordion. `value` must be unique within the Accordion. */
export function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b border-border last:border-b-0', className)}
      {...props}
    />
  )
}

/** The clickable heading of an AccordionItem; renders its own chevron. */
export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'flex flex-1 items-start justify-between gap-4 py-4 text-left text-sm font-medium outline-none transition-all',
          'hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'disabled:pointer-events-none disabled:opacity-50',
          '[&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

/**
 * The collapsible body of an AccordionItem. `className` lands on an inner
 * padding wrapper, not on the animated element, so the height animation stays intact.
 */
export function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(
        'overflow-hidden text-sm',
        'data-[state=open]:animate-ui-accordion-down data-[state=closed]:animate-ui-accordion-up',
      )}
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}
