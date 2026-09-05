'use client'

import type * as React from 'react'
import { Collapsible as CollapsiblePrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'

export const Collapsible = CollapsiblePrimitive.Root
export const CollapsibleTrigger = CollapsiblePrimitive.Trigger

export function CollapsibleContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      className={cn(
        'overflow-hidden',
        'data-[state=open]:animate-ui-collapsible-down data-[state=closed]:animate-ui-collapsible-up',
        className,
      )}
      {...props}
    />
  )
}
