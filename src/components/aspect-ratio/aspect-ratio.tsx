import type * as React from 'react'
import { AspectRatio as AspectRatioPrimitive } from 'radix-ui'

export type AspectRatioProps = React.ComponentProps<typeof AspectRatioPrimitive.Root>

/**
 * Constrains its child (usually an image or video) to `ratio` (width / height).
 * Server-safe: the primitive only computes padding, it holds no state.
 *
 * @example
 * <AspectRatio ratio={16 / 9}>
 *   <img src={src} alt="" className="size-full rounded-md object-cover" />
 * </AspectRatio>
 */
export function AspectRatio(props: AspectRatioProps) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}
