# Combobox

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { Combobox, ComboboxValue, ComboboxGroup, ComboboxCollection, useComboboxFilter, ComboboxInput, ComboboxChips, ComboboxChip, ComboboxChipsInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty, ComboboxGroupLabel, ComboboxSeparator, type ComboboxInputProps, type ComboboxContentProps } from 'turkishcoffee'
```

A text field that filters a list as you type, for picking one value (or
several, with `multiple`) out of more than a Select comfortably holds: a
manager out of 300 people, a city, a cost centre. Give it the options as
`items`; ComboboxList renders each through a function child and filters them
itself. For objects, pass `itemToStringLabel` so the input shows a label.
Controlled with `value` + `onValueChange(value, eventDetails)`. For under a
dozen fixed options use Select.

## Example

```tsx
<Combobox items={people} itemToStringLabel={(p) => p.name} value={manager} onValueChange={setManager}>
  <ComboboxInput placeholder="Search people" aria-label="Manager" />
  <ComboboxContent>
    <ComboboxEmpty>No one matches.</ComboboxEmpty>
    <ComboboxList>
      {(person: Person) => (
        <ComboboxItem key={person.id} value={person}>{person.name}</ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

## More examples

### Several values, as chips

```tsx
<Combobox multiple items={skills} value={picked} onValueChange={setPicked}>
  <ComboboxChips>
    <ComboboxValue>
      {(values: string[]) => values.map((skill) => <ComboboxChip key={skill}>{skill}</ComboboxChip>)}
    </ComboboxValue>
    <ComboboxChipsInput placeholder="Add a skill" aria-label="Skills" />
  </ComboboxChips>
  <ComboboxContent>
    <ComboboxList>{(skill: string) => <ComboboxItem key={skill} value={skill}>{skill}</ComboboxItem>}</ComboboxList>
  </ComboboxContent>
</Combobox>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

### `ComboboxInputProps`

- `size?: 'sm' | 'md'` — Height: `sm` (32px) or `md` (36px, default) — matches Button, Input and Select.
- `showClear?: boolean` — Show the × that clears the value once there is one. Defaults to true.
- `clearLabel?: string` — Accessible name of the clear button. Defaults to "Clear" in the page's language.
- `showTrigger?: boolean` — Show the chevron that opens the list without typing. Defaults to true.
- `triggerLabel?: string` — Accessible name of the chevron. Defaults to "Show options" in the page's language.
- `groupClassName?: string` — Classes on the field around the input (border, width). `className` styles the input.

### `ComboboxChip`

- `removeLabel?: string` — Accessible name of the × button. Defaults to "Remove" followed by the chip's text.

## Parts

- `ComboboxValue` — Renders the selected value(s) through a function child; use it inside ComboboxChips.
- `ComboboxGroup` — Groups ComboboxItems under a ComboboxGroupLabel.
- `ComboboxCollection` — Renders the items of a group passed as `{ value, items }` in `items`.
- `useComboboxFilter` — The default filter (locale-aware "contains"), for filtering `items` yourself.
- `type ComboboxInputProps`
- `ComboboxInput` — The single-value field: the text input, a clear button and a chevron, in one bordered box. Give it `aria-label`, or pair it with a Label through `id`.
- `ComboboxChips` — The multi-value field: chips for what is picked, then the input. Backspace in an empty input removes the last chip; Left Arrow moves onto the chips.
- `ComboboxChip` — One picked value inside ComboboxChips, with its own remove button.
- `ComboboxChipsInput` — The input inside ComboboxChips; it takes the rest of the row.
- `type ComboboxContentProps`
- `ComboboxContent` — The options panel under the field, as wide as the field; renders its own portal.
- `ComboboxList` — The scrolling list. Pass a function child to render each of `items`; it is called for the filtered ones only. The listbox is named after the field ("Manager"), since a listbox needs a name of its own; pass `aria-label` to name it otherwise.
- `ComboboxItem` — One option. `value` is the item itself; a check marks the selected one(s).
- `ComboboxEmpty` — Shown in place of the list when nothing matches the typed text.
- `ComboboxGroupLabel` — Heading for a ComboboxGroup.
- `ComboboxSeparator` — Horizontal rule between groups.
