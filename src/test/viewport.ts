import { vi } from 'vitest'

/**
 * jsdom has no matchMedia or ResizeObserver. Stub both, answering every
 * `min-width` query from the given viewport width.
 */
export function setViewport(width: number) {
  vi.stubGlobal('matchMedia', (query: string) => {
    const min = /min-width:\s*(\d+)px/.exec(query)
    return {
      matches: min ? width >= Number(min[1]) : false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }
  })
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
}

export const DESKTOP_WIDTH = 1024
export const MOBILE_WIDTH = 375
