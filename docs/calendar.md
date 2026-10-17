# Calendar

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { Calendar, type DateRange, type CalendarProps } from 'turkishcoffee'
```

react-day-picker styled with the theme tokens instead of its stylesheet, so it
follows `.dark`. Month and day names, the week's first day and the
screen-reader labels follow LocaleProvider (else `<html lang>`); pass a
`locale` from `react-day-picker/locale` to choose another. Without `mode` it is a read-only month: mark days with `modifiers` and
style them with `modifiersClassNames`.

## Example

```tsx
<Calendar mode="single" selected={day} onSelect={setDay} />

<Calendar modifiers={{ holiday: holidays }} modifiersClassNames={{ holiday: 'text-danger-text' }} />
```

## Parts

- `type DateRange`
- `type CalendarProps`
