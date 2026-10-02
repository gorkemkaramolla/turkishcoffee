# InputGroup

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { InputGroup, inputGroupAddonVariants, InputGroupAddon, InputGroupInput, InputGroupTextarea, InputGroupButton, type InputGroupAddonProps } from 'turkishcoffee'
```

A field that combines a control with icons, text or buttons. The group owns
the border and the focus ring; the control inside is stripped of both. That way
an icon, a prefix and a button read as one field instead of a row of separately
outlined boxes. Use InputGroupInput / InputGroupTextarea inside, not Input.

## Example

```tsx
<InputGroup>
  <InputGroupAddon><SearchIcon /></InputGroupAddon>
  <InputGroupInput placeholder="Search…" />
  <InputGroupAddon align="end">
    <InputGroupButton>Go</InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

## Variants

| Prop | Options | Default |
|---|---|---|
| `align` | `start` · `end` | `start` |

## Parts

- `inputGroupAddonVariants` — InputGroupAddon classes as a function.
- `type InputGroupAddonProps`
- `InputGroupAddon` — Icon, text or button beside the control. `align`: `start` (default) | `end`.
- `InputGroupInput` — The `<input>` inside an InputGroup (unbordered).
- `InputGroupTextarea` — The `<textarea>` inside an InputGroup (unbordered).
- `InputGroupButton` — A Button sized for the inside of an InputGroup: defaults to `variant="ghost"` and `size="sm"`, without a shadow, so it sits inside the field rather than next to it.
