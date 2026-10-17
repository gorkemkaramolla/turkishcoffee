---
"turkishcoffee": patch
---

A `size="sm"` DataTable no longer grows scrollbars when a cell is taller than its 32px row, such as a row-actions button at the default 36px. The body scrolls only sideways now: before, the overflowing cell opened a vertical scrollbar, and the room it took pushed the columns into a horizontal one too. Button gains `size="icon-sm"`, a 32px square, so an icon button fits an sm row exactly.
