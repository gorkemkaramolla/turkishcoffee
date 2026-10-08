---
"turkishcoffee": minor
---

A new palette of its own: warm greys with a trace of coffee brown instead of pure greys, a #1760B0 brand blue, new status colours, and a warm #1C1A18 dark page instead of pure black, which is easier on the eyes. Every text pair stays at least 4.5:1 and every control edge and focus ring 3:1, in light and dark.

- New `primary-text` token: brand-coloured text and icons use `text-primary-text`. In dark mode `primary` is now a fill too dark to read as text. Replace `text-primary` with `text-primary-text` in your own code.
- New `field` and `field-hover` tokens: text fields, selects, checkboxes and radios get one even edge that reaches 3:1 on its own and darkens on hover. A focused text field turns that edge into a 2px brand line inside the box instead of an outer ring.
- Focus rings are a solid 2px `ring-ring` (was 3px at 50%, under 3:1); buttons and switches add a 2px offset.
- Alert's warning variant keeps its text dark and colours only the icon; orange text on white was unreadable.
- Dark mode status fills are bright with dark text, so they pass 4.5:1 both as fills and as text.
