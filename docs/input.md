# Input

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { Input, type InputProps } from 'turkishcoffee'
```

Single-line text field; a styled `<input>` that forwards every prop.
Server-renderable; handlers like onChange come from your own client component.
For an icon, prefix or inline button inside the field use InputGroup.

## Example

```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" placeholder="you@example.com" />
```

## Parts

- `type InputProps`
