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
        'peer size-4 shrink-0 rounded-sm border border-field hover:border-field-hover transition-[border-color,box-shadow] outline-none',
        'data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
        // Mixed: a primary outline around a small filled square, not a check, so it never reads as checked.
        'data-indeterminate:border-primary data-indeterminate:bg-background data-indeterminate:text-primary',
        'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        'aria-invalid:border-danger aria-invalid:ring-danger',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <CheckIcon className="size-3.5 in-data-indeterminate:hidden" strokeWidth={3} />
        <span aria-hidden="true" className="hidden size-2 rounded-[1px] bg-current in-data-indeterminate:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
