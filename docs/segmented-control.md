# SegmentedControl

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { SegmentedControl, SegmentedControlItem, SegmentedControlCount, type SegmentedControlProps, type SegmentedControlItemProps } from 'turkishcoffee'
```

A row of mutually exclusive options that change what the page shows, such as
a list's status filter: All · Active · Inactive. One segment is always
pressed. Name the group with `aria-label`. Each segment is a toggle button
(`aria-pressed`), and the arrow keys move between them. Put a count in a
segment with SegmentedControlCount.

Use Tabs for separate views with their own panels, and RadioGroup for a
choice submitted with a form.

## Example

```tsx
<SegmentedControl aria-label="Status" value={status} onValueChange={setStatus}>
  <SegmentedControlItem value="all">All</SegmentedControlItem>
  <SegmentedControlItem value="active">
    Active <SegmentedControlCount>128</SegmentedControlCount>
  </SegmentedControlItem>
  <SegmentedControlItem value="inactive">
    Inactive <SegmentedControlCount>7</SegmentedControlCount>
  </SegmentedControlItem>
</SegmentedControl>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

### `SegmentedControlProps`

- `value?: Value` — The pressed segment, controlled. Pair it with `onValueChange`.
- `defaultValue?: Value` — The segment pressed at first, uncontrolled.
- `onValueChange?: (value: Value, eventDetails: ToggleGroup.ChangeEventDetails) => void` — Called with the segment just pressed. Pressing the pressed one again changes nothing: one segment always stays pressed.

### `SegmentedControlItemProps`

- `value: Value` — Identifies the segment in the group's `value`.

## Parts

- `type SegmentedControlProps`
- `type SegmentedControlItemProps`
- `SegmentedControlItem` — One segment. Pressed, it takes the page's background and a `--field` edge, at least 3:1 against the track.
- `SegmentedControlCount` — A count beside a segment's label, in tabular figures so the segment keeps its width as the number changes.
