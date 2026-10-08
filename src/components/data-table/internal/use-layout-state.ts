import { useMemo } from 'react'
import {
  functionalUpdate,
  type ColumnOrderState,
  type ColumnSizingState,
  type ColumnVisibilityState,
  type Updater,
} from '@tanstack/react-table'
import { columnDefIds } from './columns'
import { SELECT_COLUMN_ID } from './selection'
import { usePersistedLayout, type DataTableLayout } from './use-persisted-layout'
import type { DataTableState } from '../state'

type LayoutKey = 'columnSizing' | 'columnOrder' | 'columnVisibility'
type Slice<K extends LayoutKey> = [DataTableState[K], (updater: Updater<DataTableState[K]>) => void]

export type LayoutStateOptions = {
  columns: ReadonlyArray<Parameters<typeof columnDefIds>[0][number]>
  /** The checkbox column is part of the layout too. */
  selectable: boolean
  initialState: Partial<DataTableState> | undefined
  storageKey: string | undefined
  savedLayout: Partial<DataTableLayout> | null | undefined
  onLayoutChange: ((layout: DataTableLayout | null) => void) | undefined
  /** Which slices the user can change; a stored slice applies only when its feature is on. */
  resizable: boolean
  reorderable: boolean
  hideable: boolean
  columnSizing?: ColumnSizingState
  onColumnSizingChange?: (next: ColumnSizingState) => void
  columnOrder?: ColumnOrderState
  onColumnOrderChange?: (next: ColumnOrderState) => void
  columnVisibility?: ColumnVisibilityState
  onColumnVisibilityChange?: (next: ColumnVisibilityState) => void
}

/**
 * The user-shaped layout — widths set by hand, column order, visibility — with
 * one precedence per slice: controlled prop > the layout stored under
 * `storageKey` / `savedLayout` (when the slice's feature is on) > `initialState`.
 * Uncontrolled edits go to the persisted layout; every edit is reported.
 */
export function useLayoutState(options: LayoutStateOptions) {
  const { columns, selectable } = options
  // Every leaf column id, the checkbox column included, for reconciling stored layouts.
  const columnIds = useMemo(
    () => [...(selectable ? [SELECT_COLUMN_ID] : []), ...columnDefIds(columns)],
    [selectable, columns],
  )
  const persisted = usePersistedLayout(
    options.storageKey,
    options.initialState,
    columnIds,
    options.savedLayout,
    options.onLayoutChange,
  )

  const slice = <K extends LayoutKey>(
    key: K,
    enabled: boolean,
    value: DataTableState[K] | undefined,
    onChange: ((next: DataTableState[K]) => void) | undefined,
  ): Slice<K> => {
    const current = value ?? ((enabled ? persisted.layout[key] : persisted.defaults[key]) as DataTableState[K])
    return [
      current,
      (updater) => {
        const next = functionalUpdate(updater, current)
        if (value === undefined) persisted.update(key, () => next as never)
        onChange?.(next)
      },
    ]
  }

  const [userSizing, setUserSizing] = slice('columnSizing', options.resizable, options.columnSizing, options.onColumnSizingChange)
  const [columnOrder, setColumnOrder] = slice('columnOrder', options.reorderable, options.columnOrder, options.onColumnOrderChange)
  const [columnVisibility, setColumnVisibility] = slice(
    'columnVisibility',
    options.hideable,
    options.columnVisibility,
    options.onColumnVisibilityChange,
  )

  /** Back to the starting layout, and the stored copy removed. */
  const resetLayout = () => {
    setColumnVisibility(persisted.defaults.columnVisibility)
    setColumnOrder(persisted.defaults.columnOrder)
    setUserSizing(persisted.defaults.columnSizing)
    persisted.reset()
  }

  return {
    persisted,
    userSizing,
    setUserSizing,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
    resetLayout,
    /** Content widths are cached for the next server render only when the layout is kept somewhere. */
    persistent: Boolean(options.storageKey || options.savedLayout !== undefined),
  }
}
