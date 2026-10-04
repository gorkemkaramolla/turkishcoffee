# turkishcoffee

## 3.0.1

### Patch Changes

- e271314: A design language of its own for business screens, driven by theme tokens:
  
  - **Sharp corners:** `--radius` is 4px, with a 2/4/6/8px scale. Cards, dialogs and toasts are 6px; small parts are 2px.
  - **Compact controls:** `--spacing-control*` tokens (28/32/36px, so `h-control`). Button, Input, Select, NativeSelect, InputGroup and TabsList share them. The default button is now 32px (was 36px).
  - **Flat surfaces:** resting controls and cards lose their shadows. `shadow-float` is the single elevation for popovers, menus, dialogs, sheets and toasts.
  - **Tinted active states:** `--selection` replaces the grey highlight in menus, select and calendar ranges. The open accordion header, the active tab and the selected table row get a 2px primary edge.
  
  Visual only, no API changes. Layouts that assumed the 36px control height may need a look.

## 3.0.0

### Major Changes

- 8c0a3d1: Move every component from Radix UI (and vaul) to Base UI. Radix is no longer in the dependency tree.
  
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

### Minor Changes

- d3b27c0: Ship docs for AI agents inside the package: `AGENTS.md` (setup, import map,
  differences from shadcn/ui, rules), `docs/<component>.md` for every component,
  and `llms.txt` / `llms-full.txt`. Every export now carries JSDoc with an
  example, so hover and go-to-definition explain the API.
  
  Point your agent at it with one line in your project's `CLAUDE.md` or `AGENTS.md`:
  `UI: use turkishcoffee — read node_modules/turkishcoffee/AGENTS.md before writing components.`

## 2.0.0

### Major Changes

- 918eebc: Add `Calendar`, `DatePicker` and `DateRangePicker` (built on react-day-picker, styled with theme tokens, localizable via date-fns locales), and a standalone vaul-based `Drawer`.
  
  `Dialog` is now responsive: it stays a centered modal on `sm` screens and up and becomes a vaul bottom drawer (swipe to dismiss, no X button) below 640px. The API is unchanged. It renders as a drawer during SSR and switches after hydration, and a dialog that is open while the viewport crosses the breakpoint remounts. The date pickers follow the same rule: a popover on desktop, a drawer on mobile.
- d616718: Toast is now built on [sonner](https://sonner.emilkowal.ski). `Toaster` wraps sonner's `Toaster` with theme tokens, and `toast` is sonner's API: `toast('Saved', { description })`, `toast.success(...)`, `toast.error(...)`, `toast.dismiss(id)`.
  
  Removed: `Toast`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`, `dismissToast`, `useToasts`, and the `ToastProps` / `ToastOptions` / `ToastRecord` / `ToastVariant` types. Migrate `toast({ title, description })` to `toast(title, { description })` and `dismissToast(id)` to `toast.dismiss(id)`. Pass `richColors` to `<Toaster />` for solid success/error colors like the old variants.

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
