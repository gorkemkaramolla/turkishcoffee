# RadioGroup

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { RadioGroup, RadioGroupItem } from 'turkishcoffee'
```

One choice out of a few visible options. Controlled with `value` +
`onValueChange`. For many options use Select or NativeSelect.

## Example

```tsx
<RadioGroup defaultValue="monthly">
  <div className="flex items-center gap-2">
    <RadioGroupItem value="monthly" id="monthly" />
    <Label htmlFor="monthly">Monthly</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="yearly" id="yearly" />
    <Label htmlFor="yearly">Yearly</Label>
  </div>
</RadioGroup>
```

## Parts

- `RadioGroupItem` — One option; needs a unique `value`. Pair with a Label via `id`/`htmlFor`.
