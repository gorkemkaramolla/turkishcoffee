'use client'

import type * as React from 'react'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'

/**
 * One choice out of a few visible options. Controlled with `value` +
 * `onValueChange`. For many options use Select or NativeSelect.
 *
 * @example
 * <RadioGroup defaultValue="monthly">
 *   <div className="flex items-center gap-2">
 *     <RadioGroupItem value="monthly" id="monthly" />
 *     <Label htmlFor="monthly">Monthly</Label>
 *   </div>
 *   <div className="flex items-center gap-2">
 *     <RadioGroupItem value="yearly" id="yearly" />
 *     <Label htmlFor="yearly">Yearly</Label>
 *   </div>
 * </RadioGroup>
 */
export function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  )
}

/** One option; needs a unique `value`. Pair with a Label via `id`/`htmlFor`. */
export function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs transition-[color,box-shadow] outline-none',
        'data-[state=checked]:border-primary',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="relative flex items-center justify-center">
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}
