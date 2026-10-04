# Badge

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { badgeVariants, Badge, type BadgeProps } from 'turkishcoffee'
```

Small inline label for a status or count. Variants: `default` | `secondary` |
`destructive` | `success` | `warning` | `inverse` | `outline`. `inverse` is the
neutral grey of toasts and tooltips, for tags like "Beta" or "New". Not
interactive — wrap it in a Button or link if it needs to be clickable.

## Example

```tsx
<Badge variant="success">Paid</Badge>
```

## Variants

| Prop | Options | Default |
|---|---|---|
| `variant` | `default` · `secondary` · `destructive` · `success` · `warning` · `inverse` · `outline` | `default` |

## Parts

- `badgeVariants` — Badge classes as a function — style a link or other element like a Badge.
- `type BadgeProps`
