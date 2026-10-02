'use client'

import type * as React from 'react'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'

/** The element the Tooltip describes. Use `asChild` with a Button. */
export const TooltipTrigger = TooltipPrimitive.Trigger

/**
 * Short text hint shown on hover and keyboard focus. Self-providing: no need
 * to wrap your app in a TooltipProvider (there is none to import). Not shown on
 * touch devices — never put essential information in it.
 *
 * @example
 * <Tooltip>
 *   <TooltipTrigger asChild>
 *     <Button size="icon" variant="ghost" aria-label="Copy"><CopyIcon /></Button>
 *   </TooltipTrigger>
 *   <TooltipContent>Copy to clipboard</TooltipContent>
 * </Tooltip>
 */
export function Tooltip({
  delayDuration = 200,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipPrimitive.Provider>
  )
}

/** The hint bubble; renders its own portal and arrow. */
export function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md bg-foreground px-3 py-1.5 text-xs text-background',
          'data-[state=delayed-open]:animate-ui-pop-in data-[state=closed]:animate-ui-pop-out',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}
