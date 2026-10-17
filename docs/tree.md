# Tree

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { Tree, TreeItem, TreeGroup, useTreeItem, TreeItemRow, TreeItemLayout, TreeItemPersonaLayout, type TreeProps, type TreeItemProps, type TreeItemRowProps, type TreeItemLayoutProps, type TreeItemPersonaLayoutProps } from 'turkishcoffee'
```

A hierarchy people expand and collapse: folders and files, an org chart,
nested categories, an app's navigation (Sidebar is built on it). Build it
from TreeItems; a branch holds its children in a TreeGroup. One tab stop
(or one per row with `tabStops="every"`): ↑ ↓ move, → opens a branch or enters it, ← closes it or goes to the parent,
Home / End jump, `*` opens every sibling, and typing a letter jumps to the
next item starting with it. Branches open on click and Enter; `onAction`
fires for every item. Rows are TreeItemLayout, TreeItemPersonaLayout or your
own built on TreeItemRow. Name the tree with `aria-label`.

## Example

```tsx
<Tree aria-label="Files" defaultOpenItems={['docs']} selectionMode="single">
  <TreeItem value="docs" itemType="branch">
    <TreeItemLayout iconBefore={<FolderIcon />} aside={<Badge>2</Badge>}>Documents</TreeItemLayout>
    <TreeGroup>
      <TreeItem value="contract">
        <TreeItemLayout iconBefore={<FileIcon />}>Contract.pdf</TreeItemLayout>
      </TreeItem>
    </TreeGroup>
  </TreeItem>
</Tree>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

### `TreeProps`

- `size?: 'sm' | 'md'` — Row height: `sm` 24px or `md` 32px (default).
- `selectionMode?: SelectionMode` — `none` (default) · `single` · `multiple` (with checkboxes). Selection never cascades to children.
- `openItems?: string[]` — Values of the open branches.
- `selectedItems?: string[]` — Values of the selected items.
- `onAction?: (value: string) => void` — Called when an item is clicked or activated with Enter: open a file, navigate to a page.
- `tabStops?: 'one' | 'every'` — `one` (default): the tree is one tab stop and arrow keys move inside it, the ARIA tree pattern, right for a file tree with hundreds of rows. `every`: each visible row is a tab stop too, as links in a navigation menu are; the arrow keys still work. Rows of closed branches are not rendered, so Tab never lands in them.

### `TreeItemProps`

- `value: string` — Unique within the Tree; what openItems, selectedItems and onAction speak in.
- `itemType?: 'branch' | 'leaf'` — `branch` holds a TreeGroup and opens; `leaf` (default) does not.

### `TreeItemLayoutProps`

- `iconBefore?: React.ReactNode` — Icon before the text, e.g. a folder.
- `iconAfter?: React.ReactNode` — Icon after the text, e.g. a lock.
- `aside?: React.ReactNode` — Quiet content at the end of the row: a count, a Badge, a date. Hidden while `actions` show.
- `actions?: React.ReactNode` — Buttons shown on hover and focus, e.g. a "More" menu: ghost `size="icon"` Buttons (sized to the row).

### `TreeItemPersonaLayoutProps`

- `media: React.ReactNode` — An Avatar (sized `size-8`, or `size-6` in a `sm` tree).
- `description?: React.ReactNode` — The second line: a title, an email, a status.

## Parts

- `type TreeProps`
- `type TreeItemProps`
- `TreeItem` — One node. Put a row in it (TreeItemLayout, TreeItemPersonaLayout or your own TreeItemRow) and, for a branch, a TreeGroup after it.
- `TreeGroup` — A branch's children. Rendered only while the branch is open.
- `useTreeItem` — The state of the TreeItem around you, for building your own row: its level, whether it is a branch and open, whether it is selected, and setters.
- `type TreeItemRowProps`
- `TreeItemRow` — The focusable row of a TreeItem — the element that is the `treeitem`. It carries the tree's roles, focus and click behaviour and nothing visual: build your own row on it, or render it as a link with `render={<a href="…" />}`. Clicking it opens a branch, selects, and fires `onAction`; call `event.preventDefault()` in your `onClick` to skip that.
- `type TreeItemLayoutProps`
- `TreeItemLayout` — The standard row: chevron, optional icon, text, then `aside` (quiet) or `actions` (on hover and focus). Indents itself by level; fixed height.
- `type TreeItemPersonaLayoutProps`
- `TreeItemPersonaLayout` — A person row: avatar, name and a second line. For org charts and team pickers.
