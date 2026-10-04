# Button

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { buttonVariants, Button, type ButtonProps } from 'turkishcoffee'
```

A button. Variants: `default` | `secondary` | `destructive` | `success` |
`outline` | `ghost` | `link`. Sizes: `sm` (28px) | `md` (32px, default) |
`lg` (36px) | `icon` — from the `--spacing-control*` tokens; there is no
`size="default"`. Pass `render` to style another element, such
as your router's link, as a button. Client component.

## Example

```tsx
<Button variant="destructive" size="sm">Delete</Button>

<Button render={<Link href="/settings" />} variant="outline">
  Settings
</Button>
```

## Variants

| Prop | Options | Default |
|---|---|---|
| `variant` | `default` · `secondary` · `destructive` · `success` · `outline` · `ghost` · `link` | `"default"` |
| `size` | `sm` · `md` · `lg` · `icon` | `"md"` |

## Parts

- `buttonVariants` — Button classes as a function — style a non-Button element (e.g. a Base UI trigger) like a Button.
- `type ButtonProps`
