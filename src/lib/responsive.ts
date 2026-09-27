'use client'

import { useMediaQuery } from '../hooks/use-media-query'

/** Tailwind's `sm` breakpoint. Below it, overlays open as a bottom drawer. */
export const DESKTOP_QUERY = '(min-width: 640px)'

/**
 * False during SSR and the first client render, so overlays start as drawers and
 * switch after hydration. Harmless while closed; an overlay that is open when the
 * viewport crosses the breakpoint remounts in the other mode.
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY)
}
