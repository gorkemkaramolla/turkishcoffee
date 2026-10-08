// No @types/node here: declared locally so the bundler's `process.env.NODE_ENV`
// replacement still sees the literal expression.
declare const process: { env: { NODE_ENV?: string } }

/**
 * True outside production builds. Every bundler (Vite, webpack, Turbopack,
 * esbuild) replaces `process.env.NODE_ENV`; `import.meta.env` is Vite's alone.
 * Without a bundler (no `process` in a browser), it is false.
 */
export const isDev: boolean = (() => {
  try {
    return process.env.NODE_ENV !== 'production'
  } catch {
    return false
  }
})()
