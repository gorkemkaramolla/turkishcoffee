---
"turkishcoffee": patch
---

On a DataTable whose columns can be dragged (`reorderable`), a click on a header's label no longer sorts: the label is what you grab to move the column, and the grab cursor said so while a click sorted anyway. The arrow after the label sorts, with a hover target of its own, and on touch screens it stays faintly visible. Enter or Space on a header and a screen reader's press still sort. Columns that can't be moved sort from the whole label, as before.
