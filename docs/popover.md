# Popover

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Popover, PopoverTrigger, PopoverAnchor, PopoverContent } from 'turkishcoffee'
```

Floating panel opened by clicking a trigger; for small forms, pickers and
extra details. Non-modal. For a hover hint use Tooltip; for a list of actions
use DropdownMenu.

## Example

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Filters</Button>
  </PopoverTrigger>
  <PopoverContent align="start">…</PopoverContent>
</Popover>
```

## Parts

- `PopoverTrigger` — Opens the Popover. Use `asChild` to make your own Button the trigger.
- `PopoverAnchor` — Positions the Popover against an element other than the trigger.
- `PopoverContent` — The panel; renders its own portal. `w-72` by default.
