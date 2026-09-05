import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.stories.tsx',
    '!src/**/*.test.{ts,tsx}',
    '!src/test/**',
  ],
  format: ['esm'],
  platform: 'neutral',
  // One output file per source file: this is what preserves each component's
  // own "use client" directive instead of hoisting/stripping it.
  unbundle: true,
  dts: true,
  clean: true,
  deps: {
    neverBundle: ['react', 'react-dom', /^react\//],
  },
})
