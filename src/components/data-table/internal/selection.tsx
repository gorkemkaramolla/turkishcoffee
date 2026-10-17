'use client'

import { createContext, useContext } from 'react'
import type { Row, RowData } from '@tanstack/react-table'
import { TableCheckbox } from '../../table/table-checkbox'
import type { DataTableColumn, DataTableFeatures } from '../features'
import type { DataTableLabels } from '../labels'
import type { HeaderSelection } from './row-selection'

/** Id of the checkbox column DataTable prepends when `selectable` is on. */
export const SELECT_COLUMN_ID = '__select'

/** The header checkbox's state for this render, provided by DataTable around the grid. */
export const SelectionHeaderContext = createContext<{
  state: HeaderSelection
  /** Rows matching the filters, for "Select all N". */
  total: number
  /** One click's step: none/some → this page; page → every matching row; all → none. */
  advance: () => void
}>({ state: 'none', total: 0, advance: () => {} })

/**
 * The checkbox column. Fixed in place and size: it cannot be sorted, filtered,
 * resized, hidden, moved or exported.
 *
 * The header box selects in two steps, so everything can be selected without
 * showing everything: the first click selects the rows on this page (an
 * outlined check), the next one every row matching the filters — on the
 * server too (`allMatching`) — (a filled check); then it clears. A mixed box
 * (some rows) also starts with the page. Without pagination, or with
 * `selectable.scope: 'page'`, the page is everything: one step. A row box
 * Shift+clicked selects the range from the last one clicked, in display order
 * (TanStack's range selection).
 */
export function selectionColumn<TData extends RowData>(
  appearance: 'always' | 'hover',
  labels: DataTableLabels,
): DataTableColumn<TData> {
  return {
    id: SELECT_COLUMN_ID,
    size: 44,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    enableColumnFilter: false,
    meta: { reorderable: false, label: labels.selectAll },
    header: () => <SelectAllCheckbox appearance={appearance} labels={labels} />,
    cell: ({ row }) => <RowCheckbox row={row} appearance={appearance} label={labels.selectRow} />,
  }
}

function SelectAllCheckbox({ appearance, labels }: { appearance: 'always' | 'hover'; labels: DataTableLabels }) {
  const { state, total, advance } = useContext(SelectionHeaderContext)
  const label = state === 'page' ? labels.selectAllRows(total) : labels.selectAll
  return (
    <TableCheckbox
      appearance={appearance}
      checked={state === 'all' || state === 'page'}
      indeterminate={state === 'some'}
      scope={state === 'page' ? 'visible' : 'all'}
      aria-label={label}
      title={state === 'page' ? label : undefined}
      tabIndex={-1}
      data-grid-control=""
      onCheckedChange={() => advance()}
    />
  )
}

function RowCheckbox<TData extends RowData>({
  row,
  appearance,
  label,
}: {
  row: Row<DataTableFeatures, TData>
  appearance: 'always' | 'hover'
  label: string
}) {
  const toggle = row.getToggleSelectedHandler()
  return (
    <TableCheckbox
      appearance={appearance}
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      aria-label={label}
      tabIndex={-1}
      data-grid-control=""
      // TanStack's handler reads a change event: `target.checked`, and `shiftKey`
      // for range selection. Base UI hands over the checked state and the DOM event.
      onCheckedChange={(checked, details) =>
        toggle({ target: { checked }, shiftKey: (details.event as MouseEvent | undefined)?.shiftKey ?? false })
      }
    />
  )
}
