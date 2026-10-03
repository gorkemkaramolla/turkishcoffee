import type * as React from 'react'
import { cn } from '../../lib/cn'

export type LabelProps = React.ComponentProps<'label'>

/**
 * Accessible label for a form control; link it with `htmlFor`. Inside a
 * `turkishcoffee/form` field use FormLabel instead, which wires `htmlFor` for you.
 * A native `<label>`, so it is server-renderable.
 */
export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none',
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        'peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
