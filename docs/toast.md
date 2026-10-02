# Toast

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Toast, ToastTitle, ToastDescription, ToastAction, ToastClose, Toaster, toast, dismissToast, useToasts, type ToastProps, type ToastVariant, type ToastOptions, type ToastRecord } from 'turkishcoffee'
```

Shows a toast; returns its id for `dismissToast()`. Takes an options object,
never a bare string. Variants: `toast.success()` and `toast.error()` (which uses
the `destructive` variant). There is no `toast.info` / `toast.warning`.
Requires `<Toaster />` mounted once.

## Example

```tsx
toast({ title: 'Scheduled', description: 'Friday at 10:00.' })
toast.success({ title: 'Saved' })
toast.error({ title: 'Failed', description: 'Could not reach the server.' })
```

## Variants

| Prop | Options | Default |
|---|---|---|
| `variant` | `default` · `destructive` · `success` | `default` |

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Radix primitive.

- `title?: React.ReactNode` — Bold first line.
- `description?: React.ReactNode` — Secondary text under the title.
- `variant?: ToastVariant` — Prefer `toast.success()` / `toast.error()` over setting this directly.
- `duration?: number` — Milliseconds before auto-dismiss.
- `action?: React.ReactNode` — A `<ToastAction altText="…">` button rendered beside the text.

## Parts

- `type ToastProps`
- `Toast` — A single toast. You normally never render this yourself: call `toast()` and let `<Toaster />` render it.
- `ToastTitle` — Title line of a Toast.
- `ToastDescription` — Body text of a Toast.
- `ToastAction` — An action button inside a Toast. Requires `altText` for screen readers.
- `ToastClose` — The × button of a Toast; appears on hover.
- `Toaster` — Renders the toast queue. Mount once, near the root of the app (it is a client component). Then call `toast()` from anywhere. Renders through a portal, so placement in the tree does not matter.

  ```tsx
  // app/layout.tsx
  <body>
    {children}
    <Toaster />
  </body>
  ```

- `type ToastVariant`
- `type ToastOptions` — What `toast()` accepts. Always an object — `toast('Saved')` with a string does not work.
- `type ToastRecord`
- `dismissToast` — Removes a toast by the id `toast()` returned.
- `useToasts` — The live toast queue. Used by `<Toaster />`; rarely needed directly.
