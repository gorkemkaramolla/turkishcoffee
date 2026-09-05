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
    // Peers must never be bundled — including the optional ones, or their .d.ts
    // files get vendored into dist and the package balloons.
    neverBundle: [
      'react',
      'react-dom',
      /^react\//,
      'react-hook-form',
      /^@tanstack\//,
      'radix-ui',
      /^@radix-ui\//,
    ],
  },
})
