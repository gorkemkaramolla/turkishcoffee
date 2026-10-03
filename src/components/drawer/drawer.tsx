'use client'

import type * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { cn } from '../../lib/cn'

/**
 * Bottom sheet built on vaul: slides up from the bottom edge and closes on a
 * swipe down, outside tap or Escape. Dialog already becomes one on mobile, so
 * reach for Drawer directly only when you want a drawer on every screen size.
 * DrawerTitle is required for accessibility.
 *
 * @example
 * <Drawer>
 *   <DrawerTrigger asChild>
 *     <Button>Filters</Button>
 *   </DrawerTrigger>
 *   <DrawerContent>
 *     <DrawerHeader>
 *       <DrawerTitle>Filters</DrawerTitle>
 *       <DrawerDescription>Narrow the list.</DrawerDescription>
 *     </DrawerHeader>
 *     …
 *     <DrawerFooter>
 *       <DrawerClose asChild><Button variant="outline">Close</Button></DrawerClose>
 *     </DrawerFooter>
 *   </DrawerContent>
 * </Drawer>
 */
export const Drawer = DrawerPrimitive.Root

/** Opens the Drawer. Use `asChild` to make your own Button the trigger. */
export function DrawerTrigger(props: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

/** Closes the Drawer. Use `asChild` to make your own Button close it. */
export function DrawerClose(props: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

/** Portal used by DrawerContent. Rarely needed directly. */
export function DrawerPortal(props: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal {...props} />
}

/** Backdrop behind the Drawer. Already rendered by DrawerContent. */
export function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      {...props}
    />
  )
}

/** Bottom sheet with a drag handle. vaul drives the enter, exit and swipe motion. */
export function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[85vh] flex-col',
          'rounded-t-lg border-t border-border bg-background outline-none',
          className,
        )}
        {...props}
      >
        <div
          aria-hidden="true"
          className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted"
        />
        <div className="grid gap-4 overflow-y-auto p-4">{children}</div>
      </DrawerPrimitive.Content>
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
export function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  )
}

/** Muted text under DrawerTitle. */
export function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}
