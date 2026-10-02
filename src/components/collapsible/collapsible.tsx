'use client'

import type * as React from 'react'
import { Collapsible as CollapsiblePrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'

/**
 * A single region the user can show and hide. For several related sections
 * use Accordion.
 *
 * @example
 * <Collapsible>
 *   <CollapsibleTrigger asChild>
 *     <Button variant="ghost" size="sm">Show details</Button>
 *   </CollapsibleTrigger>
 *   <CollapsibleContent>…</CollapsibleContent>
 * </Collapsible>
 */
export const Collapsible = CollapsiblePrimitive.Root
/** Toggles the Collapsible. Unstyled — use `asChild` with a Button. */
export const CollapsibleTrigger = CollapsiblePrimitive.Trigger

/** The region that shows and hides, with a height animation. */
export function CollapsibleContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      className={cn(
        'overflow-hidden',
        'data-[state=open]:animate-ui-collapsible-down data-[state=closed]:animate-ui-collapsible-up',
        className,
      )}
      {...props}
    />
  )
}
