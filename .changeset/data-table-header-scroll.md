---
"turkishcoffee": patch
---

Fix DataTable's header shaking while the table scrolls sideways. The header strip was mirrored from the body's scroll event, which arrives a frame after the browser has already moved the body. Where scroll-driven animations exist (Chrome, Edge, Safari) the browser now moves the header in the same frame as the body; Firefox keeps the event mirror. Also fixes virtualized rows in `dir="rtl"`, which sat in the unscrollable overflow on the right, so the body could not scroll sideways and the cells did not line up with the header.
