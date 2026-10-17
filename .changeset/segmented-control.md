---
"turkishcoffee": minor
---

Add `SegmentedControl`, `SegmentedControlItem` and `SegmentedControlCount`: a row of mutually exclusive options that change what the page shows, such as a list's status filter. It is built on Base UI's ToggleGroup and takes a single `value`. One segment always stays pressed. The pressed segment has the page background and a `--field` edge, at least 3:1 against the track in light and dark. All segments use the same font weight, so pressing one does not change the widths. `SegmentedControlCount` shows a count in tabular figures.
