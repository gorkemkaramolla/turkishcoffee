'use client'

import type * as React from 'react'
import { HoverCard as HoverCardPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'

/**
 * Rich preview shown when a pointer hovers a link (e.g. a user profile).
 * Not reachable on touch devices — never put essential content or actions in it.
 * For a short text hint use Tooltip; for click-to-open content use Popover.
 *
 * @example
 * <HoverCard>
 *   <HoverCardTrigger asChild><a href="/u/ada">@ada</a></HoverCardTrigger>
 *   <HoverCardContent>…</HoverCardContent>
 * </HoverCard>
 */
export const HoverCard = HoverCardPrimitive.Root
/** The element that opens the HoverCard on hover. Use `asChild` with a link. */
export const HoverCardTrigger = HoverCardPrimitive.Trigger

/** The card panel; renders its own portal. */
export function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-64 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none',
          'data-[state=open]:animate-ui-fade-in data-[state=closed]:animate-ui-fade-out',
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}
