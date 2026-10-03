# Separator

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { Separator, type SeparatorProps } from 'turkishcoffee'
```

Thin horizontal or vertical (`orientation="vertical"`) rule.
Server-renderable: a plain element, no primitive needed. Decorative by
default; pass `decorative={false}` when it carries meaning.

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `decorative?: boolean` — Purely visual (the default), so screen readers skip it. Pass `false` when it carries meaning.

## Parts

- `type SeparatorProps`
