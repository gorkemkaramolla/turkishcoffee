import type * as React from 'react'
import { cn } from '../../lib/cn'

export type SeparatorProps = React.ComponentProps<'div'> & {
  orientation?: 'horizontal' | 'vertical'
  /** Purely visual (the default), so screen readers skip it. Pass `false` when it carries meaning. */
  decorative?: boolean
}

/**
 * Thin horizontal or vertical (`orientation="vertical"`) rule.
 * Server-renderable: a plain element, no primitive needed. Decorative by
 * default; pass `decorative={false}` when it carries meaning.
 */
export function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <div
      data-slot="separator"
      data-orientation={orientation}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative || orientation === 'horizontal' ? undefined : orientation}
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
