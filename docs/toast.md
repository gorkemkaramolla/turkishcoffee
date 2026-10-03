# Toast

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { toast, useSonner, Toaster, type ExternalToast, type ToasterProps } from 'turkishcoffee'
```

Mount once, near the root of the app. Then call `toast()` from anywhere.
Renders through a portal, so placement in the tree does not matter.

Colors come from the theme tokens, so it follows `.dark` without a `theme` prop.
Pass `richColors` to render `toast.success` / `toast.error` in solid token colors.

`toast.success`, `toast.error` and `toast.info` carry the library's filled
SuccessIcon, ErrorIcon and InfoIcon; `toast.warning` shares ErrorIcon in the
warning colour. Override any of them with the `icons` prop (`null` removes one).

A plain `toast()` is white on the `--inverse` grey, the same surface Tooltip
uses; its action button sits on that grey with a lighter outline.

## Example

```tsx
// app/layout.tsx
<body>
  {children}
  <Toaster />
</body>

// anywhere in a client component
toast.success('Saved', { description: 'Your changes are live.' })
```

## Parts

- `toast` — Re-exported from sonner: `toast()` plus `toast.success`, `.error`, `.promise`, `.dismiss`.
- `useSonner`
- `type ExternalToast`
- `type ToasterProps`
