# Checkbox

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Checkbox, type CheckboxProps } from 'turkishcoffee'
```

A checkbox. Controlled with `checked` + `onCheckedChange` (not `onChange`);
`checked` may also be `'indeterminate'`. Pair with a Label via `id`/`htmlFor`.
For an on/off setting that applies immediately, prefer Switch.

## Example

```tsx
<div className="flex items-center gap-2">
  <Checkbox id="terms" checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} />
  <Label htmlFor="terms">Accept terms</Label>
</div>
```

## Parts

- `type CheckboxProps`
