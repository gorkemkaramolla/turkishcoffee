# Sheet

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, type SheetContentProps } from 'turkishcoffee'
```

Modal panel that slides in from an edge — navigation drawers, filters,
detail views. For a centered modal use Dialog. SheetTitle is required for
accessibility.

## Example

```tsx
<Sheet>
  <SheetTrigger render={<Button variant="secondary" />}>Filters</SheetTrigger>
  <SheetContent side="left">
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
      <SheetDescription>Narrow down the results.</SheetDescription>
    </SheetHeader>
    …
    <SheetFooter>
      <SheetClose render={<Button />}>Apply</SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

## Variants

| Prop | Options | Default |
|---|---|---|
| `side` | `top` · `bottom` · `left` · `right` | `right` |

## Parts

- `SheetTrigger` — Opens the Sheet. Pass `render={<Button />}` to make your own Button the trigger.
- `SheetClose` — Closes the Sheet. Pass `render={<Button />}` to make your own Button close it.
- `type SheetContentProps`
- `SheetContent` — The panel. `side`: `top` | `right` (default) | `bottom` | `left`. Renders its own portal, overlay and close (×) button.
- `SheetHeader` — Stacks SheetTitle and SheetDescription.
- `SheetFooter` — Action area pinned to the bottom of the panel.
- `SheetTitle` — Required: names the sheet for screen readers.
- `SheetDescription` — Muted text under SheetTitle.
