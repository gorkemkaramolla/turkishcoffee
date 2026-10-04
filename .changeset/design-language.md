---
"turkishcoffee": patch
---

A design language of its own for business screens, driven by theme tokens:

- **Sharp corners:** `--radius` is 4px, with a 2/4/6/8px scale. Cards, dialogs and toasts are 6px; small parts are 2px.
- **Compact controls:** `--spacing-control*` tokens (28/32/36px, so `h-control`). Button, Input, Select, NativeSelect, InputGroup and TabsList share them. The default button is now 32px (was 36px).
- **Flat surfaces:** resting controls and cards lose their shadows. `shadow-float` is the single elevation for popovers, menus, dialogs, sheets and toasts.
- **Tinted active states:** `--selection` replaces the grey highlight in menus, select and calendar ranges. The open accordion header, the active tab and the selected table row get a 2px primary edge.

Visual only, no API changes. Layouts that assumed the 36px control height may need a look.
