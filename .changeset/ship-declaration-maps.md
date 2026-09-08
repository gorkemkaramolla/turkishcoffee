---
"turkishcoffee": patch
---

Ship declaration maps and the TypeScript sources next to `dist`, so that
go-to-definition in a consuming app lands on the component's own source file
instead of the generated `dist/**/*.d.ts`.

`dts` now runs with `sourcemap: true` and `files` carries `src` alongside
`dist` — a `.d.ts.map` is worthless if the file it points at was never
published. Stories and tests stay out of the tarball, which more than pays for
the sources: the package goes from 87.2 kB to 79.1 kB.
