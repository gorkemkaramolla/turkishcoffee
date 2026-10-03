# Alert

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { alertVariants, Alert, AlertTitle, AlertDescription, type AlertProps } from 'turkishcoffee'
```

Inline, non-dismissable message inside the page flow (`role="alert"`).
Variants: `default` | `info` | `destructive` | `success` | `warning`. Pass an
`icon` (or put an svg as the first child) and it gets its own column; `info`,
`destructive` and `success` bring their own. For a transient message use `toast()`;
for a blocking question use AlertDialog.

## Example

```tsx
<Alert variant="warning">
  <AlertTitle>Trial ends soon</AlertTitle>
  <AlertDescription>Add a payment method to keep your projects.</AlertDescription>
</Alert>

<Alert variant="info">
  <AlertTitle>Leave requests close on Friday</AlertTitle>
</Alert>
```

## Variants

| Prop | Options | Default |
|---|---|---|
| `variant` | `default` · `info` · `destructive` · `success` · `warning` | `"default"` |

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `icon?: React.ReactNode` — Icon in its own column before the text. `info`, `destructive` and `success` show InfoIcon, ErrorIcon and SuccessIcon by default; pass your own node to replace it, or `null` to drop it.

## Parts

- `alertVariants` — Alert classes as a function, for building alert-like elements.
- `type AlertProps`
- `AlertTitle` — Heading line of an Alert.
- `AlertDescription` — Body text of an Alert. Inherits the variant colour at 80% rather than always going muted, so a destructive alert stays readable as one block of colour.
