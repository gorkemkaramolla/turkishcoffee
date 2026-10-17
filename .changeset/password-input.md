---
"turkishcoffee": minor
---

New `PasswordInput`: a password field with a button that shows what was typed, built on InputGroup. The button is a toggle with one name ("Show password", in the page's language) and `aria-pressed`, so a screen reader hears its state instead of a label that changes under the cursor. Every other prop goes to the `<input>`, so it drops into a `FormControl`. `EyeIcon` and `EyeOffIcon` are exported.
