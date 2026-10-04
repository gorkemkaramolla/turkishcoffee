import type * as React from 'react'
import { cn } from '../../lib/cn'

export type InputProps = React.ComponentProps<'input'>

/**
 * Single-line text field; a styled `<input>` that forwards every prop.
 * Server-renderable; handlers like onChange come from your own client component.
 * For an icon, prefix or inline button inside the field use InputGroup.
 *
 * @example
 * <Label htmlFor="email">Email</Label>
 * <Input id="email" type="email" placeholder="you@example.com" />
 */
export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-control w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none md:text-sm',
        'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  )
}
