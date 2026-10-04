# EmptyState

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { EmptyState, type EmptyStateProps } from 'turkishcoffee'
```

Placeholder for a list or page that has no content yet: icon, title,
description and a call to action.

## Example

```tsx
<EmptyState
  icon={<InboxIcon />}
  title="No invoices yet"
  description="Invoices you create will show up here."
  action={<Button>New invoice</Button>}
/>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `icon?: React.ReactNode` — Pass any icon element — the package pins no icon library.
- `title: React.ReactNode` — Required: one short line saying what is missing.
- `description?: React.ReactNode` — Muted text under the title: why it is empty or what to do next.
- `action?: React.ReactNode` — Buttons or links rendered under the description.

## Parts

- `type EmptyStateProps`
