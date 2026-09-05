'use client'

import { useSyncExternalStore } from 'react'

/**
 * SSR-safe: returns false on the server, then the real value after hydration.
 * useSyncExternalStore avoids the flash an effect-based version produces.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
