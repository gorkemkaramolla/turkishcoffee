/** Modern browsers use negative scrollLeft for RTL; expose distance from the inline start. */
export function inlineScroll(element: HTMLElement, dir: 'ltr' | 'rtl'): number {
  return dir === 'rtl' ? -element.scrollLeft : element.scrollLeft
}

export function setInlineScroll(element: HTMLElement, distance: number, dir: 'ltr' | 'rtl'): void {
  element.scrollLeft = dir === 'rtl' ? -distance : distance
}

let native: boolean | undefined

/**
 * Whether the browser moves the header itself, on the compositor in the same
 * frame as the body's scroll (theme.css: a scroll-driven animation). Chrome and
 * Safari do; elsewhere the header strip is scrolled from the body's `scroll`
 * event, which fires a frame after the body has moved.
 */
export function headerFollowsNatively(): boolean {
  native ??= typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()')
  return native
}

/** Lines the header strip up with the body where the browser does not do it by itself. */
export function mirrorHeader(header: HTMLElement | null, body: HTMLElement): void {
  if (!header || headerFollowsNatively()) return
  if (header.scrollLeft !== body.scrollLeft) header.scrollLeft = body.scrollLeft
}
