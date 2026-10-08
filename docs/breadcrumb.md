# Breadcrumb

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbButton, BreadcrumbSeparator, BreadcrumbEllipsis, type BreadcrumbLinkProps } from 'turkishcoffee'
```

Trail of links to the current page. The last item is a BreadcrumbPage,
not a link. A step's text truncates at about 30 characters and shows in full
in a tooltip; change the limit with `className="[--breadcrumb-text-max:50ch]"`.

## Example

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Settings</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

## Parts

- `BreadcrumbList` — The ordered list holding BreadcrumbItems and BreadcrumbSeparators.
- `BreadcrumbItem` — One step of the trail.
- `type BreadcrumbLinkProps`
- `BreadcrumbLink` — A link to an ancestor page. Pass `render` to use your router's `<Link>`. Put an icon before the text as a child; it turns primary on hover.
- `BreadcrumbPage` — The current page. Not a link: it carries aria-current and is removed from the tab order, which is what screen readers expect at the end of a trail.
- `BreadcrumbButton` — A step that acts instead of navigating, styled like BreadcrumbLink. Use it as the trigger for a menu of collapsed steps: `<DropdownMenuTrigger render={<BreadcrumbButton aria-label="Show 3 more" />}><BreadcrumbEllipsis /></DropdownMenuTrigger>`.
- `BreadcrumbSeparator` — Goes between BreadcrumbItems; a chevron unless you pass children.
- `BreadcrumbEllipsis` — Stands in for collapsed middle steps of a long trail. Decorative: to let people reach those steps, put it inside a BreadcrumbButton that opens a menu.
