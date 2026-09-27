'use client'

import type * as React from 'react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { cn } from '../../lib/cn'

export { toast, useSonner, type ExternalToast, type ToasterProps } from 'sonner'

/**
 * Mount once, near the root of the app. Then call `toast()` from anywhere.
 * Renders through a portal, so placement in the tree does not matter.
 *
 * Colors come from the theme tokens, so it follows `.dark` without a `theme` prop.
 * Pass `richColors` to render `toast.success` / `toast.error` in solid token colors.
 */
export function Toaster({ className, style, toastOptions, ...props }: ToasterProps) {
  return (
    <Sonner
      data-slot="toaster"
      className={cn('toaster group', className)}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--success)',
          '--success-text': 'var(--success-foreground)',
          '--success-border': 'var(--success)',
          '--error-bg': 'var(--destructive)',
          '--error-text': 'var(--destructive-foreground)',
          '--error-border': 'var(--destructive)',
          '--warning-bg': 'var(--warning)',
          '--warning-text': 'var(--warning-foreground)',
          '--warning-border': 'var(--warning)',
          '--border-radius': 'var(--radius)',
          ...style,
        } as React.CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          description: 'opacity-90',
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  )
}
