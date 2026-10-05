---
"turkishcoffee": minor
---

Add `FormTabs` to `turkishcoffee/form`: one react-hook-form form split across tabs that keep their values while hidden. Tabs with an error get a dot and a failed submit opens the first one; `linear` turns it into a stepper whose Next (`FormTabsNext`/`FormTabsPrevious`, `useFormTabs`) validates the current step first.
