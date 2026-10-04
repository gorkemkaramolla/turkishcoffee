# Popover

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Popover, PopoverTrigger, PopoverContent, type PopoverContentProps } from 'turkishcoffee'
```

Floating panel opened by clicking a trigger; for small forms, pickers and
extra details. Non-modal. For a hover hint use Tooltip; for a list of actions
use DropdownMenu.

## Example

```tsx
<Popover>
  <PopoverTrigger render={<Button variant="outline" />}>Filters</PopoverTrigger>
  <PopoverContent align="start">…</PopoverContent>
</Popover>
```

## Parts

- `PopoverTrigger` — Opens the Popover. Pass `render={<Button />}` to make your own Button the trigger.
- `type PopoverContentProps`
- `PopoverContent` — The panel; renders its own portal. `w-72` by default. Pass `anchor` (an element or ref) to position it against something other than the trigger.
