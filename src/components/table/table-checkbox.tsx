'use client'

import { cn } from '../../lib/cn'
import { Checkbox, type CheckboxProps } from '../checkbox/checkbox'

export type TableCheckboxProps = CheckboxProps & {
  /**
   * `always` (default): visible on every row. `hover`: subtle selection,
   * for dense lists — hidden until its row (`group/row`) or header (`group/header`)
   * is hovered or focused, and shown for good once it is checked, or anything
   * in the table is: pass `revealed`, or put `data-has-selection` on an
   * ancestor (DataTable does, so no row has to re-render).
   */
  appearance?: 'always' | 'hover'
  /** Keeps a `hover` checkbox visible, e.g. while any row is selected. */
  revealed?: boolean
  /**
   * For a checked header box: `'all'` (default) — every row is selected, a
   * filled box. `'visible'` — only the rows on screen (this page) are; an
   * outlined box, so it reads differently from "everything". The usual
   * two-step: first click selects the page, the next one everything.
   */
  scope?: 'visible' | 'all'
}

/**
 * The selection checkbox of a table row or header. A header box shows the mixed
 * state with `indeterminate`, and "this page only" with `scope="visible"`.
 * Give every box an `aria-label`.
 *
 * @example
 * <TableRow data-state={selected ? 'selected' : undefined} className="group/row">
 *   <TableCell>
 *     <TableCheckbox appearance="hover" checked={selected} onCheckedChange={setSelected} aria-label="Select row" />
 *   </TableCell>
 * </TableRow>
 */
export function TableCheckbox({
  appearance = 'always',
  revealed,
  scope = 'all',
  className,
  ...props
}: TableCheckboxProps) {
  const hidden = appearance === 'hover' && !revealed && !props.checked && !props.indeterminate
  return (
    <Checkbox
      data-slot="table-checkbox"
      className={cn(
        hidden &&
          'opacity-0 transition-opacity group-hover/row:opacity-100 group-hover/header:opacity-100 group-focus-within/row:opacity-100 focus-visible:opacity-100 in-data-has-selection:opacity-100 [@media(hover:none)]:opacity-100',
        scope === 'visible' && 'data-checked:bg-background data-checked:text-primary-text',
        className,
      )}
      {...props}
    />
  )
}
