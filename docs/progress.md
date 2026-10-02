# Progress

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Progress, type ProgressProps } from 'turkishcoffee'
```

Horizontal bar for a known completion percentage (`value`, 0–100). For
unknown durations use Spinner or Skeleton.

## Example

```tsx
<Progress value={uploadPercent} aria-label="Upload progress" />
```

## Parts

- `type ProgressProps`
