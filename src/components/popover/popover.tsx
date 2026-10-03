'use client'

import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { cnState } from '../../lib/cn'
import { popupMotion } from '../../lib/motion'

/**
 * Floating panel opened by clicking a trigger; for small forms, pickers and
 * extra details. Non-modal. For a hover hint use Tooltip; for a list of actions
 * use DropdownMenu.
 *
 * @example
 * <Popover>
 *   <PopoverTrigger render={<Button variant="outline" />}>Filters</PopoverTrigger>
 *   <PopoverContent align="start">…</PopoverContent>
 * </Popover>
 */
export const Popover = PopoverPrimitive.Root
/** Opens the Popover. Pass `render={<Button />}` to make your own Button the trigger. */
export const PopoverTrigger = PopoverPrimitive.Trigger

export type PopoverContentProps = PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, 'side' | 'sideOffset' | 'align' | 'alignOffset' | 'anchor'>

/**
 * The panel; renders its own portal. `w-72` by default. Pass `anchor` (an
 * element or ref) to position it against something other than the trigger.
 */
export function PopoverContent({
  className,
  side,
  sideOffset = 4,
  align = 'center',
  alignOffset,
  anchor,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        className="z-50"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cnState(
            'w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none',
            popupMotion,
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}
