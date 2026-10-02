# Select

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem, SelectLabel, SelectSeparator } from 'turkishcoffee'
```

Custom-styled dropdown for picking one value. Controlled with `value` +
`onValueChange`. Needs a client boundary; inside server components or long
mobile forms prefer NativeSelect.

## Example

```tsx
<Select value={plan} onValueChange={setPlan}>
  <SelectTrigger className="w-48">
    <SelectValue placeholder="Choose a plan" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="free">Free</SelectItem>
    <SelectItem value="pro">Pro</SelectItem>
  </SelectContent>
</Select>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Radix primitive.

- `size?: 'sm' | 'md'` — Height: `sm` (h-8) or `md` (h-9, default) — matches Input and NativeSelect.

## Parts

- `SelectGroup` — Groups SelectItems under a SelectLabel.
- `SelectValue` — Shows the selected item's text inside SelectTrigger, or `placeholder`.
- `SelectTrigger` — The button that opens the Select. `size`: `sm` | `md` (default). Sized to its content (`w-fit`); pass `className="w-full"` to fill the row.
- `SelectContent` — The options panel; renders its own portal and scroll buttons.
- `SelectItem` — One option; `value` must be a non-empty string.
- `SelectLabel` — Heading for a SelectGroup.
- `SelectSeparator` — Horizontal rule between groups.
