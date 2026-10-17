---
"turkishcoffee": minor
---

Add `SidebarSwitcher` and `SidebarSwitcherItem`: switch the company, branch or workspace the app is looking at from the top of the sidebar. The current one's logo, name and a second line open a menu of the others, with a check on the current one; on the icon rail it shrinks to the logo.

Add `SidebarProvider`: it holds the collapsed state above the Sidebar, so a `SidebarTrigger` can sit outside it, in the page's top bar beside the breadcrumb. A Sidebar with its own `collapsed` (the copy in a mobile Sheet) ignores it. `SidebarTrigger` no longer pushes itself to the end with `ms-auto`; SidebarHeader does that for a trigger inside it.
