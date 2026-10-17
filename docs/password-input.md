# PasswordInput

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { PasswordInput, type PasswordInputProps } from 'turkishcoffee'
```

A password field with a button that shows what was typed. The button is a
toggle (`aria-pressed`) with one name, so a screen reader hears "Show
password, pressed" rather than a label that flips under the cursor. Every
other prop goes to the `<input>`, so it works as a `FormControl` child and
with `autoComplete="current-password"` / `"new-password"`.

## Example

```tsx
<Label htmlFor="password">Password</Label>
<PasswordInput id="password" name="password" autoComplete="current-password" required />
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `showLabel?: string` — The reveal button's name. Defaults to "Show password" in the page's language (see LocaleProvider).
- `groupClassName?: string` — Classes on the bordered field around the input. `className` styles the input.

## Parts

- `type PasswordInputProps`
