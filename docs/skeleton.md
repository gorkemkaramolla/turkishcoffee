# Skeleton

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { Skeleton } from 'turkishcoffee'
```

Placeholder in the shape of content that is still loading. Give it the size
of the real content with `className`. A brand-blue glint crosses every
skeleton on the page at once, corner to corner and back, so a loading page
reads as one surface; with reduced motion it is a still fill.

## Example

```tsx
<div className="flex items-center gap-3">
  <Skeleton className="size-10 rounded-full" />
  <Skeleton className="h-4 w-40" />
</div>
```
