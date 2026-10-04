# Drawer

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Drawer, DrawerTrigger, DrawerClose, DrawerPortal, DrawerOverlay, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from 'turkishcoffee'
```

Bottom sheet built on Base UI's Drawer: slides up from the bottom edge and
closes on a swipe down, outside tap or Escape. Dialog already becomes one on
mobile, so reach for Drawer directly only when you want a drawer on every
screen size. DrawerTitle is required for accessibility.

## Example

```tsx
<Drawer>
  <DrawerTrigger render={<Button />}>Filters</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Filters</DrawerTitle>
      <DrawerDescription>Narrow the list.</DrawerDescription>
    </DrawerHeader>
    …
    <DrawerFooter>
      <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

## Parts

- `DrawerTrigger` — Opens the Drawer. Pass `render={<Button />}` to make your own Button the trigger.
- `DrawerClose` — Closes the Drawer. Pass `render={<Button />}` to make your own Button close it.
- `DrawerPortal` — Portal used by DrawerContent. Rarely needed directly.
- `DrawerOverlay` — Backdrop behind the Drawer; fades with the swipe. Already rendered by DrawerContent.
- `DrawerContent` — Bottom sheet with a drag handle. Base UI drives the enter, exit and swipe motion.
- `DrawerHeader` — Stacks DrawerTitle and DrawerDescription.
- `DrawerFooter` — Action row pinned to the bottom of the Drawer.
- `DrawerTitle` — Required: names the drawer for screen readers.
- `DrawerDescription` — Muted text under DrawerTitle.
