---
"turkishcoffee": patch
---

Quieter table lines. Body rows in Table and DataTable are now separated by `--table-row-divider`, a fainter hairline than `--border`. The header line and the table frame keep `--border`. DataTable's column resize lines are hidden until the pointer is over the header row, and the handle under the pointer, in focus or being dragged still shows the primary line. On a touch screen, which has no hover, the lines stay visible. `TableCheckbox` takes clicks up to 8px around its 16px box, a 32px target.
