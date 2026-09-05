'use client'

import type * as React from 'react'
import { Toast as ToastPrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'
import { XIcon } from '../../lib/icons'
import { dismissToast, useToasts } from './toast-store'

const toastVariants = cva(
  [
    'group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-md border p-4 shadow-lg',
    'data-[state=open]:animate-ui-slide-in-right data-[state=closed]:animate-ui-fade-out',
  ],
  {
    variants: {
      variant: {
        default: 'border-border bg-background text-foreground',
        destructive: 'border-destructive bg-destructive text-destructive-foreground',
        success: 'border-success bg-success text-success-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export type ToastProps = React.ComponentProps<typeof ToastPrimitive.Root> &
  VariantProps<typeof toastVariants>

export function Toast({ className, variant, ...props }: ToastProps) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
}

export const ToastTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Title>) => (
  <ToastPrimitive.Title className={cn('text-sm font-medium', className)} {...props} />
)

export const ToastDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Description>) => (
  <ToastPrimitive.Description className={cn('text-sm opacity-90', className)} {...props} />
)

export const ToastAction = ToastPrimitive.Action

export function ToastClose({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      className={cn(
        'absolute top-2 right-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-70 hover:opacity-100 focus-visible:opacity-100',
        className,
      )}
      {...props}
    >
      <XIcon className="size-4" />
      <span className="sr-only">Close</span>
    </ToastPrimitive.Close>
  )
}

/**
 * Mount once, near the root of the app. Then call `toast()` from anywhere.
 * Renders through a portal, so placement in the tree does not matter.
 */
export function Toaster({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  const toasts = useToasts()

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map(({ id, title, description, variant, duration, action }) => (
        <Toast
          key={id}
          variant={variant}
          duration={duration}
          onOpenChange={(open) => {
            if (!open) dismissToast(id)
          }}
        >
          <div className="flex flex-col gap-1">
            {title ? <ToastTitle>{title}</ToastTitle> : null}
            {description ? <ToastDescription>{description}</ToastDescription> : null}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastPrimitive.Viewport
        data-slot="toast-viewport"
        className={cn(
          'fixed top-0 right-0 z-100 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:top-auto sm:bottom-0 sm:max-w-100',
          className,
        )}
        {...props}
      />
    </ToastPrimitive.Provider>
  )
}
