---
"turkishcoffee": patch
---

Fix `cn()` keeping both classes when `className` overrides a control-size or float-shadow class: `size-6` now replaces `size-control`, `h-8` replaces `h-control`, `shadow-none` replaces `shadow-float`. Before, the stylesheet's order picked the winner, so `<Button size="icon" className="size-6">` stayed 36px.
