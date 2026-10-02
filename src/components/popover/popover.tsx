'use client'

import type * as React from 'react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'

/**
 * Floating panel opened by clicking a trigger; for small forms, pickers and
 * extra details. Non-modal. For a hover hint use Tooltip; for a list of actions
 * use DropdownMenu.
 *
 * @example
 * <Popover>
 *   <PopoverTrigger asChild>
 *     <Button variant="outline">Filters</Button>
 *   </PopoverTrigger>
 *   <PopoverContent align="start">…</PopoverContent>
 * </Popover>
 */
export const Popover = PopoverPrimitive.Root
/** Opens the Popover. Use `asChild` to make your own Button the trigger. */
export const PopoverTrigger = PopoverPrimitive.Trigger
/** Positions the Popover against an element other than the trigger. */
export const PopoverAnchor = PopoverPrimitive.Anchor

/** The panel; renders its own portal. `w-72` by default. */
export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none',
          'data-[state=open]:animate-ui-pop-in data-[state=closed]:animate-ui-pop-out',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}
