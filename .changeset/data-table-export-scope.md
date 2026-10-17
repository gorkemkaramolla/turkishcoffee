---
"turkishcoffee": minor
---

DataTable's export menu names the rows it will write: "2 selected rows", "20 rows on this page", "120 rows". `getExportData()` returns the resolved `scope` (`selected`, `page`, `filtered` or `loaded`; DataTable picks one when `rows` is `auto`), and the `exportScope` and `exportLoadedOnly` labels receive it as a third argument. Labels written for two arguments keep working.
