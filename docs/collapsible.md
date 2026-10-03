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
  <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}>
    Show details
  </CollapsibleTrigger>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>
```

## Parts

- `CollapsibleTrigger` — Toggles the Collapsible. Unstyled — pass `render={<Button />}` to style it.
- `CollapsibleContent` — The region that shows and hides, with a height animation.
