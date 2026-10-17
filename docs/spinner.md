# Spinner

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { Spinner, type SpinnerProps } from 'turkishcoffee'
```

Indeterminate loading indicator; `size-4`, inherits text colour. Drawn
inline rather than pulled from an icon set, so the package still pins no icon
library on consumers. A client component: its default name follows the
page's language, which an `aria-label` can only read on the client.

## Example

```tsx
<Button disabled>
  <Spinner label={null} /> Saving…
</Button>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `label?: string | null` — Announced to screen readers; pass null to keep the spinner silent. Defaults to "Loading" in the page's language (see LocaleProvider).

## Parts

- `type SpinnerProps`
