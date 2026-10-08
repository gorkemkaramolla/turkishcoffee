/** Modern browsers use negative scrollLeft for RTL; expose distance from the inline start. */
export function inlineScroll(element: HTMLElement, dir: 'ltr' | 'rtl'): number {
  return dir === 'rtl' ? -element.scrollLeft : element.scrollLeft
}

export function setInlineScroll(element: HTMLElement, distance: number, dir: 'ltr' | 'rtl'): void {
  element.scrollLeft = dir === 'rtl' ? -distance : distance
}
