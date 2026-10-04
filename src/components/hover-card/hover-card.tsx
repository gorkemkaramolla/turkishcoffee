'use client'

import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card'
import { cnState } from '../../lib/cn'
import { fadeMotion } from '../../lib/motion'

/**
 * Rich preview shown when a pointer hovers a link (e.g. a user profile).
 * Built on Base UI's PreviewCard. Not reachable on touch devices — never put
 * essential content or actions in it. For a short text hint use Tooltip; for
 * click-to-open content use Popover.
 *
 * @example
 * <HoverCard>
 *   <HoverCardTrigger href="/u/ada">@ada</HoverCardTrigger>
 *   <HoverCardContent>…</HoverCardContent>
 * </HoverCard>
 */
export const HoverCard = PreviewCardPrimitive.Root
/**
 * The link that opens the HoverCard on hover; renders an `<a>`, so give it
 * `href`. Pass `render={<Link />}` for your router's link. `delay` and
 * `closeDelay` (ms) live here.
 */
export const HoverCardTrigger = PreviewCardPrimitive.Trigger

export type HoverCardContentProps = PreviewCardPrimitive.Popup.Props &
  Pick<PreviewCardPrimitive.Positioner.Props, 'side' | 'sideOffset' | 'align' | 'alignOffset'>

/** The card panel; renders its own portal. */
export function HoverCardContent({
  className,
  side,
  sideOffset = 4,
  align = 'center',
  alignOffset,
  ...props
}: HoverCardContentProps) {
  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner
        className="z-50"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
      >
        <PreviewCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cnState(
            'w-64 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none',
            fadeMotion,
            className,
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}
