---
"turkishcoffee": minor
---

DataTable loading its first page draws placeholder rows under its real headers, one Skeleton bar per column at the columns' own widths, instead of a "Loading…" line in an empty frame. The rows share Skeleton's glint and are not grid rows; a screen reader still hears the loading label. `loadingMessage` still replaces them with the app's own content.

New `DataTableSkeleton`, from `turkishcoffee/data-table`: the same frame, header and rows, for where DataTable can't render yet, such as a Suspense fallback around a server fetch. Pass the real headers (`columns={['Name', 'Email']}`) or a column count, and `selectable` and `size` as the table will have them, so nothing jumps when it arrives.
