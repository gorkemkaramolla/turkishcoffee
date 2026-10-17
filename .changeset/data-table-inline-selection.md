---
"turkishcoffee": minor
---

DataTable's selection no longer moves the page. The count joins the controls row beside Export, tinted like the selected rows, with a clear button. It used to open a grey row of its own under the controls, carrying Export down with it and pushing the grid about 50px. Export and Columns are CommandButtons now: borderless, the icon in the brand colour, with a chevron that shows they open a menu.

Server tables keep a selection across pages and searches, and can export it. A row can only be ticked while it is loaded, so DataTable keeps the data of each selected row; an export of the selection writes rows from other pages and earlier searches without asking the backend. The count says how many selected rows are not on the page (new label `rowsOffPage`). New `selectable.scopeKey`: pass the filters that live outside the grid (a search box, status tabs) as one string, and an "every matching row" selection resets when they change, as it does with the grid's own filters. An export request carries it.
