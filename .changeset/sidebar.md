---
"turkishcoffee": minor
---

Add Sidebar, the app's side navigation, built on Tree and drawn like one: folders (SidebarCategory) with the chevron on the left fold their pages (SidebarItem) in and out, to any depth, one indent step per level. One tab stop with arrow keys, sections, counts, real links (`href` or your router's `<Link>`), `active` for the current page (a soft brand fill with brand text and icon), and an icon rail (`collapsed`) with labels in tooltips. It draws no edge line: its own faint grey, the new `--sidebar` token (`bg-sidebar`), sets it apart from the page, and hover fills inside it step up to `--selection` so they still show.
