import type * as React from 'react'
import { cn } from '../../lib/cn'

/**
 * Pulsing placeholder in the shape of content that is still loading. Give it
 * the size of the real content with `className`.
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
      className={cn('animate-pulse rounded-md bg-accent', className)}
      {...props}
    />
  )
}
