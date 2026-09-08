# turkishcoffee

## 1.1.2

### Patch Changes

- f1d7fd3: Ship declaration maps and the TypeScript sources next to `dist`, so that
  go-to-definition in a consuming app lands on the component's own source file
  instead of the generated `dist/**/*.d.ts`.
  
  `dts` now runs with `sourcemap: true` and `files` carries `src` alongside
  `dist` — a `.d.ts.map` is worthless if the file it points at was never
  published. Stories and tests stay out of the tarball, which more than pays for
  the sources: the package goes from 87.2 kB to 79.1 kB.

## 1.1.1

### Patch Changes

- af3cb26: Add the components the library was missing next to a full shadcn set:
  Accordion, Alert, AlertDialog, AspectRatio, Breadcrumb, Collapsible, HoverCard,
  InputGroup, NativeSelect, Progress and Spinner.
  
  All eleven are built on the `radix-ui` package and the inline icons that are
  already dependencies, so the install footprint does not change. Six of them
  render on the server; only the ones holding Radix state carry `"use client"`.
  
  Accordion and Collapsible animate their measured height, which needs the new
  `--animate-ui-accordion-*` and `--animate-ui-collapsible-*` tokens in
  `theme.css`.
