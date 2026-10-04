# Select

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem, SelectLabel, SelectSeparator, type SelectContentProps } from 'turkishcoffee'
```

Custom-styled dropdown for picking one value. Controlled with `value` +
`onValueChange(value, eventDetails)`. Pass `items` (a `{ value: label }` map or
`{ value, label }[]`) so SelectValue shows the chosen item's label; without it
SelectValue shows the raw value. Needs a client boundary; inside server
components or long mobile forms prefer NativeSelect.

## Example

```tsx
const plans = { free: 'Free', pro: 'Pro' }

<Select items={plans} value={plan} onValueChange={setPlan}>
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

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `size?: 'sm' | 'md'` — Height: `sm` (28px) or `md` (32px, default) — matches Button, Input and NativeSelect.

## Parts

- `SelectGroup` — Groups SelectItems under a SelectLabel.
- `SelectValue` — Shows the selected item's label inside SelectTrigger (needs `items` on Select), or `placeholder`.
- `SelectTrigger` — The button that opens the Select. `size`: `sm` | `md` (default). Sized to its content (`w-fit`); pass `className="w-full"` to fill the row.
- `type SelectContentProps`
- `SelectContent` — The options panel; renders its own portal and scroll arrows. Opens below the trigger like a dropdown; pass `alignItemWithTrigger` for the macOS-style menu that overlaps the trigger with the selected item.
- `SelectItem` — One option. `value` may be any value, not only a string.
- `SelectLabel` — Heading for a SelectGroup.
- `SelectSeparator` — Horizontal rule between groups.
