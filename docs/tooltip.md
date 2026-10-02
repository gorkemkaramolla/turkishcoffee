# Tooltip

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { TooltipTrigger, Tooltip, TooltipContent } from 'turkishcoffee'
```

Short text hint shown on hover and keyboard focus. Self-providing: no need
to wrap your app in a TooltipProvider (there is none to import). Not shown on
touch devices — never put essential information in it.

## Example

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button size="icon" variant="ghost" aria-label="Copy"><CopyIcon /></Button>
  </TooltipTrigger>
  <TooltipContent>Copy to clipboard</TooltipContent>
</Tooltip>
```

## Parts

- `TooltipTrigger` — The element the Tooltip describes. Use `asChild` with a Button.
- `TooltipContent` — The hint bubble; renders its own portal and arrow.
