# Breadcrumb

**Server-renderable**: no `"use client"`; it adds no client boundary.

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
      <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Settings</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Radix primitive.

- `asChild?: boolean` — Render as the child element instead of an <a> — e.g. wrap a <Link>.

## Parts

- `BreadcrumbList` — The ordered list holding BreadcrumbItems and BreadcrumbSeparators.
- `BreadcrumbItem` — One step of the trail.
- `type BreadcrumbLinkProps`
- `BreadcrumbLink` — A link to an ancestor page. Use `asChild` to wrap your router's `<Link>`.
- `BreadcrumbPage` — The current page. Not a link: it carries aria-current and is removed from the tab order, which is what screen readers expect at the end of a trail.
- `BreadcrumbSeparator` — Goes between BreadcrumbItems; a chevron unless you pass children.
- `BreadcrumbEllipsis` — Stands in for collapsed middle steps of a long trail.
