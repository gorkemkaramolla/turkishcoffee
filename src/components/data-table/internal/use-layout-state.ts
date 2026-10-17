import { useMemo } from 'react'
import { functionalUpdate, type Updater } from '@tanstack/react-table'
import { columnDefIds } from './columns'
import { SELECT_COLUMN_ID } from './selection'
import { usePersistedLayout, type DataTableLayout } from './use-persisted-layout'
import type { DataTableLayoutOptions } from '../state'

type LayoutKey = 'columnSizing' | 'columnOrder' | 'columnVisibility'
type Slice<K extends LayoutKey> = [DataTableLayout[K], (updater: Updater<DataTableLayout[K]>) => void]

export type LayoutStateOptions = {
  columns: ReadonlyArray<Parameters<typeof columnDefIds>[0][number]>
  /** The checkbox column is part of the layout too. */
  selectable: boolean
  layout: DataTableLayoutOptions | undefined
  /** Which slices the user can change; a saved slice applies only when its feature is on. */
  resizable: boolean
  reorderable: boolean
  hideable: boolean
}

/**
 * The user-shaped layout — widths set by hand, column order, visibility. Per
 * slice: the saved layout (`layout.storageKey` / `layout.saved`, when the
 * slice's feature is on) > `layout.defaults` > the column definitions. The
 * layout is the grid's own state; the app keeps a copy through `onChange`.
 */
export function useLayoutState(options: LayoutStateOptions) {
  const { columns, selectable, layout } = options
  // Every leaf column id, the checkbox column included, for reconciling saved layouts.
  const columnIds = useMemo(
    () => [...(selectable ? [SELECT_COLUMN_ID] : []), ...columnDefIds(columns)],
    [selectable, columns],
  )
  const persisted = usePersistedLayout(layout?.storageKey, layout?.defaults, columnIds, layout?.saved, layout?.onChange)

  const slice = <K extends LayoutKey>(key: K, enabled: boolean): Slice<K> => {
    const current = (enabled ? persisted.layout[key] : persisted.defaults[key]) as DataTableLayout[K]
    return [current, (updater) => persisted.update(key, () => functionalUpdate(updater, current) as never)]
  }

  const [userSizing, setUserSizing] = slice('columnSizing', options.resizable)
  const [columnOrder, setColumnOrder] = slice('columnOrder', options.reorderable)
  const [columnVisibility, setColumnVisibility] = slice('columnVisibility', options.hideable)

  return {
    persisted,
    userSizing,
    setUserSizing,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
    /** Back to `layout.defaults`, the stored copy removed, `null` reported. */
    resetLayout: persisted.reset,
    /** Content widths are cached for the next server render only when the layout is kept somewhere. */
    persistent: Boolean(layout?.storageKey || layout?.saved !== undefined),
  }
}
