---
"turkishcoffee": minor
---

FormTabs marked a tab with errors by a small red dot. On the active tab it was red on blue, close to 1:1, so it read as a rendering glitch, and it carried the error by colour alone. A stepper (`linear`) also looked exactly like free tabs, so nothing showed the order, how far along you are or which steps are done.

- A tab with errors now shows an error icon and how many fields to fix, in the danger colour (white on the active tab), with the count in its accessible name.
- With `linear`, the new `FormTabsList` draws a stepper instead of tabs: a progress line, a numbered marker and the step's name. Done steps show a check, the current one is filled and bold, a step left with errors shows an error icon and "N fields to fix", and steps past the next one can't be picked until the ones before them are done. The current step carries `aria-current="step"`. On a phone only the current step keeps its name. Use `FormTabsList` in place of `TabsList` inside FormTabs; it renders the usual tabs when `linear` is off.
- New `FormErrorSummary`: after a failed submit, a danger Alert above the form lists every error, each a link that opens the tab holding the field and focuses it. Optional — worth it on long or tabbed forms.
- `useFormTabs()` also returns `errorCount(step)`.
