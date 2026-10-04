# Calendar

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Calendar, type DateRange, type CalendarProps } from 'turkishcoffee'
```

react-day-picker styled with the theme tokens instead of its stylesheet, so it
follows `.dark`. Pass a locale from `react-day-picker/locale` (e.g. `tr`).

## Parts

- `type DateRange`
- `type CalendarProps`
