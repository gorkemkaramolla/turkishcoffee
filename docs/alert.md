# Alert

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { alertVariants, Alert, AlertTitle, AlertDescription, type AlertProps } from 'turkishcoffee'
```

Inline, non-dismissable message inside the page flow (`role="alert"`).
Variants: `default` | `destructive` | `success` | `warning`. Put an icon as the
first child and it gets its own column. For a transient message use `toast()`;
for a blocking question use AlertDialog.

## Example

```tsx
<Alert variant="warning">
  <AlertTitle>Trial ends soon</AlertTitle>
  <AlertDescription>Add a payment method to keep your projects.</AlertDescription>
</Alert>
```

## Variants

| Prop | Options | Default |
|---|---|---|
| `variant` | `default` · `destructive` · `success` · `warning` | `default` |

## Parts

- `alertVariants` — Alert classes as a function, for building alert-like elements.
- `type AlertProps`
- `AlertTitle` — Heading line of an Alert.
- `AlertDescription` — Body text of an Alert. Inherits the variant colour at 80% rather than always going muted, so a destructive alert stays readable as one block of colour.
