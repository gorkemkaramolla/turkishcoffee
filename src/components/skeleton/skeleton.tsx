import type * as React from 'react'
import { cn } from '../../lib/cn'

/**
 * Placeholder in the shape of content that is still loading. Give it the size
 * of the real content with `className`. A brand-blue glint crosses every
 * skeleton on the page at once, corner to corner and back, so a loading page
 * reads as one surface; with reduced motion it is a still fill.
 *
 * @example
 * <div className="flex items-center gap-3">
 *   <Skeleton className="size-10 rounded-full" />
 *   <Skeleton className="h-4 w-40" />
 * </div>
 */
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('tc-skeleton rounded-md', className)}
      {...props}
    />
  )
}
