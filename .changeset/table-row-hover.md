---
"turkishcoffee": minor
---

Clearer hierarchy on tables, mostly in dark.

- Table and DataTable headers sit on their own faint surface (`--table-header`) and their labels drop to medium `--muted-foreground`, so the data reads first and the labels second.
- A hovered row is a lighter wash (`--table-row-hover`) than a selected one; in dark the two were 1.06:1 apart.
- Dark: row hairlines are fainter, the Sidebar sits closer to the page, and `--muted-foreground` steps down to `#a8a29b` (still 4.5:1 on every surface).
- Badge text is semibold, so small status badges stay legible.
- Dark: `--primary-text` is a softer `#74a8dc`, closer to the `--primary` fill; `--success` and `--success-text` brighten to `#6cc584` (6.6:1 on `--success-soft`). Light `--success-text` darkens to `#0e632f` (6.8:1 on `--success-soft`).
