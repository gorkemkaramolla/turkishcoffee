# Sidebar

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { useSidebar, SidebarProvider, Sidebar, SidebarHeader, SidebarSwitcher, SidebarSwitcherItem, SidebarContent, SidebarFooter, SidebarSection, SidebarSeparator, SidebarItem, SidebarCategory, SidebarTrigger, type SidebarProviderProps, type SidebarProps, type SidebarSwitcherProps, type SidebarSwitcherItemProps, type SidebarContentProps, type SidebarItemProps, type SidebarCategoryProps } from 'turkishcoffee'
```

The app's side navigation: a header, the navigation itself (SidebarContent)
and a footer. The navigation is a Tree, and looks like one: folders
(SidebarCategory) with the chevron on the left fold their pages
(SidebarItem) in and out, to any depth, one indent step per level. Tab
visits every visible row, as it does the links of any menu; ↑ ↓ move too,
→ / ← open and close a folder, Enter follows a link or folds a folder,
typing a letter jumps. Items are real links — pass `href`, or `render={<Link href="…" />}`
for your router — and `active` marks the current page. `collapsed` shrinks
it to an icon rail with the labels in tooltips; SidebarTrigger toggles that,
from the SidebarHeader or, under a SidebarProvider, from anywhere on the page.
On small screens render the same content inside a Sheet (`side="left"`).

## Example

```tsx
<Sidebar>
  <SidebarHeader>
    <span className="font-semibold">Torun HR</span>
    <SidebarTrigger />
  </SidebarHeader>
  <SidebarContent aria-label="Main" defaultOpenItems={['time-off']}>
    <SidebarSection title="Workforce">
      <SidebarItem icon={<UsersIcon />} active count={64} render={<Link href="/people" />}>People</SidebarItem>
      <SidebarCategory value="time-off" icon={<CalendarIcon />} label="Time off">
        <SidebarItem render={<Link href="/time-off/requests" />}>Requests</SidebarItem>
        <SidebarCategory value="policies" label="Policies">
          <SidebarItem render={<Link href="/time-off/policies/annual" />}>Annual leave</SidebarItem>
        </SidebarCategory>
      </SidebarCategory>
    </SidebarSection>
  </SidebarContent>
  <SidebarFooter>…</SidebarFooter>
</Sidebar>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

### `SidebarContextValue`

- `provided: boolean` — Set by SidebarProvider and Sidebar; false only for the default value.

### `CollapsedState`

- `collapsed?: boolean` — Icon rail: icons only, labels in tooltips.

### `SidebarSwitcherProps`

- `icon?: React.ReactNode` — The current choice's logo or icon; decorative, `label` names it. Shown alone on the rail.
- `label: React.ReactNode` — The current choice's name.
- `description?: React.ReactNode` — A quieter second line under the name: a plan, your role there.
- `value?: string` — The `value` of the current SidebarSwitcherItem; it gets the check.

### `SidebarSwitcherItemProps`

- `icon?: React.ReactNode` — Its logo or icon, in a small square before the name.

### `SidebarContentProps`

- `'aria-label'?: string` — Names the navigation landmark and its tree. Defaults to "Main".

### `SidebarItemProps`

- `value?: string` — Unique within the sidebar. Defaults to `href`, else a generated id.
- `icon?: React.ReactNode` — Optional. Shown before the label, and alone on the rail — so give top-level items one; deeper levels usually go without.
- `active?: boolean` — The current page: a soft brand fill with brand text and icon, `aria-current="page"`.
- `count?: React.ReactNode` — A number or Badge at the end of the row; hidden on the rail.
- `render?: React.ReactElement` — Your router's link, e.g. `<Link href="/people" />`.

### `SidebarCategoryProps`

- `value: string` — Unique within the sidebar; what SidebarContent's open items speak in.
- `icon?: React.ReactNode` — Optional. Shown after the chevron, and alone on the rail — so give top-level categories one.
- `active?: boolean` — One of its pages is current: the category reads as active while closed or on the rail.

## Parts

- `useSidebar` — Whether the surrounding Sidebar (or SidebarProvider) is collapsed to its icon rail, and a setter.
- `type SidebarProviderProps`
- `SidebarProvider` — Holds the Sidebar's collapsed state above it, so a SidebarTrigger can sit outside the sidebar — in the page's top bar, beside the breadcrumb. Renders no element of its own. A Sidebar inside it follows it; give that Sidebar its own `collapsed` (e.g. `collapsed={false}` for the copy in a mobile Sheet) to opt out.

  ```tsx
  <SidebarProvider defaultCollapsed={cookie === '1'} onCollapsedChange={saveCookie}>
    <div className="flex min-h-dvh">
      <Sidebar>…</Sidebar>
      <div className="flex-1">
        <header className="flex h-14 items-center gap-2 px-4">
          <SidebarTrigger className="-ms-2" />
          <Breadcrumb>…</Breadcrumb>
        </header>
        <main>…</main>
      </div>
    </div>
  </SidebarProvider>
  ```

- `type SidebarProps`
- `SidebarHeader` — Top row: the product name or logo, or a SidebarSwitcher, and usually SidebarTrigger. On the rail only the switcher's mark and the trigger show.
- `type SidebarSwitcherProps`
- `SidebarSwitcher` — Switches what the whole app is looking at — a company, a branch, a workspace — from the top of the sidebar: the current one's logo, name and a second line, opening a menu of the others. Put it in SidebarHeader; on the rail it shrinks to the logo. Children are the menu: SidebarSwitcherItems, plus any DropdownMenu parts (a DropdownMenuLabel, a separator, an "Add company" DropdownMenuItem). The app owns what switching means: change `value` (and `label`, `icon`) in `onValueChange`.

  ```tsx
  <SidebarHeader>
    <SidebarSwitcher icon={<img src={org.logo} alt="" />} label={org.name} description="Owner" value={org.id} onValueChange={switchOrg}>
      <DropdownMenuLabel>Companies</DropdownMenuLabel>
      {orgs.map((o) => (
        <SidebarSwitcherItem key={o.id} value={o.id} icon={<img src={o.logo} alt="" />}>{o.name}</SidebarSwitcherItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={addOrg}><PlusIcon />Add company</DropdownMenuItem>
    </SidebarSwitcher>
    <SidebarTrigger />
  </SidebarHeader>
  ```

- `type SidebarSwitcherItemProps`
- `SidebarSwitcherItem` — One choice in a SidebarSwitcher's menu: its logo, its name, and a check on the current one. Picking it closes the menu.
- `type SidebarContentProps`
- `SidebarContent` — The navigation: a `<nav>` landmark around a Tree of SidebarSections, SidebarItems and SidebarCategories. Scrolls when it is taller than the sidebar. Which categories are open is Tree state: `defaultOpenItems` or `openItems` + `onOpenItemsChange`, by category `value`.
- `SidebarFooter` — Bottom row: the signed-in user, a help link. Not part of the navigation tree.
- `SidebarSection` — A group of items under an optional small heading. The heading hides on the rail but still names the group.
- `SidebarSeparator` — Hairline between sections.
- `type SidebarItemProps`
- `SidebarItem` — One page: a link row in the navigation tree. At any level — inside a SidebarCategory it indents one step and lines up under the category's icon.
- `type SidebarCategoryProps`
- `SidebarCategory` — A folder of pages: a branch row with the chevron on the left that folds its SidebarItems — and further SidebarCategories, to any depth — in and out. On the rail, clicking it expands the sidebar and opens it.
- `SidebarTrigger` — Collapses the sidebar to its icon rail and back. Inside the SidebarHeader it sits at the end; under a SidebarProvider it works anywhere, e.g. at the start of the page's top bar.
