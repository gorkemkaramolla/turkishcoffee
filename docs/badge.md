# Badge

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { badgeVariants, Badge, type BadgeProps } from 'turkishcoffee'
```

Small inline label for a status or count. `tone` says what it means:
`neutral` (default) | `info` | `success` | `warning` | `danger`. `variant`
says how loud: `soft` (default, a tinted fill for statuses in tables and
lists) or `solid` (for counts and the one badge that must stand out). Not
interactive — wrap it in a Button or link if it needs to be clickable.

## Example

```tsx
<Badge tone="success">Paid</Badge>
<Badge tone="danger" variant="solid">3</Badge>
```

## Variants

| Prop | Options | Default |
|---|---|---|
| `tone` | `neutral` · `info` · `success` · `warning` · `danger` | `neutral` |
| `variant` | `soft` · `solid` | `soft` |

## Parts

- `badgeVariants` — Badge classes as a function — style a link or other element like a Badge.
- `type BadgeProps`
