# Dialog

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Dialog, DialogTrigger, DialogClose, DialogPortal, DialogOverlay, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from 'turkishcoffee'
```

Modal for a focused task (a form, details): centered on `sm` screens and up,
a vaul bottom drawer below. Every part reads the mode from here, so the same
markup works in both. Closes on outside click and Escape (and a swipe down on
mobile). For confirming a destructive action use AlertDialog; for a panel
sliding from an edge use Sheet. DialogTitle is required for accessibility.

## Example

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Edit profile</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>Changes are saved when you click Save.</DialogDescription>
    </DialogHeader>
    …
    <DialogFooter>
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <Button type="submit">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Radix primitive.

- `showCloseButton?: boolean` — Render the × button in the top-right corner (desktop only). Defaults to true.

## Parts

- `DialogTrigger` — Opens the Dialog. Use `asChild` to make your own Button the trigger.
- `DialogClose` — Closes the Dialog. Use `asChild` to make your own Button close it.
- `DialogPortal` — Portal used by DialogContent. Rarely needed directly.
- `DialogOverlay` — Backdrop behind the Dialog. Already rendered by DialogContent.
- `DialogContent` — The dialog panel. Renders its own portal, overlay and a close (×) button (a bottom drawer without the × on mobile); pass `showCloseButton={false}` to drop the ×. Widen with `className="sm:max-w-2xl"`.
- `DialogHeader` — Stacks DialogTitle and DialogDescription.
- `DialogFooter` — Action row; stacks on mobile, right-aligns from `sm`.
- `DialogTitle` — Required: names the dialog for screen readers.
- `DialogDescription` — Muted text under DialogTitle.
