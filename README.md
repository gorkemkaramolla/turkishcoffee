# turkishcoffee

Personal React component library. Tailwind v4, Base UI primitives, RSC-aware, ESM-only.

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

<Button variant="secondary" size="lg">Export</Button>
```

`render` renders the component as another element — useful for links. The
children stay on the outer component:

```tsx
<Button render={<Link href="/settings" />} variant="secondary">
  Settings
</Button>
```

## Using with AI agents

No model has seen this library in training, so an agent fills the gaps with
what it remembers from shadcn/ui — and guesses wrong where the APIs differ
(`size="md"`, `toast({ title })`, `turkishcoffee/form`, the `@source` line).
The package ships its own docs for that:

- `AGENTS.md` — setup, import map, a "differences from shadcn/ui" table, rules
- `docs/<component>.md` — parts, variants, props and an example per component
- `llms.txt` / `llms-full.txt` — the same, in the [llms.txt](https://llmstxt.org) format
- JSDoc with an `@example` on every export, so hover and go-to-definition explain it

Add one line to your project's `CLAUDE.md`, `AGENTS.md` or Cursor rules:

```md
UI: use turkishcoffee — read node_modules/turkishcoffee/AGENTS.md before writing components.
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

Overlays animate with CSS transitions on Base UI's `data-starting-style` /
`data-ending-style` attributes — there are no animation tokens and no
`tw-animate-css` dependency. Retime one with `className`, e.g. `duration-150`.
Accordion and Collapsible transition their measured height.

## Components

| Server-renderable | Client (`"use client"`) |
|---|---|
| Alert, AspectRatio, Badge, Card, EmptyState, Input, InputGroup, Label, NativeSelect, Pagination, Separator, Skeleton, Spinner, Table, Textarea | Accordion, AlertDialog, Avatar, AvatarGroup, Breadcrumb, Button, Calendar, Checkbox, Collapsible, CommandButton, DatePicker, Dialog, Drawer, DropdownMenu, HoverCard, InfoLabel, Popover, Progress, RadioGroup, Select, Sheet, SplitButton, Switch, Tabs, Toast, Tooltip |

Hooks: `useMediaQuery`, `useDisclosure`.

### Optional-peer components

Two components need a library you may not want in every project, so they sit
behind their own entry points and are **not** in the root barrel — importing
`Button` never pulls them in:

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
  FormTabs, FormTabsList, FormTabsTrigger, FormTabsContent }
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
toast.success('Saved')
toast.error('Failed', { description: 'Could not reach the server.' })
```

`toast` is sonner's, re-exported and styled with the theme tokens. sonner is a
dependency of this package; don't install it or import from it yourself.

The client components wrap Base UI primitives that hold state; the rest render
on the server with no boundary.

Icons are inline SVGs inside the package — no icon library is pinned on your
projects. Pass a `ReactNode` where you want something richer.

## Server vs client components

Only components that genuinely need it carry `"use client"`. `Card`, `Badge` and `Input` are server-renderable, so importing
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
npm run docs           # regenerate docs/ and llms*.txt from JSDoc
npm run test:browser   # layout, drag and story tests in headless Chromium
npm run bench          # DataTable benchmark (production build, headless Chromium)
```

`npm run bench -- --ab <dir>` compares against another copy of `src/` (for
example the code before a change), alternating the two builds run by run so
both see the same machine load. See `bench/run.mjs` for the options.

## Adding a component

The library has two layers:

- **Primitives** — a Base UI primitive (or a plain element) styled with the
  theme: Button, Tabs, Popover. Base UI owns the behaviour, the library owns
  the look.
- **Patterns** — compose primitives and add behaviour Base UI doesn't have:
  DatePicker, DataTable, FormTabs.

A pattern belongs here only when all of these hold:

- It has appeared in at least two real screens or projects; one-off screens
  stay in the app.
- It is domain-free: `FormTabs` belongs here, an `EmployeeForm` does not.
- It adds behaviour, not just layout. A fixed arrangement of divs is better as
  an example in a doc than as an export.
- It is built from the library's own primitives, so restyling a primitive
  restyles the pattern.
- Its API is compound parts (`FormTabsTrigger`, `FormTabsContent`) plus a hook
  for custom controls, not one component configured through props.
- If it needs a peer the root barrel doesn't, it goes behind its own entry
  point, like `turkishcoffee/form`.

Every export is public API under semver, so ask whether you can keep it stable
before adding it.

1. `src/components/<name>/<name>.tsx` — `cva` for variants, `cn()` last so a
   consumer's `className` wins, spread rest props.
2. `"use client"` only if it has state, effects, or client-only Base UI primitives.
3. JSDoc on every export. The one named after the folder says what it is, when
   to use an alternative instead, and has an `@example`; sub-parts get one line;
   custom props get an inline `/** */`. Write it for the consumer — maintainer
   notes go in `//` comments.
4. `<name>.stories.tsx` alongside it.
5. Export from `src/components/<name>/index.ts` and `src/index.ts`.
6. `npm run docs` — regenerates `docs/`, `llms*.txt` and the index in
   `AGENTS.md` from the JSDoc. CI fails if you forget. If the component changes
   something an agent would get wrong coming from shadcn, add it to the
   differences table in `AGENTS.md` by hand.
