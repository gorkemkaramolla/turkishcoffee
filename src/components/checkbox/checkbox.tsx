'use client'

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { cnState } from '../../lib/cn'
import { CheckIcon } from '../../lib/icons'

export type CheckboxProps = CheckboxPrimitive.Root.Props

/**
 * A checkbox. Controlled with `checked` + `onCheckedChange` (not `onChange`);
 * the handler gets `(checked: boolean, eventDetails)`. Pass `indeterminate` for a
 * mixed state. Renders a native `<button>`, so pair it with a Label via
 * `id`/`htmlFor`. For an on/off setting that applies immediately, prefer Switch.
 *
 * @example
 * <div className="flex items-center gap-2">
 *   <Checkbox id="terms" checked={accepted} onCheckedChange={setAccepted} />
 *   <Label htmlFor="terms">Accept terms</Label>
 * </div>
 */
export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    // A native button, so a sibling <label htmlFor> (and FormLabel) can name it.
    // Base UI's default <span> only supports a wrapping label.
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      nativeButton
      render={<button type="button" />}
      className={cnState(
        'peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none',
        'data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
        'data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
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
