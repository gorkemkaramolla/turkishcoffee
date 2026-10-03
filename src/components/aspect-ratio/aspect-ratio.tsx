import type * as React from 'react'
import { cn } from '../../lib/cn'

export type AspectRatioProps = React.ComponentProps<'div'> & {
  /** Width divided by height, e.g. `16 / 9`. Defaults to 1 (square). */
  ratio?: number
}

/**
 * Constrains its child (usually an image or video) to `ratio` (width / height)
 * with the CSS `aspect-ratio` property. Server-renderable.
 *
 * @example
 * <AspectRatio ratio={16 / 9}>
 *   <img src={src} alt="" className="size-full rounded-md object-cover" />
 * </AspectRatio>
 */
export function AspectRatio({ ratio = 1, className, style, ...props }: AspectRatioProps) {
  return (
    <div
      data-slot="aspect-ratio"
      className={cn('relative w-full', className)}
      style={{ aspectRatio: ratio, ...style }}
      {...props}
    />
  )
}
