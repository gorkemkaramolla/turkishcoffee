# DropdownMenu

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuSub, DropdownMenuRadioGroup, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSubTrigger, DropdownMenuSubContent, type DropdownMenuContentProps } from 'turkishcoffee'
```

Menu of actions opened from a trigger. Built on Base UI's Menu. For choosing a
form value use Select.

## Example

```tsx
<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="outline" />}>Options</DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Project</DropdownMenuLabel>
    <DropdownMenuItem onClick={rename}>Rename</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive" onClick={remove}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `variant?: 'default' | 'destructive'` — `destructive` colours the item for dangerous actions like Delete.

## Parts

- `DropdownMenuTrigger` — Opens the menu. Pass `render={<Button />}` to make your own Button the trigger.
- `DropdownMenuGroup` — Groups related items.
- `DropdownMenuSub` — Wraps a DropdownMenuSubTrigger and DropdownMenuSubContent for a nested menu.
- `DropdownMenuRadioGroup` — Holds DropdownMenuRadioItems; controlled with `value` + `onValueChange`.
- `type DropdownMenuContentProps`
- `DropdownMenuContent` — The menu panel; renders its own portal.
- `DropdownMenuItem` — One action. Run it with `onClick`; the menu closes afterwards. `variant="destructive"` colours it for dangerous actions.
- `DropdownMenuCheckboxItem` — A toggleable item; controlled with `checked` + `onCheckedChange`.
- `DropdownMenuRadioItem` — One option inside a DropdownMenuRadioGroup.
- `DropdownMenuLabel` — Non-interactive heading inside the menu. A plain element, so it works anywhere in the menu, inside a DropdownMenuGroup or not.
- `DropdownMenuSeparator` — Horizontal rule between groups of items.
- `DropdownMenuShortcut` — Right-aligned keyboard hint inside an item, e.g. `⌘K`. Display only.
- `DropdownMenuSubTrigger` — Item that opens a nested DropdownMenuSubContent.
- `DropdownMenuSubContent` — The nested menu panel; opens beside its DropdownMenuSubTrigger.
