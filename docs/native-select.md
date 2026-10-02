# NativeSelect

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { NativeSelect, type NativeSelectProps } from 'turkishcoffee'
```

The platform <select>, styled to match Input. Unlike the Radix-based Select
it needs no client boundary and keeps the OS picker on mobile — prefer it
inside long forms and inside server components. `size`: `sm` | `md` (default).
`className` goes on the wrapper div (use it for width); other props reach the `<select>`.

## Example

```tsx
<NativeSelect name="country" defaultValue="tr">
  <option value="tr">Türkiye</option>
  <option value="de">Germany</option>
</NativeSelect>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Radix primitive.

- `size?: 'sm' | 'md'` — Height: `sm` (h-8) or `md` (h-9, default). Replaces the HTML `size` attribute.

## Parts

- `type NativeSelectProps`
