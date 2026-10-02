# AspectRatio

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { AspectRatio, type AspectRatioProps } from 'turkishcoffee'
```

Constrains its child (usually an image or video) to `ratio` (width / height).
Server-safe: the primitive only computes padding, it holds no state.

## Example

```tsx
<AspectRatio ratio={16 / 9}>
  <img src={src} alt="" className="size-full rounded-md object-cover" />
</AspectRatio>
```

## Parts

- `type AspectRatioProps`
