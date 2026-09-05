import type * as React from 'react'
import { AspectRatio as AspectRatioPrimitive } from 'radix-ui'

export type AspectRatioProps = React.ComponentProps<typeof AspectRatioPrimitive.Root>

/**
 * Server-safe: the primitive only computes padding, it holds no state.
 */
export function AspectRatio(props: AspectRatioProps) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}
