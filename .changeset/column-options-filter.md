---
"turkishcoffee": minor
---

A column of known values (a status, a type, a department) filters from a checklist. Give it `meta.filter.options`, each option a `value`, a `label` and optionally a `count` (on the client, options without one are counted), and its header funnel opens one checkbox per option, with the count beside it, instead of a "contains" field. Tick the values to show; with none ticked nothing is filtered, so there is no "Select all" to keep in step. From six options a search field above the list narrows it, and ArrowDown moves from it into the list. The filter value is the array of ticked values: on the client a row passes when its cell holds one of them; on the server the app reads it from the query's `columnFilters`.

The checklist is also `TableColumnOptionsFilter`, for a static Table, beside `TableColumnFilter`. New labels: `filterSearchOptions`, `filterNoOptions` on DataTable; `searchOptions`, `noOptions` on the column filters.
