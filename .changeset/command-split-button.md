---
"turkishcoffee": minor
---

CommandButton and SplitButton. CommandButton is a borderless toolbar command with a brand-coloured icon; as a DropdownMenuTrigger it adds a chevron and stays filled while the menu is open. SplitButton pairs a main action with a chevron that opens a menu of related actions, as two buttons with their own names; `variant` and `size` apply to both halves, and the action can be disabled alone.

The split button's menu opens under the whole button from its left edge, so the menu lines up with the whole control. For that, DropdownMenuContent takes `anchor` (an element or ref) to position against something other than its trigger, like PopoverContent.
