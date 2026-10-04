# Label

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { Label, type LabelProps } from 'turkishcoffee'
```

Accessible label for a form control; link it with `htmlFor`. Inside a
`turkishcoffee/form` field use FormLabel instead, which wires `htmlFor` for you.
A native `<label>`, so it is server-renderable.

## Parts

- `type LabelProps`
