# DropdownMenu

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuSub, DropdownMenuRadioGroup, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSubTrigger, DropdownMenuSubContent, type DropdownMenuContentProps } from 'turkishcoffee'
```

Menu of actions opened from a trigger. Built on Base UI's Menu. For choosing a
form value use Select.

## Example

```tsx
<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="secondary" />}>Options</DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Project</DropdownMenuLabel>
    <DropdownMenuItem onClick={rename}>Rename</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem tone="danger" onClick={remove}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `tone?: 'neutral' | 'danger'` — `danger` colours the item for dangerous actions like Delete.

## Parts

- `DropdownMenuTrigger` — Opens the menu. Pass `render={<Button />}` to make your own Button the trigger.
- `DropdownMenuGroup` — Groups related items.
- `DropdownMenuSub` — Wraps a DropdownMenuSubTrigger and DropdownMenuSubContent for a nested menu.
- `DropdownMenuRadioGroup` — Holds DropdownMenuRadioItems; controlled with `value` + `onValueChange`.
- `type DropdownMenuContentProps`
- `DropdownMenuContent` — The menu panel; renders its own portal. Pass `anchor` (an element or ref) to position it against something other than the trigger.
- `DropdownMenuItem` — One action. Run it with `onClick`; the menu closes afterwards. `tone="danger"` colours it for dangerous actions.
- `DropdownMenuCheckboxItem` — A toggleable item; controlled with `checked` + `onCheckedChange`.
- `DropdownMenuRadioItem` — One option inside a DropdownMenuRadioGroup.
- `DropdownMenuLabel` — Non-interactive heading inside the menu. A plain element, so it works anywhere in the menu, inside a DropdownMenuGroup or not.
- `DropdownMenuSeparator` — Horizontal rule between groups of items.
- `DropdownMenuShortcut` — Right-aligned keyboard hint inside an item, e.g. `⌘K`. Display only.
- `DropdownMenuSubTrigger` — Item that opens a nested DropdownMenuSubContent.
- `DropdownMenuSubContent` — The nested menu panel; opens beside its DropdownMenuSubTrigger.
