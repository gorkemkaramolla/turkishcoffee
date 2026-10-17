import { cn } from '../../../lib/cn'

/**
 * The look Table and DataTable share, so a static table and a data grid on
 * the same page read as one design.
 */

/** A body row: a faint hairline below (`--table-row-divider`), a hover tint (`--table-row-hover`), the selected tint (`data-state="selected"`). */
export const tableRowClass = cn('border-b border-[color:var(--table-row-divider)] transition-colors bg-[var(--table-row-background,transparent)] hover:bg-[var(--table-row-hover)] data-[state=selected]:bg-[var(--table-row-selected)] data-[state=selected]:hover:bg-[var(--table-row-selected)]')

/**
 * Header text: a step below the cells, so the data reads first and the
 * labels second. The header's own surface (`--table-header`) sets the row apart.
 */
export const tableHeadTextClass = 'text-sm font-medium text-muted-foreground'

/** Horizontal padding of every header and body cell. */
export const tableCellPaddingClass = 'px-3'

/**
 * Set the resting fill only; hover and selection still override it. Even rows
 * take `--table-row-stripe`, which only a `striped` table sets, so rows are
 * plain by default.
 */
export const tableRowStripeClass =
  'in-[tbody]:odd:[--table-row-background:var(--table-row-odd)] in-[tbody]:even:[--table-row-background:var(--table-row-stripe,var(--table-row-odd))] data-[stripe=odd]:[--table-row-background:var(--table-row-odd)] data-[stripe=even]:[--table-row-background:var(--table-row-stripe,var(--table-row-odd))]'

/** How body rows look; Table and DataTable take the same two props. */
export type TableRowAppearance = {
  /** Alternate the body rows' background (`--table-row-even`). Off by default. */
  striped?: boolean
  /**
   * The selected rows' background: `neutral` (default) is grey, `primary`
   * the brand's soft tint (`--table-row-selected-primary`).
   */
  selectionColor?: 'neutral' | 'primary'
}

/** Set on the table's root; its rows read the variables it sets. */
export function tableRowAppearanceClass({ striped, selectionColor }: TableRowAppearance) {
  return cn(
    striped && '[--table-row-stripe:var(--table-row-even)]',
    selectionColor === 'primary' && '[--table-row-selected:var(--table-row-selected-primary)]',
  )
}
