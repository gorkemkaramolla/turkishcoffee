# Button

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { buttonVariants, Button, type ButtonProps } from 'turkishcoffee'
```

A button. Variants rank emphasis, not meaning: `primary` (default; one per
screen), `secondary` (bordered, for every other action), `ghost` (toolbars
and icon buttons) and `link` (inline in text). There is no coloured tone:
for a dangerous action say the consequence in the label ("Delete
employee") and confirm it in an AlertDialog. Sizes: `sm` (32px) | `md` (36px, default) |
`lg` (40px) | `icon` — from the `--spacing-control*` tokens; there is no
`size="default"`. Pass `render` to style another element, such
as your router's link, as a button. Client component.

## Example

```tsx
<Button variant="secondary" size="sm">Export</Button>

<Button render={<Link href="/settings" />} variant="ghost">
  Settings
</Button>
```

## Variants

| Prop | Options | Default |
|---|---|---|
| `variant` | `primary` · `secondary` · `ghost` · `link` | `"primary"` |
| `size` | `sm` · `md` · `lg` · `icon` | `"md"` |

## Parts

- `buttonVariants` — Button classes as a function — style a non-Button element (e.g. a Base UI trigger) like a Button.
- `type ButtonProps`
