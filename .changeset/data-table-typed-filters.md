---
"turkishcoffee": minor
---

DataTable's column filters fit the column's values. Dates get a calendar picking one day or a range (`{ from, to }`, whole local days, both included), with month and year drop-downs and month and day names in `locale`. Numbers get Min and Max (`{ min, max }`, both included). Booleans get a checklist, named by `meta.filter.options` or Yes/No; the filter never borrows the export's or the cell's wording. Anything else keeps "contains". Set `meta.filter.variant` (`text`, `options`, `number`, `date`) when the values do not say it, such as dates kept as ISO strings, or `options` for a column of a few repeated values: on the client its checklist lists them with their counts. The default `filterFn` handles every shape; A kind seen once is kept, so an empty page or a page of blanks never turns a calendar back into a text field. On the server the app reads the values from the query's `columnFilters`.

The panels are also `TableColumnNumberFilter` and `TableColumnDateFilter` for a static Table. Every filter panel now grows to fit its content, so translated buttons no longer run past its edge. `Calendar` styles `captionLayout="dropdown"`. New DataTable labels: `filterMin`, `filterMax`, `filterPickDates`, `filterTrue`, `filterFalse`; on the column filters `min`, `max`, `pickDates`.
