# DropdownMenu

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuSub, DropdownMenuRadioGroup, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSubTrigger, DropdownMenuSubContent } from 'turkishcoffee'
```

Menu of actions opened from a trigger. For choosing a form value use Select.

## Example

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Project</DropdownMenuLabel>
    <DropdownMenuItem onSelect={rename}>Rename</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive" onSelect={remove}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Radix primitive.

- `variant?: 'default' | 'destructive'` — `destructive` colours the item for dangerous actions like Delete.

## Parts

- `DropdownMenuTrigger` — Opens the menu. Use `asChild` to make your own Button the trigger.
- `DropdownMenuGroup` — Groups related items.
- `DropdownMenuSub` — Wraps a DropdownMenuSubTrigger and DropdownMenuSubContent for a nested menu.
- `DropdownMenuRadioGroup` — Holds DropdownMenuRadioItems; controlled with `value` + `onValueChange`.
- `DropdownMenuContent` — The menu panel; renders its own portal.
- `DropdownMenuItem` — One action. Use `onSelect` (not `onClick`) to run it. `variant="destructive"` colours it for dangerous actions.
- `DropdownMenuCheckboxItem` — A toggleable item; controlled with `checked` + `onCheckedChange`.
- `DropdownMenuRadioItem` — One option inside a DropdownMenuRadioGroup.
- `DropdownMenuLabel` — Non-interactive heading inside the menu.
- `DropdownMenuSeparator` — Horizontal rule between groups of items.
- `DropdownMenuShortcut` — Right-aligned keyboard hint inside an item, e.g. `⌘K`. Display only.
- `DropdownMenuSubTrigger` — Item that opens a nested DropdownMenuSubContent.
- `DropdownMenuSubContent` — The nested menu panel.
