# Spinner

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { Spinner, type SpinnerProps } from 'turkishcoffee'
```

Indeterminate loading indicator; `size-4`, inherits text colour. Drawn
inline rather than pulled from an icon set, so the package still pins no icon
library on consumers.

## Example

```tsx
<Button disabled>
  <Spinner label={null} /> Saving…
</Button>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Radix primitive.

- `label?: string | null` — Announced to screen readers; pass null to keep the spinner silent.

## Parts

- `type SpinnerProps`
