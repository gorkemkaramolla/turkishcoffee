import type * as React from 'react'
import { cn } from '../../lib/cn'
import { selectedRow } from '../../lib/states'

/**
 * Plain styled table primitives — no data library, server-renderable; wraps the
 * table in a horizontally scrolling container. For sorting/pagination over a
 * column model, use `turkishcoffee/data-table`.
 *
 * @example
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Invoice</TableHead>
 *       <TableHead className="text-right">Amount</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     {invoices.map((inv) => (
 *       <TableRow key={inv.id}>
 *         <TableCell>{inv.id}</TableCell>
 *         <TableCell className="text-right">{inv.amount}</TableCell>
 *       </TableRow>
 *     ))}
 *   </TableBody>
 * </Table>
 */
export function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
}

/** The `<thead>`. */
export function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('[&_tr]:border-b', className)} {...props} />
}

/** The `<tbody>`. */
export function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

/** The `<tfoot>`, e.g. for totals. */
export function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
}

/** A `<tr>`; highlights on hover and when `data-state="selected"`. */
export function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-border transition-colors hover:bg-muted/50',
        selectedRow,
        className,
      )}
      {...props}
    />
  )
}

/** A header cell (`<th>`). */
export function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-control-lg px-2 text-left align-middle font-medium text-muted-foreground whitespace-nowrap',
        '[&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  )
}

/** A body cell (`<td>`). Does not wrap by default (`whitespace-nowrap`). */
export function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn('px-2 py-1.5 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  )
}

/** The `<caption>`, rendered below the table. */
export function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}
