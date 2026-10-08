# DatePicker

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { DatePicker, DateRangePicker, type DatePickerProps, type DateRangePickerProps } from 'turkishcoffee'
```

Controlled single-date picker. Works as a `FormControl` child.

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

### `ResponsivePickerProps`

- `title: string` — Accessible name for the drawer; the popover is labelled by its trigger.

### `DatePickerProps`

- `formatStr?: string` — date-fns format string for the trigger label.
- `locale?: Locale` — A date-fns locale (e.g. `tr` from `date-fns/locale`); also localizes the calendar.

## Parts

- `type DatePickerProps`
- `type DateRangePickerProps`
- `DateRangePicker` — Controlled date-range picker. Stays open until both ends are picked.
