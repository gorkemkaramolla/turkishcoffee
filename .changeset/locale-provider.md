---
"turkishcoffee": minor
---

Components speak the page's language. Every word a component renders itself (DataTable, TablePagination, the column filters, FileUpload, FormTabs, SearchField, Combobox, DatePicker and Calendar, Dialog and Sheet close buttons, Pagination, Spinner, InfoLabel, Sidebar, DataTableSkeleton) ships in English and Turkish, with the locale's numerals and dates.

The language comes from, in order: the component's own `locale` (and single words from `labels`), the new `LocaleProvider`, the page's `<html lang>`, and English. `<html lang>` is read after hydration, so a server-rendered page wraps its root in `<LocaleProvider locale="tr-TR">` to render in Turkish from the first byte. A locale in any other language gets English words with its own formatting. `useLocale`, `LocaleText`, `languageOf` and the per-component `*LabelsForLocale` helpers are exported for building the same.

Behaviour changes: DataTable's `locale` no longer defaults to `en-US` but to the provider's or the page's, and now also picks the language of its words; `Spinner` is a client component; `PaginationPrevious`/`PaginationNext` are named by their visible word ("Previous", "Next"), which stays readable below `sm`; `DateRangePicker` formats with `PP` by default, so a Turkish range reads "15 Eki 2026".
