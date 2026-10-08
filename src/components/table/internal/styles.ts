import { cn } from '../../../lib/cn'
import { selectedRow } from '../../../lib/states'

/**
 * The look Table and DataTable share, so a static table and a data grid on
 * the same page read as one design.
 */

/** A body row: a hairline below, a hover tint, the selected tint (`data-state="selected"`). */
export const tableRowClass = cn('border-b border-border transition-colors bg-[var(--table-row-background,transparent)] hover:bg-muted data-[state=selected]:hover:bg-selection', selectedRow)

/** Header text: semibold and full contrast. */
export const tableHeadTextClass = 'text-sm font-semibold text-foreground'

/** Horizontal padding of every header and body cell. */
export const tableCellPaddingClass = 'px-3'

/** Set the resting fill only; hover and selection still override it. */
export const tableRowStripeClass =
  'in-[tbody]:odd:[--table-row-background:var(--table-row-odd)] in-[tbody]:even:[--table-row-background:var(--table-row-even)] data-[stripe=odd]:[--table-row-background:var(--table-row-odd)] data-[stripe=even]:[--table-row-background:var(--table-row-even)]'
