# AspectRatio

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { AspectRatio, type AspectRatioProps } from 'turkishcoffee'
```

Constrains its child (usually an image or video) to `ratio` (width / height)
with the CSS `aspect-ratio` property. Server-renderable.

## Example

```tsx
<AspectRatio ratio={16 / 9}>
  <img src={src} alt="" className="size-full rounded-md object-cover" />
</AspectRatio>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `ratio?: number` — Width divided by height, e.g. `16 / 9`. Defaults to 1 (square).

## Parts

- `type AspectRatioProps`
