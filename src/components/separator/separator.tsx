import type * as React from 'react'
import { Separator as SeparatorPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'

export type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root>

/**
 * Thin horizontal or vertical (`orientation="vertical"`) rule.
 * Server-renderable: Radix Separator ships no "use client". Decorative by
 * default; pass `decorative={false}` when it carries meaning.
 */
export function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        'data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full',
        'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
      )}
      {...props}
    />
  )
}
