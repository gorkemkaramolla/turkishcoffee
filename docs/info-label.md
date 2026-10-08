# InfoLabel

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { InfoLabel, type InfoLabelProps } from 'turkishcoffee'
```

A Label with an info button beside it that opens a short explanation. The
explanation opens on click, tap and Enter, so unlike a Tooltip it reaches
touch and keyboard users and may hold a link. While it is open the button's
icon fills in primary.
Every prop except `info` and `infoLabel` goes to the Label. Inside a
`turkishcoffee/form` field pass `info` to FormLabel instead.

## Example

```tsx
<InfoLabel htmlFor="iban" info="Salaries are paid into this account.">IBAN</InfoLabel>
<Input id="iban" />
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `info: React.ReactNode` — The explanation behind the info button: what the field is for, its format, where the value goes.
- `infoLabel?: string` — The info button's accessible name; screen readers read it before the label text.

## Parts

- `type InfoLabelProps`
