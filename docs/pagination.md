# Pagination

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis, type PaginationLinkProps } from 'turkishcoffee'
```

Page navigation built from plain anchors, so it works with any router:
pass `href` to each link. Server-renderable.

## Example

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem><PaginationPrevious href="?page=1" /></PaginationItem>
    <PaginationItem><PaginationLink href="?page=1">1</PaginationLink></PaginationItem>
    <PaginationItem><PaginationLink href="?page=2" isActive>2</PaginationLink></PaginationItem>
    <PaginationItem><PaginationEllipsis /></PaginationItem>
    <PaginationItem><PaginationNext href="?page=3" /></PaginationItem>
  </PaginationContent>
</Pagination>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Radix primitive.

- `isActive?: boolean` — Marks the current page: outline style and `aria-current="page"`.
- `size?: 'sm' | 'md' | 'lg' | 'icon'` — A Button size; defaults to `icon` (square).

## Parts

- `PaginationContent` — The `<ul>` holding PaginationItems.
- `PaginationItem` — One `<li>` slot; wraps a link, Previous/Next or an ellipsis.
- `type PaginationLinkProps`
- `PaginationLink` — A page number link. `isActive` marks the current page (outline style + aria-current). `size` follows Button sizes and defaults to `icon`.
- `PaginationPrevious` — Link to the previous page; the label hides below `sm`.
- `PaginationNext` — Link to the next page; the label hides below `sm`.
- `PaginationEllipsis` — Stands in for skipped page numbers.
