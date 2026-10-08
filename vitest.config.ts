import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import tailwindcss from '@tailwindcss/vite'

type BrowserName = 'chromium' | 'firefox' | 'webkit'

/**
 * The engine browser tests run in: `chromium` by default, or `TEST_BROWSER`
 * (`firefox`, `webkit`), which CI uses to cover all three.
 */
// Read through globalThis: the project has no @types/node.
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {}
const browserName = (env.TEST_BROWSER ?? 'chromium') as BrowserName

/** A fresh object per project: Vitest names each browser instance after its project, in place. */
const browser = () => ({
  enabled: true,
  headless: true,
  // Headless Chromium hides scrollbars; Windows and most Linux desktops show
  // classic ones that take space. Show them, so layout tests see that.
  // (Headless Firefox always overlays them: tests that need classic ones skip.)
  provider: playwright(
    browserName === 'chromium' ? { launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } } : {},
  ),
  instances: [{ browser: browserName }],
})

/**
 * Three projects:
 * - `unit` (`pnpm test`): every `*.test.tsx`, in jsdom. Fast; no browser needed.
 * - `browser` and `storybook` (`pnpm test:browser`), in a real headless browser
 *   (Chromium; `TEST_BROWSER=firefox|webkit` for the others):
 *   `*.browser.test.tsx` files need real layout (drag, resize, virtualization,
 *   render counts, timings); every story renders, and stories with a `play`
 *   function are interaction tests. Needs Playwright's Chromium:
 *   `pnpm exec playwright install --with-deps chromium` (system libraries need sudo).
 */
export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.browser.test.{ts,tsx}'],
        },
      },
      {
        plugins: [react(), tailwindcss()],
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.{ts,tsx}'],
          browser: browser(),
        },
      },
      {
        plugins: [storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          browser: browser(),
        },
      },
    ],
  },
})
