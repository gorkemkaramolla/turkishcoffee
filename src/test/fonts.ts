import { beforeAll } from 'vitest'

/**
 * Inter is `font-display: swap`: until it arrives, text is set in the fallback
 * face, and on a cold CI cache it arrives in the middle of a test. Autofit then
 * measures one face and the assertion sees the other, and widths change under
 * a grid that already scrolled. Load it before any browser test measures.
 * A test file without the theme's stylesheet has no Inter face, and this resolves at once.
 */
beforeAll(async () => {
  // One variable file serves every weight.
  await document.fonts.load('400 14px Inter')
})
