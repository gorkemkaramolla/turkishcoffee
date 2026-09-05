---
"turkishcoffee": patch
---

Add the components the library was missing next to a full shadcn set:
Accordion, Alert, AlertDialog, AspectRatio, Breadcrumb, Collapsible, HoverCard,
InputGroup, NativeSelect, Progress and Spinner.

All eleven are built on the `radix-ui` package and the inline icons that are
already dependencies, so the install footprint does not change. Six of them
render on the server; only the ones holding Radix state carry `"use client"`.

Accordion and Collapsible animate their measured height, which needs the new
`--animate-ui-accordion-*` and `--animate-ui-collapsible-*` tokens in
`theme.css`.
