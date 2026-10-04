# Tooltip

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { TooltipTrigger, Tooltip, TooltipContent, type TooltipContentProps } from 'turkishcoffee'
```

Short text hint shown on hover and keyboard focus. Self-providing: no need
to wrap your app in a TooltipProvider (there is none to import). `delay` is
the hover delay in ms (200 by default). Not shown on touch devices — never put
essential information in it.

## Example

```tsx
<Tooltip>
  <TooltipTrigger render={<Button size="icon" variant="ghost" aria-label="Copy" />}>
    <CopyIcon />
  </TooltipTrigger>
  <TooltipContent>Copy to clipboard</TooltipContent>
</Tooltip>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `delay?: number` — Hover delay before the tooltip opens, in ms.

## Parts

- `TooltipTrigger` — The element the Tooltip describes. Pass `render={<Button />}` to use a Button.
- `type TooltipContentProps`
- `TooltipContent` — The hint bubble; renders its own portal and arrow.
