'use client'

import type * as React from 'react'
import { Dialog as SheetPrimitive } from '@base-ui/react/dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, cnState } from '../../lib/cn'
import { XIcon } from '../../lib/icons'
import { backdrop, slideFrom, slideMotion } from '../../lib/motion'

/**
 * Modal panel that slides in from an edge — navigation drawers, filters,
 * detail views. For a centered modal use Dialog. SheetTitle is required for
 * accessibility.
 *
 * @example
 * <Sheet>
 *   <SheetTrigger render={<Button variant="outline" />}>Filters</SheetTrigger>
 *   <SheetContent side="left">
 *     <SheetHeader>
 *       <SheetTitle>Filters</SheetTitle>
 *       <SheetDescription>Narrow down the results.</SheetDescription>
 *     </SheetHeader>
 *     …
 *     <SheetFooter>
 *       <SheetClose render={<Button />}>Apply</SheetClose>
 *     </SheetFooter>
 *   </SheetContent>
 * </Sheet>
 */
export const Sheet = SheetPrimitive.Root
/** Opens the Sheet. Pass `render={<Button />}` to make your own Button the trigger. */
export const SheetTrigger = SheetPrimitive.Trigger
/** Closes the Sheet. Pass `render={<Button />}` to make your own Button close it. */
export const SheetClose = SheetPrimitive.Close

const sheetVariants = cva(
  ['fixed z-50 flex flex-col gap-4 bg-background shadow-float outline-none', slideMotion],
  {
    variants: {
      side: {
        top: ['inset-x-0 top-0 h-auto border-b border-border', slideFrom.top],
        bottom: ['inset-x-0 bottom-0 h-auto border-t border-border', slideFrom.bottom],
        left: ['inset-y-0 left-0 h-full w-3/4 border-r border-border sm:max-w-sm', slideFrom.left],
        right: ['inset-y-0 right-0 h-full w-3/4 border-l border-border sm:max-w-sm', slideFrom.right],
      },
    },
    defaultVariants: { side: 'right' },
  },
)

export type SheetContentProps = SheetPrimitive.Popup.Props &
  VariantProps<typeof sheetVariants>

/**
 * The panel. `side`: `top` | `right` (default) | `bottom` | `left`. Renders its
 * own portal, overlay and close (×) button.
 */
export function SheetContent({ className, children, side, ...props }: SheetContentProps) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop
        data-slot="sheet-overlay"
        className={backdrop}
      />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        className={cnState(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  )
}

/** Stacks SheetTitle and SheetDescription. */
export function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="sheet-header" className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />
  )
}

/** Action area pinned to the bottom of the panel. */
export function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="sheet-footer" className={cn('mt-auto flex flex-col gap-2 p-6', className)} {...props} />
  )
}

/** Required: names the sheet for screen readers. */
export function SheetTitle({
  className,
  ...props
}: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cnState('font-semibold', className)}
      {...props}
    />
  )
}

/** Muted text under SheetTitle. */
export function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cnState('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}
