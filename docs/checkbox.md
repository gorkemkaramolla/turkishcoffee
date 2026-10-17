# Checkbox

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { Checkbox, type CheckboxProps } from 'turkishcoffee'
```

A checkbox. Controlled with `checked` + `onCheckedChange` (not `onChange`);
the handler gets `(checked: boolean, eventDetails)`. Pass `indeterminate` for a
mixed state. Renders a native `<button>`, so pair it with a Label via
`id`/`htmlFor`. For an on/off setting that applies immediately, prefer Switch.

## Example

```tsx
<div className="flex items-center gap-2">
  <Checkbox id="terms" checked={accepted} onCheckedChange={setAccepted} />
  <Label htmlFor="terms">Accept terms</Label>
</div>
```

## Parts

- `type CheckboxProps`
