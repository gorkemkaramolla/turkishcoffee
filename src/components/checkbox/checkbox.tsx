'use client'

import type * as React from 'react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'
import { CheckIcon } from '../../lib/icons'

export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>

/**
 * A checkbox. Controlled with `checked` + `onCheckedChange` (not `onChange`);
 * `checked` may also be `'indeterminate'`. Pair with a Label via `id`/`htmlFor`.
 * For an on/off setting that applies immediately, prefer Switch.
 *
 * @example
 * <div className="flex items-center gap-2">
 *   <Checkbox id="terms" checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} />
 *   <Label htmlFor="terms">Accept terms</Label>
 * </div>
 */
export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <CheckIcon className="size-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
