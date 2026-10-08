# SearchField

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { SearchField, type SearchFieldProps } from 'turkishcoffee'
```

A reusable search field with a label, debounce, clear button and loading
indicator. Enter bypasses the debounce. External value changes (e.g. browser
back) replace the draft; acknowledgements of submitted searches preserve
newer typing. Routing and fetching belong to the consuming application.
Renders a search form: place it outside other forms.

## Example

```tsx
<SearchField value={search} onSearch={setSearch} placeholder="Name, email…" />
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `value: string` — Applied search value, e.g. from a URL. Draft text stays local until submitted.
- `onSearch: (value: string) => void` — Receives trimmed text after a pause, or immediately on Enter and clear.
- `debounceMs?: number` — Typing pause in milliseconds. Defaults to 300; 0 searches immediately.
- `loading?: boolean` — Shows a spinner while results are loading; typing remains available.
- `label?: React.ReactNode` — Visible input label. Defaults to "Search".
- `clearLabel?: string` — Clear button text. Defaults to "Clear".
- `loadingLabel?: string` — Accessible spinner label. Defaults to "Searching".
- `className?: string` — Classes on the search form; defaults to w-72.

## Parts

- `type SearchFieldProps`
