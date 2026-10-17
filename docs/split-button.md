# SplitButton

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { SplitButton, SplitButtonAction, SplitButtonMenu } from 'turkishcoffee'
```

A button with a main action and a menu of related ones: the left half runs
the action, the chevron on the right opens the menu, which opens under the
whole button from its left edge. Two separate buttons, so
each is a tab stop with its own name. `variant` and `size` apply to both halves.

## Example

```tsx
<SplitButton>
  <SplitButtonAction onClick={save}>Save</SplitButtonAction>
  <SplitButtonMenu label="More save options">
    <DropdownMenuItem onClick={saveAsDraft}>Save as draft</DropdownMenuItem>
    <DropdownMenuItem onClick={saveAndClose}>Save and close</DropdownMenuItem>
  </SplitButtonMenu>
</SplitButton>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `root: React.RefObject<HTMLDivElement | null> | null` — The whole split button, which the menu lines up with.

### `SplitButton`

- `variant?: Variant` — `primary` (default) or `secondary`, for both halves.
- `size?: Size` — `sm` · `md` · `lg`, for both halves.

### `SplitButtonMenu`

- `label: string` — Accessible name of the chevron button.
- `align?: 'start' | 'center' | 'end'` — Where the menu lines up under the whole split button; its left edge by default.
- `children: React.ReactNode` — The menu's items.

## Parts

- `SplitButtonAction` — The main action, on the left. Disable it alone to leave the menu usable.
- `SplitButtonMenu` — The chevron on the right and the menu it opens; put DropdownMenuItems inside. `label` names the chevron for screen readers ("More save options").
