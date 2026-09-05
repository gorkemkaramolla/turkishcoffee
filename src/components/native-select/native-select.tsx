import type * as React from 'react'
import { cn } from '../../lib/cn'
import { ChevronDownIcon } from '../../lib/icons'

export type NativeSelectProps = Omit<React.ComponentProps<'select'>, 'size'> & {
  size?: 'sm' | 'md'
}

/**
 * The platform <select>, styled to match Input. Unlike the Radix-based Select
 * it needs no client boundary and keeps the OS picker on mobile — prefer it
 * inside long forms and inside server components.
 */
export function NativeSelect({ className, size = 'md', ...props }: NativeSelectProps) {
  return (
    <div data-slot="native-select-wrapper" className={cn('relative w-full', className)}>
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          'w-full appearance-none rounded-md border border-input bg-background py-1 pr-8 pl-3 text-sm shadow-xs outline-none transition-colors',
          size === 'sm' ? 'h-8' : 'h-9',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        )}
        {...props}
      />
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}
