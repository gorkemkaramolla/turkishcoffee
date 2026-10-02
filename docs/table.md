# Table

**Server-renderable**: no `"use client"`; it adds no client boundary.

```tsx
import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption } from 'turkishcoffee'
```

Plain styled table primitives — no data library, server-renderable; wraps the
table in a horizontally scrolling container. For sorting/pagination over a
column model, use `turkishcoffee/data-table`.

## Example

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {invoices.map((inv) => (
      <TableRow key={inv.id}>
        <TableCell>{inv.id}</TableCell>
        <TableCell className="text-right">{inv.amount}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Parts

- `TableHeader` — The `<thead>`.
- `TableBody` — The `<tbody>`.
- `TableFooter` — The `<tfoot>`, e.g. for totals.
- `TableRow` — A `<tr>`; highlights on hover and when `data-state="selected"`.
- `TableHead` — A header cell (`<th>`).
- `TableCell` — A body cell (`<td>`). Does not wrap by default (`whitespace-nowrap`).
- `TableCaption` — The `<caption>`, rendered below the table.
