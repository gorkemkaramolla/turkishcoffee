# Torun HR showcase

A people-operations app built only from turkishcoffee components, in Storybook
under **Showcase / Torun HR**. It lives outside `src/` so none of it ships in
the package. The `fullBleed` story parameter (see `.storybook/preview.tsx`)
renders a story edge to edge, without the centred, padded canvas.

| Screen | What it shows |
|---|---|
| People | Stat cards, a warning Alert, status Tabs, DataTable (sort, resize, reorder, hide, hover selection, export) with SearchField and Select in its toolbar, HoverCard, a row DropdownMenu, AlertDialog, and the Add employee Sheet with a linear FormTabs form |
| Time off | A Table with TableCheckbox, bulk approve and TablePagination, a decline AlertDialog, a Dialog form, DateRangePicker, a Calendar with modifiers, Accordion |
| Employee profile | Profile header, definition lists, Switch-blurred salary, Collapsible, Progress balances, AvatarGroup, document Table, EmptyState, an activity timeline |
| Settings | A react-hook-form settings form: FormErrorSummary, InputGroup with text addons, NativeSelect, radio cards, Checkbox, Switch rows, a sticky save bar |
| Payroll | A full-page EmptyState |

## Screens

The sidebar is the library's Sidebar (built on Tree): one tab stop, arrow keys,
a folding Finance category and an icon rail. Documents pairs a folder Tree with
FileUpload; the Add employee form picks the manager and skills with Combobox.

## Still missing from the library

Hand-built in this folder today, by how much an app like this needs them:

1. **PageHeader** — title, description and actions that wrap (`shell.tsx`).
2. **StatCard** — label, value, change with a good/bad colour, loading state.
3. **DescriptionList** — `dt`/`dd` pairs in a grid (profile › Employment).
4. **Timeline** — the profile's activity feed.
5. **Tabs `variant="underline"`** — lighter tabs for page sections.
6. **RadioCard** — a radio with title and hint in a selectable card.
7. **Kbd** — keyboard hints like ⌘K outside menus.
8. **Command palette (⌘K)** — for the top-bar search.
9. **NumberInput** — a number field with − / + steppers, min, max and step,
   and locale-aware formatting (Base UI ships `number-field`). Settings › annual
   leave days uses a plain `type="number"` input today.
10. **Banner** — a dismissable, page-wide product message (Alert is not dismissable).
11. **StatusDot / notification badge** — the small dot on the bell icon for
    unread notifications, and on an avatar for online/away/busy.
