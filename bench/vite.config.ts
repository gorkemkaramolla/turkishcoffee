import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// A production build, with React's profiling build so <Profiler> reports
// commit timings (the plain production build drops them). BENCH_SRC points the
// harness's `../src/` imports at another copy of src/ (an A/B baseline);
// BENCH_OUT names its build.
// Read through globalThis: the project has no @types/node.
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {}
const root = new URL('.', import.meta.url).pathname

export default defineConfig({
  root,
  mode: 'production',
  logLevel: 'warn',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^react-dom\/client$/, replacement: 'react-dom/profiling' },
      ...(env.BENCH_SRC ? [{ find: /^\.\.\/src\//, replacement: `${env.BENCH_SRC}/` }] : []),
    ],
  },
  build: { outDir: env.BENCH_OUT ?? 'dist', emptyOutDir: true, minify: true },
})
