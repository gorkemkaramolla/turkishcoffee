'use client'

import * as React from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer'
import { cn, cnState } from '../../lib/cn'
import { XIcon } from '../../lib/icons'
import { backdrop, popMotion } from '../../lib/motion'
import { useIsDesktop } from '../../lib/responsive'
import {
  DrawerContent,
  DrawerDescription,
  DrawerOverlay,
  DrawerTitle,
} from '../drawer/drawer'

// Base UI's Drawer is built on its Dialog, so the drawer branches take the same
// props; the casts below only bridge the two parts' distinct handle/state types.
const DialogModeContext = React.createContext<'dialog' | 'drawer'>('dialog')

const useIsDrawer = () => React.useContext(DialogModeContext) === 'drawer'

/**
 * Modal for a focused task (a form, details): centered on `sm` screens and up,
 * a Base UI bottom drawer below. Every part reads the mode from here, so the same
 * markup works in both. Closes on outside click and Escape (and a swipe down on
 * mobile). For confirming a destructive action use AlertDialog; for a panel
 * sliding from an edge use Sheet. DialogTitle is required for accessibility.
 *
 * @example
 * <Dialog>
 *   <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Edit profile</DialogTitle>
 *       <DialogDescription>Changes are saved when you click Save.</DialogDescription>
 *     </DialogHeader>
 *     …
 *     <DialogFooter>
 *       <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
 *       <Button type="submit">Save</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 */
export function Dialog(props: DialogPrimitive.Root.Props) {
  const isDesktop = useIsDesktop()

  return (
    <DialogModeContext.Provider value={isDesktop ? 'dialog' : 'drawer'}>
      {isDesktop ? <DialogPrimitive.Root {...props} /> : <DrawerPrimitive.Root {...(props as DrawerPrimitive.Root.Props)} />}
    </DialogModeContext.Provider>
  )
}

/** Opens the Dialog. Pass `render={<Button />}` to make your own Button the trigger. */
export function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return useIsDrawer() ? <DrawerPrimitive.Trigger {...(props as DrawerPrimitive.Trigger.Props)} /> : <DialogPrimitive.Trigger {...props} />
}

/** Closes the Dialog. Pass `render={<Button />}` to make your own Button close it. */
export function DialogClose(props: DialogPrimitive.Close.Props) {
  return useIsDrawer() ? <DrawerPrimitive.Close {...props} /> : <DialogPrimitive.Close {...props} />
}

/** Portal used by DialogContent. Rarely needed directly. */
export function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return useIsDrawer() ? <DrawerPrimitive.Portal {...props} /> : <DialogPrimitive.Portal {...props} />
}

/** Backdrop behind the Dialog. Already rendered by DialogContent. */
export function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  const isDrawer = useIsDrawer()
  if (isDrawer) return <DrawerOverlay className={className} {...props} />

  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cnState(
        backdrop,
        className,
      )}
      {...props}
    />
  )
}

/**
 * The dialog panel. Renders its own portal, overlay and a close (×) button
 * (a bottom drawer without the × on mobile); pass `showCloseButton={false}` to drop the ×. Widen with `className="sm:max-w-2xl"`.
 */
export function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  /** Render the × button in the top-right corner (desktop only). Defaults to true. */
  showCloseButton?: boolean
}) {
  const isDrawer = useIsDrawer()
  // Swiping down and tapping the overlay close the drawer, so it skips the X button.
  if (isDrawer) {
    return (
      <DrawerContent
        data-slot="dialog-content"
        {...({ className, ...props } as DrawerPrimitive.Popup.Props)}
      >
        {children}
      </DrawerContent>
    )
  }

  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cnState(
          'fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4',
          'rounded-lg border border-border bg-background p-6 shadow-lg outline-none',
          popMotion,
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

/** Stacks DialogTitle and DialogDescription. */
export function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

/** Action row; stacks on mobile, right-aligns from `sm`. */
export function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

/** Required: names the dialog for screen readers. */
export function DialogTitle({
  className,
  ...props
}: DialogPrimitive.Title.Props) {
  const isDrawer = useIsDrawer()
  if (isDrawer) return <DrawerTitle data-slot="dialog-title" className={className} {...props} />

  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cnState('text-lg leading-none font-semibold', className)}
      {...props}
    />
  )
}

/** Muted text under DialogTitle. */
export function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  const isDrawer = useIsDrawer()
  if (isDrawer) {
    return <DrawerDescription data-slot="dialog-description" className={className} {...props} />
  }

  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cnState('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}
