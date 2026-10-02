# Button

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { buttonVariants, Button, type ButtonProps } from 'turkishcoffee'
```

A button. Variants: `default` | `secondary` | `destructive` | `success` |
`outline` | `ghost` | `link`. Sizes: `sm` | `md` (default) | `lg` | `icon` —
there is no `size="default"`. Use `asChild` to style a link as a button.
Server-renderable; handlers come from your own client component.

## Example

```tsx
<Button variant="destructive" size="sm">Delete</Button>

<Button asChild variant="outline">
  <Link href="/settings">Settings</Link>
</Button>
```

## Variants

| Prop | Options | Default |
|---|---|---|
| `variant` | `default` · `secondary` · `destructive` · `success` · `outline` · `ghost` · `link` | `default` |
| `size` | `sm` · `md` · `lg` · `icon` | `md` |

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Radix primitive.

- `asChild?: boolean` — Render as the child element instead of a <button> — e.g. wrap a <Link>.

## Parts

- `buttonVariants` — Button classes as a function — style a non-Button element (e.g. a Radix trigger) like a Button.
- `type ButtonProps`
