'use client'

import type * as React from 'react'
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'
import { buttonVariants } from '../button'

/**
 * Modal that interrupts the user to confirm a consequential action. Unlike
 * Dialog it does not close on outside click; the user must pick Action or Cancel.
 * AlertDialogTitle is required for accessibility.
 *
 * @example
 * <AlertDialog>
 *   <AlertDialogTrigger asChild>
 *     <Button variant="destructive">Delete project</Button>
 *   </AlertDialogTrigger>
 *   <AlertDialogContent>
 *     <AlertDialogHeader>
 *       <AlertDialogTitle>Delete this project?</AlertDialogTitle>
 *       <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
 *     </AlertDialogHeader>
 *     <AlertDialogFooter>
 *       <AlertDialogCancel>Cancel</AlertDialogCancel>
 *       <AlertDialogAction className={buttonVariants({ variant: 'destructive' })} onClick={remove}>
 *         Delete
 *       </AlertDialogAction>
 *     </AlertDialogFooter>
 *   </AlertDialogContent>
 * </AlertDialog>
 */
export const AlertDialog = AlertDialogPrimitive.Root
/** Opens the AlertDialog. Use `asChild` to make your own Button the trigger. */
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger
/** Portal used by AlertDialogContent. Rarely needed directly. */
export const AlertDialogPortal = AlertDialogPrimitive.Portal

/** Backdrop behind the AlertDialog. Already rendered by AlertDialogContent. */
export function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/50',
        'data-[state=open]:animate-ui-fade-in data-[state=closed]:animate-ui-fade-out',
        className,
      )}
      {...props}
    />
  )
}

/** The dialog panel. Renders its own portal and overlay. */
export function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          'fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4',
          'rounded-lg border border-border bg-background p-6 shadow-lg',
          'data-[state=open]:animate-ui-pop-in data-[state=closed]:animate-ui-pop-out',
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

/** Stacks AlertDialogTitle and AlertDialogDescription. */
export function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

/** Holds AlertDialogCancel and AlertDialogAction; stacks on mobile, right-aligns from `sm`. */
export function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

/** Required: names the dialog for screen readers. */
export function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  )
}

/** Explains the consequence of the action. */
export function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

/**
 * The confirming button; closes the dialog. Styled as a default Button.
 * Action and Cancel are pre-styled with buttonVariants: an alert dialog is a
 * decision, so the two choices should never drift apart visually. For a
 * destructive action pass `className={buttonVariants({ variant: 'destructive' })}`.
 */
export function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

/** The dismissing button; closes the dialog. Styled as an outline Button. */
export function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      {...props}
    />
  )
}
