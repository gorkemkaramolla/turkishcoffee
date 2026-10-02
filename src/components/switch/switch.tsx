'use client'

import type * as React from 'react'
import { Switch as SwitchPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'

export type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root>

/**
 * On/off toggle for a setting that takes effect immediately. Controlled with
 * `checked` + `onCheckedChange` (not `onChange`). For a choice submitted later
 * with a form, prefer Checkbox.
 *
 * @example
 * <div className="flex items-center gap-2">
 *   <Switch id="notifications" checked={on} onCheckedChange={setOn} />
 *   <Label htmlFor="notifications">Email notifications</Label>
 * </div>
 */
export function Switch({ className, ...props }: SwitchProps) {
  // Needs "use client": Radix Switch holds internal state and event handlers.
  // tsdown's unbundle mode keeps this directive on this file alone, so importing
  // Card or Badge does not drag a client boundary into a server component.
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform',
          'data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  )
}
