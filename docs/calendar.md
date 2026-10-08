# Calendar

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { Calendar, type DateRange, type CalendarProps } from 'turkishcoffee'
```

react-day-picker styled with the theme tokens instead of its stylesheet, so it
follows `.dark`. Pass a locale from `react-day-picker/locale` (e.g. `tr`).

## Parts

- `type DateRange`
- `type CalendarProps`
