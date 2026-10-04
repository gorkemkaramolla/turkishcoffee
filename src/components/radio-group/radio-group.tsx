'use client'

import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { cnState } from '../../lib/cn'

/**
 * One choice out of a few visible options. Controlled with `value` +
 * `onValueChange(value, eventDetails)`. For many options use Select or NativeSelect.
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
}: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cnState('grid gap-3', className)}
      {...props}
    />
  )
}

/** One option; needs a unique `value`. Pair with a Label via `id`/`htmlFor`. */
export function RadioGroupItem({
  className,
  ...props
}: RadioPrimitive.Root.Props) {
  return (
    // A native button so a sibling <label htmlFor> can name it.
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      nativeButton
      render={<button type="button" />}
      className={cnState(
        'aspect-square size-4 shrink-0 rounded-full border border-input text-primary transition-[color,box-shadow] outline-none',
        'data-checked:border-primary',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator className="relative flex items-center justify-center">
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}
