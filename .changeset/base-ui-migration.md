---
"turkishcoffee": major
---

Move every component from Radix UI (and vaul) to Base UI. Radix is no longer in the dependency tree.

Breaking changes — see "Upgrading from v2 (Radix) to v3 (Base UI)" in AGENTS.md:

- `asChild` is replaced by `render`: `<Button render={<Link href="/x" />}>Go</Button>`.
- Accordion: `type="single" | "multiple"` + `collapsible` become `multiple?: boolean`; `value` is always an array.
- Checkbox: `checked="indeterminate"` becomes the `indeterminate` prop.
- DropdownMenuItem: `onSelect` becomes `onClick`.
- Tooltip: `delayDuration` becomes `delay`.
- Select: pass `items` so SelectValue shows the item's label.
- `PopoverAnchor` is removed; use the `anchor` prop on PopoverContent.
- Change handlers receive a second `eventDetails` argument.
- `data-[state=*]` selectors become `data-open`, `data-checked`, `data-active`, …
- The `animate-ui-*` animation tokens are removed from theme.css; overlays use CSS transitions.
- Drawer, and Dialog on mobile, run on Base UI's Drawer instead of vaul.
- Button and BreadcrumbLink are now client components; Label, Separator and AspectRatio are now server-renderable.
