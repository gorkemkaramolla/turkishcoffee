# Switch

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { Switch, type SwitchProps } from 'turkishcoffee'
```

On/off toggle for a setting that takes effect immediately. Controlled with
`checked` + `onCheckedChange` (not `onChange`). Renders a native `<button>`,
so pair it with a Label via `id`/`htmlFor`. For a choice submitted later with a
form, prefer Checkbox.

## Example

```tsx
<div className="flex items-center gap-2">
  <Switch id="notifications" checked={on} onCheckedChange={setOn} />
  <Label htmlFor="notifications">Email notifications</Label>
</div>
```

## Parts

- `type SwitchProps`
