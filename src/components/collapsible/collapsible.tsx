'use client'

import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'
import { cnState } from '../../lib/cn'

/**
 * A single region the user can show and hide. For several related sections
 * use Accordion.
 *
 * @example
 * <Collapsible>
 *   <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}>
 *     Show details
 *   </CollapsibleTrigger>
 *   <CollapsibleContent>…</CollapsibleContent>
 * </Collapsible>
 */
export const Collapsible = CollapsiblePrimitive.Root
/** Toggles the Collapsible. Unstyled — pass `render={<Button />}` to style it. */
export const CollapsibleTrigger = CollapsiblePrimitive.Trigger

/** The region that shows and hides, with a height animation. */
export function CollapsibleContent({
  className,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cnState(
        'overflow-hidden',
        // Base UI measures the panel into --collapsible-panel-height.
        'h-(--collapsible-panel-height) transition-[height] duration-50 ease-out data-ending-style:ease-in data-starting-style:h-0 data-ending-style:h-0',
        className,
      )}
      {...props}
    />
  )
}
