# Textarea

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { Textarea, type TextareaProps } from 'turkishcoffee'
```

Multi-line text field; grows with its content (`field-sizing-content`) from a
minimum of `min-h-16`. Server-renderable.

## Example

```tsx
<Textarea placeholder="Leave a comment" rows={4} />
```

## Parts

- `type TextareaProps`
