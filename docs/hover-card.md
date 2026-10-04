# HoverCard

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { HoverCard, HoverCardTrigger, HoverCardContent, type HoverCardContentProps } from 'turkishcoffee'
```

Rich preview shown when a pointer hovers a link (e.g. a user profile).
Built on Base UI's PreviewCard. Not reachable on touch devices — never put
essential content or actions in it. For a short text hint use Tooltip; for
click-to-open content use Popover.

## Example

```tsx
<HoverCard>
  <HoverCardTrigger href="/u/ada">@ada</HoverCardTrigger>
  <HoverCardContent>…</HoverCardContent>
</HoverCard>
```

## Parts

- `HoverCardTrigger` — The link that opens the HoverCard on hover; renders an `<a>`, so give it `href`. Pass `render={<Link />}` for your router's link. `delay` and `closeDelay` (ms) live here.
- `type HoverCardContentProps`
- `HoverCardContent` — The card panel; renders its own portal.
