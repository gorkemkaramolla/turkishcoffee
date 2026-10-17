# SearchField

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { SearchField, type SearchFieldProps } from 'turkishcoffee'
```

A reusable search field with a label, debounce, clear button and loading
indicator. Enter bypasses the debounce. External value changes (e.g. browser
back) replace the draft; acknowledgements of submitted searches preserve
newer typing. Routing and fetching belong to the consuming application.
Renders a search form: place it outside other forms. In a toolbar, pass
`hideLabel` and match the height of the controls beside it: `size="sm"`
among 32px CommandButtons, the default `md` in DataTable's toolbar, whose
Columns and Export buttons are 36px.

## Example

```tsx
<SearchField value={search} onSearch={setSearch} placeholder="Name, email…" />

<SearchField value={search} onSearch={setSearch} hideLabel size="sm" label="Search people" />
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `value: string` — Applied search value, e.g. from a URL. Draft text stays local until submitted.
- `onSearch: (value: string) => void` — Receives trimmed text after a pause, or immediately on Enter and clear.
- `debounceMs?: number` — Typing pause in milliseconds. Defaults to 300; 0 searches immediately.
- `loading?: boolean` — Shows a spinner while results are loading; typing remains available.
- `label?: React.ReactNode` — Input label. Defaults to "Search" in the page's language (see LocaleProvider).
- `hideLabel?: boolean` — Keeps the label for screen readers but hides it, for toolbars and top bars where the search icon and placeholder already say what the field is.
- `size?: 'sm' | 'md'` — Height, to match the controls beside it: `sm` (32px) among CommandButtons and other 32px controls, `md` (36px, default) beside Buttons, as in DataTable's toolbar.
- `clearLabel?: string` — Clear button text. Defaults to "Clear" in the page's language.
- `loadingLabel?: string` — Accessible spinner label. Defaults to "Searching" in the page's language.
- `className?: string` — Classes on the search form; defaults to w-72.

## Parts

- `type SearchFieldProps`
