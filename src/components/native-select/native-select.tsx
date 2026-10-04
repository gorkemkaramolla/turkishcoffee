import type * as React from 'react'
import { cn } from '../../lib/cn'
import { ChevronDownIcon } from '../../lib/icons'

export type NativeSelectProps = Omit<React.ComponentProps<'select'>, 'size'> & {
  /** Height: `sm` (28px) or `md` (32px, default). Replaces the HTML `size` attribute. */
  size?: 'sm' | 'md'
}

/**
 * The platform <select>, styled to match Input. Unlike the Base UI Select
 * it needs no client boundary and keeps the OS picker on mobile — prefer it
 * inside long forms and inside server components. `size`: `sm` | `md` (default).
 * `className` goes on the wrapper div (use it for width); other props reach the `<select>`.
 *
 * @example
 * <NativeSelect name="country" defaultValue="tr">
 *   <option value="tr">Türkiye</option>
 *   <option value="de">Germany</option>
 * </NativeSelect>
 */
export function NativeSelect({ className, size = 'md', ...props }: NativeSelectProps) {
  return (
    <div data-slot="native-select-wrapper" className={cn('relative w-full', className)}>
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          'w-full appearance-none rounded-md border border-input bg-background py-1 pr-8 pl-3 text-sm outline-none transition-colors',
          size === 'sm' ? 'h-control-sm' : 'h-control',
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
