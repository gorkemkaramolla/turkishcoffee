'use client'

import type * as React from 'react'
import { Dialog as SheetPrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'
import { XIcon } from '../../lib/icons'

export const Sheet = SheetPrimitive.Root
export const SheetTrigger = SheetPrimitive.Trigger
export const SheetClose = SheetPrimitive.Close

const sheetVariants = cva(
  'fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition-none',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 h-auto border-b border-border data-[state=open]:animate-ui-slide-in-top data-[state=closed]:animate-ui-slide-out-top',
        bottom:
          'inset-x-0 bottom-0 h-auto border-t border-border data-[state=open]:animate-ui-slide-in-bottom data-[state=closed]:animate-ui-slide-out-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r border-border sm:max-w-sm data-[state=open]:animate-ui-slide-in-left data-[state=closed]:animate-ui-slide-out-left',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l border-border sm:max-w-sm data-[state=open]:animate-ui-slide-in-right data-[state=closed]:animate-ui-slide-out-right',
      },
    },
    defaultVariants: { side: 'right' },
  },
)

export type SheetContentProps = React.ComponentProps<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetVariants>

export function SheetContent({ className, children, side, ...props }: SheetContentProps) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-ui-fade-in data-[state=closed]:animate-ui-fade-out"
      />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

export function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="sheet-header" className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />
  )
}

export function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="sheet-footer" className={cn('mt-auto flex flex-col gap-2 p-6', className)} {...props} />
  )
}

export function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('font-semibold', className)}
      {...props}
    />
  )
}

export function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}
