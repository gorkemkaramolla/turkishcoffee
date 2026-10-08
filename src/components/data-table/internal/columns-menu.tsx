'use client'

import type { ReactTable, RowData } from '@tanstack/react-table'
import { Button } from '../../button/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../dropdown-menu/dropdown-menu'
import { ColumnsIcon, RotateIcon } from '../../../lib/icons'
import { columnLabel, orderedColumnIds } from './columns'
import type { DataTableFeatures } from '../features'
import type { DataTableLabels } from '../labels'

/**
 * The column chooser: a checkbox per hideable column, in display order, plus
 * "Reset layout". The last visible column cannot be unchecked.
 */
export function ColumnsMenu<TData extends RowData>({
  table,
  labels,
  onReset,
}: {
  table: ReactTable<DataTableFeatures, TData>
  labels: DataTableLabels
  onReset: () => void
}) {
  const visibleCount = table.getVisibleLeafColumns().length
  // Display order, hidden columns included (column.getIndex() only counts visible ones).
  const all = table.getAllLeafColumns()
  const order = orderedColumnIds(
    all.map((column) => column.id),
    table.state.columnOrder,
  )
  const columns = all
    .filter((column) => column.getCanHide())
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />}>
        <ColumnsIcon />
        {labels.columns}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{labels.columns}</DropdownMenuLabel>
          {columns.map((column) => {
            const visible = column.getIsVisible()
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={visible}
                disabled={visible && visibleCount <= 1}
                closeOnClick={false}
                onCheckedChange={(checked) => column.toggleVisibility(checked)}
              >
                {columnLabel(column)}
              </DropdownMenuCheckboxItem>
            )
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onReset}>
          <RotateIcon />
          {labels.resetLayout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
