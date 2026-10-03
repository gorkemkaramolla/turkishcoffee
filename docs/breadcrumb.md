# Breadcrumb

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

```tsx
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis, type BreadcrumbLinkProps } from 'turkishcoffee'
```

Trail of links to the current page. The last item is a BreadcrumbPage,
not a link.

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
- `BreadcrumbLink` — A link to an ancestor page. Pass `render` to use your router's `<Link>`.
- `BreadcrumbPage` — The current page. Not a link: it carries aria-current and is removed from the tab order, which is what screen readers expect at the end of a trail.
- `BreadcrumbSeparator` — Goes between BreadcrumbItems; a chevron unless you pass children.
- `BreadcrumbEllipsis` — Stands in for collapsed middle steps of a long trail.
