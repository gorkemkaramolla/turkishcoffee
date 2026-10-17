# Progress

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { Progress, type ProgressProps } from 'turkishcoffee'
```

Horizontal bar for a known completion percentage (`value`, 0–100). For
unknown durations use Spinner or Skeleton.

## Example

```tsx
<Progress value={uploadPercent} aria-label="Upload progress" />
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `value?: number | null` — 0–100 by default. Leave out, or pass `null`, for an indeterminate bar.

## Parts

- `type ProgressProps`
