# @gorkemkaramolla/ui

Personal React component library. Tailwind v4, Radix primitives, RSC-aware, ESM-only.

## Install

```bash
npm i @gorkemkaramolla/ui
```

Peers: `react@^19`, `react-dom@^19`, `tailwindcss@^4`.

## Setup

Add three lines to your app's global stylesheet (`app/globals.css`):

```css
@import "tailwindcss";
@import "@gorkemkaramolla/ui/theme.css";
@source "../node_modules/@gorkemkaramolla/ui/dist";
```

The `@source` line is **required**. This package ships Tailwind class strings, not
compiled CSS — your app's Tailwind build generates the utilities, so there is no
duplicated CSS layer and unused components cost nothing. Without `@source`,
components render unstyled because Tailwind ignores `node_modules` by default.

> pnpm / monorepos: `node_modules` is symlinked, so `@source` may need to point at
> the real store path.

## Use

```tsx
import { Button, Card, CardHeader, CardTitle } from '@gorkemkaramolla/ui'

<Button variant="destructive" size="lg">Delete</Button>
```

`asChild` renders as the child element instead — useful for links:

```tsx
<Button asChild variant="outline">
  <Link href="/settings">Settings</Link>
</Button>
```

## Theming

Redeclare any token *after* the import; every component follows:

```css
:root {
  --primary: oklch(0.62 0.19 32);
  --radius: 0.25rem;
}
```

Dark mode is class-based (`<html class="dark">`).

Overlay animations ship as `--animate-ui-*` tokens in `theme.css` (no
`tw-animate-css` dependency). Retime them the same way:

```css
:root { --animate-ui-pop-in: ui-pop-in 80ms ease-out; }
```

## Components

| Server-renderable | Client (`"use client"`) |
|---|---|
| Badge, Button, Card, Input, Separator, Skeleton, Textarea | Avatar, Checkbox, Dialog, DropdownMenu, Label, Popover, RadioGroup, Select, Sheet, Switch, Tabs, Tooltip |

The client ones wrap Radix primitives that hold state; the rest render on the
server with no boundary.

Icons are inline SVGs inside the package — no icon library is pinned on your
projects. Pass a `ReactNode` where you want something richer.

## Server vs client components

Only components that genuinely need it carry `"use client"`. `Button`, `Card`, `Badge` and `Input` are server-renderable, so importing
them does not drag a client boundary into a server component.

The build uses `tsdown` in unbundle mode (one output file per source file) to keep
those directives per-component. Do not switch to `tsup` — esbuild strips them.

## Development

```bash
npm run storybook      # component playground, light/dark toolbar
npm run typecheck
npm test
npm run build
npm run check-exports  # publint + are-the-types-wrong
```

## Adding a component

1. `src/components/<name>/<name>.tsx` — `cva` for variants, `cn()` last so a
   consumer's `className` wins, spread rest props.
2. `"use client"` only if it has state, effects, or client-only Radix primitives.
3. `<name>.stories.tsx` alongside it.
4. Export from `src/components/<name>/index.ts` and `src/index.ts`.
