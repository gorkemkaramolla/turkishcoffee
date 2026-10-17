---
"turkishcoffee": minor
---

Text is now set in Inter, shipped with the library, instead of the platform's own font. The platform font drew every screen differently: Segoe UI on Windows has no 500 weight, so medium and semibold looked alike, and widths and line breaks changed from one operating system to the next. Inter gives the same widths, weights and line breaks on Windows, macOS and Linux.

- Nothing to install: `turkishcoffee/theme.css` loads the fonts. Your bundler picks up the two files from `dist/styles/fonts/` (78 KB upright, 86 KB italic; the italic downloads only when something is set in italic).
- Subset for Turkish and English interfaces (ğ, İ, ı, ş, ₺ and typographic punctuation), with both variable axes: weight 100–900, and optical size, which moves large headings to a tighter display cut on its own.
- A fallback face resized to Inter's metrics holds the layout while the font loads, so text does not jump when Inter arrives.
- Greyscale antialiasing on macOS and no synthesized bold or italic.
- To keep the platform font, redeclare `--font-sans` after importing the theme; Inter is then never downloaded.
