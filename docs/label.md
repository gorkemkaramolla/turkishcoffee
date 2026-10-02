# Label

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Label, type LabelProps } from 'turkishcoffee'
```

Accessible label for a form control; link it with `htmlFor`. Inside a
`turkishcoffee/form` field use FormLabel instead, which wires `htmlFor` for you.

## Parts

- `type LabelProps`
