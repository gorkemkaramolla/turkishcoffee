# Collapsible

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

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
