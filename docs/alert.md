# Alert

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { alertVariants, Alert, AlertTitle, AlertDescription, type AlertProps } from 'turkishcoffee'
```

Inline, non-dismissable message inside the page flow (`role="alert"`).
`tone`: `neutral` (default) | `info` | `success` | `warning` | `danger`. Pass
an `icon` (or put an svg as the first child) and it gets its own column;
every tone but `neutral` brings its own. For a transient message use
`toast()`; for a blocking question use AlertDialog.

## Example

```tsx
<Alert tone="warning">
  <AlertTitle>Trial ends soon</AlertTitle>
  <AlertDescription>Add a payment method to keep your projects.</AlertDescription>
</Alert>

<Alert tone="info">
  <AlertTitle>Leave requests close on Friday</AlertTitle>
</Alert>
```

## Variants

| Prop | Options | Default |
|---|---|---|
| `tone` | `neutral` · `info` · `success` · `warning` · `danger` | `"neutral"` |

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `icon?: React.ReactNode` — Icon in its own column before the text. Every tone but `neutral` brings one (InfoIcon, SuccessIcon, ErrorIcon for warning and danger); pass your own node to replace it, or `null` to drop it.

## Parts

- `alertVariants` — Alert classes as a function, for building alert-like elements.
- `type AlertProps`
- `AlertTitle` — Heading line of an Alert.
- `AlertDescription` — Body text of an Alert. Inherits the tone's colour at 80% rather than always going muted, so a danger alert stays readable as one block of colour.
