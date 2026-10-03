'use client'

import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { cn, cnState } from '../../lib/cn'

export type SwitchProps = SwitchPrimitive.Root.Props

/**
 * On/off toggle for a setting that takes effect immediately. Controlled with
 * `checked` + `onCheckedChange` (not `onChange`). Renders a native `<button>`,
 * so pair it with a Label via `id`/`htmlFor`. For a choice submitted later with a
 * form, prefer Checkbox.
 *
 * @example
 * <div className="flex items-center gap-2">
 *   <Switch id="notifications" checked={on} onCheckedChange={setOn} />
 *   <Label htmlFor="notifications">Email notifications</Label>
 * </div>
 */
export function Switch({ className, ...props }: SwitchProps) {
  // Needs "use client": Base UI Switch holds internal state and event handlers.
  // tsdown's unbundle mode keeps this directive on this file alone, so importing
  // Card or Badge does not drag a client boundary into a server component.
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      nativeButton
      render={<button type="button" />}
      className={cnState(
        'peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all',
        'data-checked:bg-primary data-unchecked:bg-input',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform',
          'data-checked:translate-x-[calc(100%-2px)] data-unchecked:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  )
}
