# turkishcoffee

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
