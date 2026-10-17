---
"turkishcoffee": patch
---

Fix DataTable's active cell sliding out of view after a long keyboard jump (Ctrl+End, PageDown). The rows reached by the jump render a frame or more after the scroll, and autofit then widens the columns to fit them, which pushed the cell past the edge after the grid had stopped revealing it. The grid now keeps the active cell in view until the layout settles, and stops as soon as you scroll by hand.
