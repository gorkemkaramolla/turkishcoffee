# Switch

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Switch, type SwitchProps } from 'turkishcoffee'
```

On/off toggle for a setting that takes effect immediately. Controlled with
`checked` + `onCheckedChange` (not `onChange`). For a choice submitted later
with a form, prefer Checkbox.

## Example

```tsx
<div className="flex items-center gap-2">
  <Switch id="notifications" checked={on} onCheckedChange={setOn} />
  <Label htmlFor="notifications">Email notifications</Label>
</div>
```

## Parts

- `type SwitchProps`
