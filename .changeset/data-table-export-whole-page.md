---
"turkishcoffee": patch
---

In server mode, a page that already holds every matching row (`server.rowCount`) exports itself. `getExportData()` returns no `request` for it, so the export no longer calls `fetchRows` or `onServerExport`. Without them, the menu no longer calls the export "loaded rows only", and `ref.export()` no longer throws.
