import type * as React from 'react'
import { cn } from '../../lib/cn'

export type SpinnerProps = React.ComponentProps<'svg'> & {
  /** Announced to screen readers; pass null to keep the spinner silent. */
  label?: string | null
}

/**
 * Drawn inline rather than pulled from an icon set, so the package still pins
 * no icon library on consumers.
 */
export function Spinner({ className, label = 'Loading', ...props }: SpinnerProps) {
  return (
    <svg
      data-slot="spinner"
      role={label ? 'status' : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('size-4 animate-spin text-current', className)}
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
