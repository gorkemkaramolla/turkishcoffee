---
'turkishcoffee': major
---

Add `Calendar`, `DatePicker` and `DateRangePicker` (built on react-day-picker, styled with theme tokens, localizable via date-fns locales), and a standalone vaul-based `Drawer`.

`Dialog` is now responsive: it stays a centered modal on `sm` screens and up and becomes a vaul bottom drawer (swipe to dismiss, no X button) below 640px. The API is unchanged. It renders as a drawer during SSR and switches after hydration, and a dialog that is open while the viewport crosses the breakpoint remounts. The date pickers follow the same rule: a popover on desktop, a drawer on mobile.
