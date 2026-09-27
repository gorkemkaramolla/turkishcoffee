'use client'

import * as React from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Drawer as DrawerPrimitive } from 'vaul'
import { cn } from '../../lib/cn'
import { XIcon } from '../../lib/icons'
import { useIsDesktop } from '../../lib/responsive'
import {
  DrawerContent,
  DrawerDescription,
  DrawerOverlay,
  DrawerTitle,
} from '../drawer/drawer'

/**
 * A centered modal on `sm` screens and up, a vaul bottom drawer below. Every part
 * reads the mode from here, so the same markup works in both.
 */
const DialogModeContext = React.createContext<'dialog' | 'drawer'>('dialog')

const useIsDrawer = () => React.useContext(DialogModeContext) === 'drawer'

export function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const isDesktop = useIsDesktop()

  return (
    <DialogModeContext.Provider value={isDesktop ? 'dialog' : 'drawer'}>
      {isDesktop ? <DialogPrimitive.Root {...props} /> : <DrawerPrimitive.Root {...props} />}
    </DialogModeContext.Provider>
  )
}

export function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return useIsDrawer() ? <DrawerPrimitive.Trigger {...props} /> : <DialogPrimitive.Trigger {...props} />
}

export function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return useIsDrawer() ? <DrawerPrimitive.Close {...props} /> : <DialogPrimitive.Close {...props} />
}

export function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return useIsDrawer() ? <DrawerPrimitive.Portal {...props} /> : <DialogPrimitive.Portal {...props} />
}

export function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  const isDrawer = useIsDrawer()
  if (isDrawer) return <DrawerOverlay className={className} {...props} />

  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/50',
        'data-[state=open]:animate-ui-fade-in data-[state=closed]:animate-ui-fade-out',
        className,
      )}
      {...props}
    />
  )
}

export function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }) {
  const isDrawer = useIsDrawer()
  // Swiping down and tapping the overlay close the drawer, so it skips the X button.
  if (isDrawer) {
    return (
      <DrawerContent data-slot="dialog-content" className={className} {...props}>
        {children}
      </DrawerContent>
    )
  }

  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4',
          'rounded-lg border border-border bg-background p-6 shadow-lg',
          'data-[state=open]:animate-ui-pop-in data-[state=closed]:animate-ui-pop-out',
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
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

export function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  const isDrawer = useIsDrawer()
  if (isDrawer) return <DrawerTitle data-slot="dialog-title" className={className} {...props} />

  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  const isDrawer = useIsDrawer()
  if (isDrawer) {
    return <DrawerDescription data-slot="dialog-description" className={className} {...props} />
  }

  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}
