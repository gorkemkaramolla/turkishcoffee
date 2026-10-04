/*
 * Enter/exit motion for Base UI parts. Base UI sets data-starting-style on the
 * first frame and data-ending-style until the transition ends, then unmounts,
 * so these are plain CSS transitions: interruptible mid-way, no keyframes.
 * Kept as strings here so every overlay moves the same way.
 */

/** Fade + scale in place, for centered modals (Dialog, AlertDialog). */
export const popMotion =
  'transition-[opacity,scale] duration-50 ease-out data-ending-style:ease-in data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0'

/** Fade + scale from the anchor, for Popover, Menu, Select and Tooltip popups. */
export const popupMotion = `origin-(--transform-origin) ${popMotion}`

/** Fade only, for backdrops and PreviewCard. */
export const fadeMotion =
  'transition-opacity duration-50 ease-out data-ending-style:ease-in data-starting-style:opacity-0 data-ending-style:opacity-0'

/**
 * The dimmed layer behind modals. On iOS 26+ Safari the page shows under the
 * browser chrome, so the backdrop switches to `absolute` there (with
 * `body { position: relative }` from theme.css) to cover the whole viewport.
 */
export const backdrop = `fixed inset-0 z-50 bg-black/50 supports-[-webkit-touch-callout:none]:absolute ${fadeMotion}`

/** Edge slide, for Sheet. Pair with one of the `slideFrom` offsets. */
export const slideMotion = 'transition-transform duration-50 ease-out data-ending-style:ease-in'

/** Where a Sheet starts and ends, by side. */
export const slideFrom = {
  top: 'data-starting-style:-translate-y-full data-ending-style:-translate-y-full',
  bottom: 'data-starting-style:translate-y-full data-ending-style:translate-y-full',
  left: 'data-starting-style:-translate-x-full data-ending-style:-translate-x-full',
  right: 'data-starting-style:translate-x-full data-ending-style:translate-x-full',
} as const
