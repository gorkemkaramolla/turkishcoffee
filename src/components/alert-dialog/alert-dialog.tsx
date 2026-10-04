'use client'

import type * as React from 'react'
import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog'
import { cn, cnState } from '../../lib/cn'
import { backdrop, popMotion } from '../../lib/motion'
import { buttonVariants } from '../button'

/**
 * Modal that interrupts the user to confirm a consequential action. Unlike
 * Dialog it does not close on outside click; the user must pick Action or Cancel.
 * AlertDialogTitle is required for accessibility.
 *
 * @example
 * <AlertDialog>
 *   <AlertDialogTrigger render={<Button variant="destructive" />}>Delete project</AlertDialogTrigger>
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
/** Opens the AlertDialog. Pass `render={<Button />}` to make your own Button the trigger. */
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger
/** Portal used by AlertDialogContent. Rarely needed directly. */
export const AlertDialogPortal = AlertDialogPrimitive.Portal

/** Backdrop behind the AlertDialog. Already rendered by AlertDialogContent. */
export function AlertDialogOverlay({
  className,
  ...props
}: AlertDialogPrimitive.Backdrop.Props) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cnState(
        backdrop,
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
}: AlertDialogPrimitive.Popup.Props) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        className={cnState(
          'fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4',
          'rounded-lg border border-border bg-background p-6 shadow-lg outline-none',
          popMotion,
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
}: AlertDialogPrimitive.Title.Props) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cnState('text-lg leading-none font-semibold', className)}
      {...props}
    />
  )
}

/** Explains the consequence of the action. */
export function AlertDialogDescription({
  className,
  ...props
}: AlertDialogPrimitive.Description.Props) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cnState('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

/**
 * The confirming button; closes the dialog after its `onClick`. Styled as a default Button.
 * Action and Cancel are pre-styled with buttonVariants: an alert dialog is a
 * decision, so the two choices should never drift apart visually. For a
 * destructive action pass `className={buttonVariants({ variant: 'destructive' })}`.
 */
export function AlertDialogAction({
  className,
  ...props
}: AlertDialogPrimitive.Close.Props) {
  // Base UI has no Action/Cancel parts: both are Close buttons styled apart.
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-action"
      className={cnState(buttonVariants(), className)}
      {...props}
    />
  )
}

/** The dismissing button; closes the dialog. Styled as an outline Button. */
export function AlertDialogCancel({
  className,
  ...props
}: AlertDialogPrimitive.Close.Props) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      className={cnState(buttonVariants({ variant: 'outline' }), className)}
      {...props}
    />
  )
}
