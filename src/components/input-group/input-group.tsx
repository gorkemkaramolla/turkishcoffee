import type * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'
import { Button, type ButtonProps } from '../button'

/**
 * The group owns the border and the focus ring; the control inside is stripped
 * of both. That way an icon, a prefix and a button read as one field instead of
 * a row of separately outlined boxes.
 */
export function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        'relative flex w-full min-w-0 items-center rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow]',
        'has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50',
        'has-[[data-slot=input-group-control][aria-invalid=true]]:border-destructive has-[[data-slot=input-group-control][aria-invalid=true]]:ring-destructive/20',
        'has-[[data-slot=input-group-control]:disabled]:opacity-50',
        'has-[>textarea]:h-auto',
        className,
      )}
      {...props}
    />
  )
}

export const inputGroupAddonVariants = cva(
  'flex shrink-0 items-center gap-2 text-sm text-muted-foreground select-none [&>svg:not([class*=size-])]:size-4',
  {
    variants: {
      align: {
        start: 'order-first pl-3',
        end: 'order-last pr-3',
      },
    },
    defaultVariants: {
      align: 'start',
    },
  },
)

export type InputGroupAddonProps = React.ComponentProps<'div'> &
  VariantProps<typeof inputGroupAddonVariants>

export function InputGroupAddon({ className, align, ...props }: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align ?? 'start'}
      className={cn(inputGroupAddonVariants({ align }), className)}
      {...props}
    />
  )
}

export function InputGroupInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input-group-control"
      className={cn(
        'h-9 w-full min-w-0 flex-1 bg-transparent px-3 py-1 text-base outline-none md:text-sm',
        'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
        'disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}

export function InputGroupTextarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="input-group-control"
      className={cn(
        'w-full min-w-0 flex-1 resize-none bg-transparent px-3 py-2 text-base outline-none md:text-sm',
        'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
        'disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Sized down and de-shadowed by default so it sits inside the field rather than
 * next to it.
 */
export function InputGroupButton({ className, variant = 'ghost', size = 'sm', ...props }: ButtonProps) {
  return (
    <Button
      data-slot="input-group-button"
      variant={variant}
      size={size}
      className={cn('shadow-none', className)}
      {...props}
    />
  )
}
