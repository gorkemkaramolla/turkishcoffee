# turkishcoffee — guide for AI agents

React 19 component library: Tailwind v4, Radix primitives, `cva` variants, `cn()`
class merging, ESM-only. It is **shaped like shadcn/ui but it is not shadcn**: it
is an installed package (not copied source), and a few APIs differ. Read the
"Differences from shadcn/ui" section before writing code; most mistakes come
from assuming shadcn's API.

Per-component docs: `docs/<component>.md` next to this file
(`node_modules/turkishcoffee/docs/` in an installed project). Every export also
carries JSDoc with an example — hover or go to definition.

## Setup

The package ships Tailwind class strings, not compiled CSS. The app's global
stylesheet (e.g. `app/globals.css`) must contain all three lines:

```css
@import "tailwindcss";
@import "turkishcoffee/theme.css";
@source "../node_modules/turkishcoffee/dist";
```

- **`@source` is required.** Without it every component renders unstyled, with
  no error or warning. If components look unstyled, check this line first.
- The `@source` path is relative to the CSS file. In pnpm or monorepos
  `node_modules` may be symlinked; point it at the real path if styles are missing.
- Peers: `react@^19`, `react-dom@^19`, `tailwindcss@^4`. Do not install
  `tailwindcss-animate`, `tw-animate-css`, `lucide-react` or `sonner` for this
  library — it needs none of them.
- Dark mode is class-based: `<html class="dark">`.

## Imports

| What | Import from |
|---|---|
| All components, `cn`, `useDisclosure`, `useMediaQuery`, `toast` | `turkishcoffee` |
| `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `useFormField` | `turkishcoffee/form` (needs `react-hook-form`) |
| `DataTable`, `DataTableColumn`, `dataTableFeatures` | `turkishcoffee/data-table` (needs `@tanstack/react-table` v9) |
| Theme tokens and animations | `turkishcoffee/theme.css` (CSS only) |

There are no per-component paths like `turkishcoffee/button` and no
`@/components/ui/*` files — never generate those imports.

## Differences from shadcn/ui

| shadcn habit | turkishcoffee |
|---|---|
| `<Button size="default">` | `size="md"` (sizes: `sm` · `md` · `lg` · `icon`). Button also has `variant="success"`. |
| `toast("Saved")` / `toast.success("Saved")` (sonner) | `toast({ title: 'Saved' })`, `toast.success({ title })`, `toast.error({ title, description })`. Always an object. No `toast.info` / `toast.warning`. |
| `<Toaster />` from `sonner`, or a `useToast()` hook | `import { Toaster, toast } from 'turkishcoffee'`; mount `<Toaster />` once at the app root. No `useToast`. |
| `<TooltipProvider>` around the app | Not needed and not exported: each `Tooltip` provides itself. |
| `import { Form } from '@/components/ui/form'` | `import { Form, … } from 'turkishcoffee/form'` — not from the root. |
| DataTable built by hand with `ColumnDef` / `createColumnHelper` (TanStack v8) | `import { DataTable, type DataTableColumn } from 'turkishcoffee/data-table'`; columns are `DataTableColumn<Row>[]` (TanStack v9). Sorting and `pageSize` pagination are built in. |
| `lucide-react` icons inside components | Components draw their own icons. Pass any icon element where a `ReactNode` is accepted (`EmptyState icon`, inside `Button`). |
| `tailwindcss-animate` classes (`animate-in`, `fade-in-0`) | Animations are `animate-ui-*` tokens from `theme.css`, e.g. `animate-ui-fade-in`. Retime by redeclaring `--animate-ui-*`. |
| `<Alert variant="warning">` missing | `Alert` and `Badge` have `success` and `warning` variants; `Button` and `Toast` have `success`. |
| `<AlertDialogAction>` is plain | `AlertDialogAction` is styled as a default Button and `AlertDialogCancel` as outline. For a destructive confirm: `className={buttonVariants({ variant: 'destructive' })}`. |

## Rules

- **Compose sub-parts**, don't look for props: `<Card><CardHeader><CardTitle>`,
  not `<Card title="…">`. Every component's parts are listed in its doc.
- **`className` always wins.** Components merge with `cn()` (tailwind-merge), so
  `className="px-8"` overrides the built-in padding. Use `cn()` from
  `turkishcoffee` in your own components too.
- **Links:** use `asChild` on `Button`, `BreadcrumbLink`, and the `*Trigger` /
  `*Close` parts: `<Button asChild><Link href="/x">Go</Link></Button>`.
  `PaginationLink` takes `href` directly and does not support `asChild`.
- **Colours come from tokens**, never hex or the default palette:
  `bg-primary`, `text-muted-foreground`, `border-border`, `bg-destructive`,
  `text-success`, `bg-warning`. Full list: `background`, `foreground`, `card`,
  `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`,
  `warning` (each with `-foreground`), plus `border`, `input`, `ring`.
- **Server vs client:** components marked "Client component" in their doc ship
  `"use client"`. They can be imported from a server component as-is; your event
  handlers still need to live in a client component.
- **Dialog, AlertDialog and Sheet need their Title** (`DialogTitle`, …) for
  accessibility; Radix warns at runtime without it. Radix event props apply:
  `onOpenChange`, `onCheckedChange`, `onValueChange`, `onSelect` on menu items.
- **Choosing between look-alikes:**
  - Dialog (centered task) · AlertDialog (confirm a consequential action) · Sheet (panel from an edge)
  - Popover (click, interactive) · Tooltip (hover, short text) · HoverCard (hover, rich preview)
  - Select (custom, client) · NativeSelect (platform picker, server-renderable, better on mobile)
  - Table (static markup) · DataTable (sorting + pagination)
  - Checkbox (submitted with a form) · Switch (applies immediately)
  - Alert (inline, persistent) · `toast()` (transient)
  - Accordion (several sections) · Collapsible (one region)
  - Spinner (unknown duration) · Progress (known percentage) · Skeleton (content placeholder)
- **Hooks:** `useDisclosure()` returns `{ open, setOpen, onOpen, onClose, onToggle }`
  for controlled dialogs and sheets; `useMediaQuery('(min-width: 768px)')` is
  SSR-safe (false on the server).

## Components

<!-- components:start -->
- [Accordion](docs/accordion.md) · client — Vertically stacked sections that expand one (`type="single"`) or several (`type="multiple"`) at a time.
- [Alert](docs/alert.md) · server — Inline, non-dismissable message inside the page flow (`role="alert"`).
- [AlertDialog](docs/alert-dialog.md) · client — Modal that interrupts the user to confirm a consequential action.
- [AspectRatio](docs/aspect-ratio.md) · server — Constrains its child (usually an image or video) to `ratio` (width / height).
- [Avatar](docs/avatar.md) · client — Round user image with a fallback while it loads or when it fails.
- [Badge](docs/badge.md) · server — Small inline label for a status or count.
- [Breadcrumb](docs/breadcrumb.md) · server — Trail of links to the current page.
- [Button](docs/button.md) · server — A button.
- [Calendar](docs/calendar.md) · client — react-day-picker styled with the theme tokens instead of its stylesheet, so it follows `.dark`.
- [Card](docs/card.md) · server — Bordered surface that groups related content.
- [Checkbox](docs/checkbox.md) · client — A checkbox.
- [Collapsible](docs/collapsible.md) · client — A single region the user can show and hide.
- [DataTable](docs/data-table.md) · client · `turkishcoffee/data-table` — Table with click-to-sort headers and optional client-side pagination, over TanStack Table v9.
- [DatePicker](docs/date-picker.md) · client — Controlled single-date picker.
- [Dialog](docs/dialog.md) · client — Modal for a focused task (a form, details): centered on `sm` screens and up, a vaul bottom drawer below.
- [Drawer](docs/drawer.md) · client — Bottom sheet built on vaul: slides up from the bottom edge and closes on a swipe down, outside tap or Escape.
- [DropdownMenu](docs/dropdown-menu.md) · client — Menu of actions opened from a trigger.
- [EmptyState](docs/empty-state.md) · server — Placeholder for a list or page that has no content yet: icon, title, description and a call to action.
- [Form](docs/form.md) · client · `turkishcoffee/form` — react-hook-form's FormProvider.
- [HoverCard](docs/hover-card.md) · client — Rich preview shown when a pointer hovers a link (e.g.
- [Input](docs/input.md) · server — Single-line text field; a styled `<input>` that forwards every prop.
- [InputGroup](docs/input-group.md) · server — A field that combines a control with icons, text or buttons.
- [Label](docs/label.md) · client — Accessible label for a form control; link it with `htmlFor`.
- [NativeSelect](docs/native-select.md) · server — The platform <select>, styled to match Input.
- [Pagination](docs/pagination.md) · server — Page navigation built from plain anchors, so it works with any router: pass `href` to each link.
- [Popover](docs/popover.md) · client — Floating panel opened by clicking a trigger; for small forms, pickers and extra details.
- [Progress](docs/progress.md) · client — Horizontal bar for a known completion percentage (`value`, 0–100).
- [RadioGroup](docs/radio-group.md) · client — One choice out of a few visible options.
- [Select](docs/select.md) · client — Custom-styled dropdown for picking one value.
- [Separator](docs/separator.md) · server — Thin horizontal or vertical (`orientation="vertical"`) rule.
- [Sheet](docs/sheet.md) · client — Modal panel that slides in from an edge — navigation drawers, filters, detail views.
- [Skeleton](docs/skeleton.md) · server — Pulsing placeholder in the shape of content that is still loading.
- [Spinner](docs/spinner.md) · server — Indeterminate loading indicator; `size-4`, inherits text colour.
- [Switch](docs/switch.md) · client — On/off toggle for a setting that takes effect immediately.
- [Table](docs/table.md) · server — Plain styled table primitives — no data library, server-renderable; wraps the table in a horizontally scrolling container.
- [Tabs](docs/tabs.md) · client — Switches between views in the same place.
- [Textarea](docs/textarea.md) · server — Multi-line text field; grows with its content (`field-sizing-content`) from a minimum of `min-h-16`.
- [Toast](docs/toast.md) · client — Mount once, near the root of the app.
- [Tooltip](docs/tooltip.md) · client — Short text hint shown on hover and keyboard focus.
<!-- components:end -->
