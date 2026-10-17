---
"turkishcoffee": patch
---

The columns `getExportData()` returns now read any row, not only the rows DataTable holds. A server export can fetch the rows its `request` covers and write them with those columns — what `exportable.fetchRows` does for the menu. Before, every column without `meta.exportValue` came out empty for such rows.
