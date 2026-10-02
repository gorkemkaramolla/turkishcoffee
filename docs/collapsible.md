# Collapsible

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from 'turkishcoffee'
```

A single region the user can show and hide. For several related sections
use Accordion.

## Example

```tsx
<Collapsible>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" size="sm">Show details</Button>
  </CollapsibleTrigger>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>
```

## Parts

- `CollapsibleTrigger` — Toggles the Collapsible. Unstyled — use `asChild` with a Button.
- `CollapsibleContent` — The region that shows and hides, with a height animation.
