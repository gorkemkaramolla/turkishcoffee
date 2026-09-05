# turkishcoffee

Personal React component library. Tailwind v4, Radix primitives, RSC-aware, ESM-only.

## Install

```bash
npm i turkishcoffee
```

Peers: `react@^19`, `react-dom@^19`, `tailwindcss@^4`.

## Setup

Add three lines to your app's global stylesheet (`app/globals.css`):

```css
@import "tailwindcss";
@import "turkishcoffee/theme.css";
@source "../node_modules/turkishcoffee/dist";
```

The `@source` line is **required**. This package ships Tailwind class strings, not
compiled CSS — your app's Tailwind build generates the utilities, so there is no
duplicated CSS layer and unused components cost nothing. Without `@source`,
components render unstyled because Tailwind ignores `node_modules` by default.

> pnpm / monorepos: `node_modules` is symlinked, so `@source` may need to point at
> the real store path.

## Use

```tsx
import { Button, Card, CardHeader, CardTitle } from 'turkishcoffee'

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

Accordion and Collapsible animate their measured height, so they use their own
`--animate-ui-accordion-*` / `--animate-ui-collapsible-*` pairs.

## Components

| Server-renderable | Client (`"use client"`) |
|---|---|
| Alert, AspectRatio, Badge, Breadcrumb, Button, Card, EmptyState, Input, InputGroup, NativeSelect, Pagination, Separator, Skeleton, Spinner, Table, Textarea | Accordion, AlertDialog, Avatar, Checkbox, Collapsible, Dialog, DropdownMenu, HoverCard, Label, Popover, Progress, RadioGroup, Select, Sheet, Switch, Tabs, Toast, Tooltip |

Hooks: `useMediaQuery`, `useDisclosure`.

### Optional-peer components

Two components need a library you may not want in every project, so they sit
behind their own entry points and are **not** in the root barrel — importing
`Button` never pulls them in:

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage }
  from 'turkishcoffee/form'        // needs react-hook-form
import { DataTable, type DataTableColumn }
  from 'turkishcoffee/data-table'  // needs @tanstack/react-table
```

Both are declared `optional` in `peerDependenciesMeta`, so npm will not warn
about them in projects that never import those paths.

`Table` (plain styled `<table>` primitives, no data library) stays in the root
barrel — reach for `DataTable` only when you want sorting and pagination.

### Toasts

```tsx
import { Toaster, toast } from 'turkishcoffee'

// mount <Toaster /> once near your app root, then anywhere in a client component:
toast.success({ title: 'Saved' })
toast.error({ title: 'Failed', description: 'Could not reach the server.' })
```

Built on Radix Toast, which is already inside the `radix-ui` dependency — no
`sonner` or other notification library is added.

The client ones wrap Radix primitives that hold state; the rest render on the
server with no boundary.

Icons are inline SVGs inside the package — no icon library is pinned on your
projects. Pass a `ReactNode` where you want something richer.

## Server vs client components

Only components that genuinely need it carry `"use client"`. `Button`, `Card`, `Badge` and `Input` are server-renderable, so importing
them does not drag a client boundary into a server component.

The build uses `tsdown` in unbundle mode (one output file per source file) to keep
those directives per-component. Do not switch to `tsup` — esbuild strips them.

## Releasing

Changesets drives versioning; a GitHub Action publishes on merge to `main`.

```bash
npm run changeset      # describe the change, pick patch/minor/major
git push               # merging opens a "Version Packages" PR
                       # merging THAT publishes to npm with provenance
```

Requires an `NPM_TOKEN` secret on the GitHub repo (automation token, publish
scope). The first `0.1.0` release can be published by hand with `npm publish`.

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
