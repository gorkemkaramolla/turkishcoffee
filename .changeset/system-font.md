---
"turkishcoffee": patch
---

`theme.css` now sets the body font: the platform's own UI font (San Francisco on Apple devices, Segoe UI on Windows, then Helvetica Neue, Tahoma and Arial) through `--font-sans`. Nothing is downloaded. An app that loads its own font keeps it by redeclaring `--font-sans`.
