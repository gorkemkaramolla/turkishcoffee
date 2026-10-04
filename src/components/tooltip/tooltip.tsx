'use client'

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import { cnState } from '../../lib/cn'
import { popupMotion } from '../../lib/motion'

/** The element the Tooltip describes. Pass `render={<Button />}` to use a Button. */
export const TooltipTrigger = TooltipPrimitive.Trigger

/**
 * Short text hint shown on hover and keyboard focus. Self-providing: no need
 * to wrap your app in a TooltipProvider (there is none to import). `delay` is
 * the hover delay in ms (200 by default). Not shown on touch devices — never put
 * essential information in it.
 *
 * @example
 * <Tooltip>
 *   <TooltipTrigger render={<Button size="icon" variant="ghost" aria-label="Copy" />}>
 *     <CopyIcon />
 *   </TooltipTrigger>
 *   <TooltipContent>Copy to clipboard</TooltipContent>
 * </Tooltip>
 */
export function Tooltip({
  delay = 200,
  ...props
}: TooltipPrimitive.Root.Props & {
  /** Hover delay before the tooltip opens, in ms. */
  delay?: number
}) {
  return (
    <TooltipPrimitive.Provider delay={delay}>
      <TooltipPrimitive.Root {...props} />
    </TooltipPrimitive.Provider>
  )
}

export type TooltipContentProps = TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, 'side' | 'sideOffset' | 'align' | 'alignOffset'>

/** The hint bubble; renders its own portal and arrow. */
export function TooltipContent({
  className,
  side,
  sideOffset = 8,
  align,
  alignOffset,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        className="z-50"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cnState(
            'w-fit rounded-sm bg-inverse px-2 py-1 text-xs text-inverse-foreground',
            popupMotion,
            'data-instant:transition-none',
            className,
          )}
          {...props}
        >
          {children}
          {/* A rotated square; Base UI slides it along the edge, we tuck it half under. */}
          <TooltipPrimitive.Arrow className="size-2.5 rotate-45 rounded-sm bg-inverse data-[side=top]:-bottom-1 data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}
