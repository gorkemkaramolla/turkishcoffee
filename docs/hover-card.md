# HoverCard

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { HoverCard, HoverCardTrigger, HoverCardContent } from 'turkishcoffee'
```

Rich preview shown when a pointer hovers a link (e.g. a user profile).
Not reachable on touch devices — never put essential content or actions in it.
For a short text hint use Tooltip; for click-to-open content use Popover.

## Example

```tsx
<HoverCard>
  <HoverCardTrigger asChild><a href="/u/ada">@ada</a></HoverCardTrigger>
  <HoverCardContent>…</HoverCardContent>
</HoverCard>
```

## Parts

- `HoverCardTrigger` — The element that opens the HoverCard on hover. Use `asChild` with a link.
- `HoverCardContent` — The card panel; renders its own portal.
