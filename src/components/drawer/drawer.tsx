'use client'

import type * as React from 'react'
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer'
import { cn, cnState } from '../../lib/cn'

/**
 * Bottom sheet built on Base UI's Drawer: slides up from the bottom edge and
 * closes on a swipe down, outside tap or Escape. Dialog already becomes one on
 * mobile, so reach for Drawer directly only when you want a drawer on every
 * screen size. DrawerTitle is required for accessibility.
 *
 * @example
 * <Drawer>
 *   <DrawerTrigger render={<Button />}>Filters</DrawerTrigger>
 *   <DrawerContent>
 *     <DrawerHeader>
 *       <DrawerTitle>Filters</DrawerTitle>
 *       <DrawerDescription>Narrow the list.</DrawerDescription>
 *     </DrawerHeader>
 *     …
 *     <DrawerFooter>
 *       <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
 *     </DrawerFooter>
 *   </DrawerContent>
 * </Drawer>
 */
export const Drawer = DrawerPrimitive.Root

/** Opens the Drawer. Pass `render={<Button />}` to make your own Button the trigger. */
export function DrawerTrigger(props: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

/** Closes the Drawer. Pass `render={<Button />}` to make your own Button close it. */
export function DrawerClose(props: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

/** Portal used by DrawerContent. Rarely needed directly. */
export const DrawerPortal = DrawerPrimitive.Portal

// The drawer moves on Base UI's timing curve rather than the 50 ms overlay
// motion: it travels the full screen height and follows the finger mid-swipe.
const travel = 'duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0'

/** Backdrop behind the Drawer; fades with the swipe. Already rendered by DrawerContent. */
export function DrawerOverlay({ className, ...props }: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cnState(
        'fixed inset-0 z-50 min-h-dvh supports-[-webkit-touch-callout:none]:absolute bg-black opacity-[calc(0.5*(1-var(--drawer-swipe-progress)))] transition-opacity',
        travel,
        'data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]',
        className,
      )}
      {...props}
    />
  )
}

/** Bottom sheet with a drag handle. Base UI drives the enter, exit and swipe motion. */
export function DrawerContent({ className, children, ...props }: DrawerPrimitive.Popup.Props) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          className={cnState(
            'mt-24 flex max-h-[85vh] w-full flex-col',
            'rounded-t-lg border-t border-border bg-background outline-none',
            '[transform:translateY(var(--drawer-swipe-movement-y))] transition-transform',
            travel,
            'data-swiping:select-none',
            'data-starting-style:[transform:translateY(100%)] data-ending-style:[transform:translateY(100%)] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]',
            className,
          )}
          {...props}
        >
          <div
            aria-hidden="true"
            className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted"
          />
          {/* Content marks the scrollable area: touches here scroll instead of swiping. */}
          <DrawerPrimitive.Content className="grid gap-4 overflow-y-auto overscroll-contain p-4">
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  )
}

/** Stacks DrawerTitle and DrawerDescription. */
export function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn('flex flex-col gap-1.5 text-center sm:text-left', className)}
      {...props}
    />
  )
}

/** Action row pinned to the bottom of the Drawer. */
export function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('mt-auto flex flex-col gap-2', className)}
      {...props}
    />
  )
}

/** Required: names the drawer for screen readers. */
export function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cnState('text-lg leading-none font-semibold', className)}
      {...props}
    />
  )
}

/** Muted text under DrawerTitle. */
export function DrawerDescription({ className, ...props }: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cnState('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}
