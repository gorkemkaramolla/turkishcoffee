import { useCallback, useLayoutEffect, useRef } from 'react'
import type { Updater } from '@tanstack/react-table'
import type { DataTableColumnSelection } from '../state'

type Modifiers = { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }

export const NO_COLUMNS: DataTableColumnSelection = { ids: [], scope: 'page' }

/**
 * Excel's column selection, made page-aware, over a controllable
 * `{ ids, scope }`. A click selects one column for the rows on this page;
 * clicking that column again widens it to every row; a third click clears it.
 * Ctrl/⌘+click adds or removes a column, Shift+click selects the range from
 * the last clicked column (Ctrl/⌘+Shift adds the range); neither changes the
 * scope. `order` gives the selectable column ids in display order.
 */
export function useColumnSelection(
  order: () => string[],
  setSelection: (updater: Updater<DataTableColumnSelection>) => void,
) {
  const anchorRef = useRef<string | null>(null)
  const orderRef = useRef(order)
  useLayoutEffect(() => {
    orderRef.current = order
  })

  const select = useCallback(
    (columnId: string, { ctrlKey, metaKey, shiftKey }: Modifiers) => {
      const additive = ctrlKey || metaKey
      const anchor = anchorRef.current
      const ids = orderRef.current()

      if (shiftKey && anchor !== null && ids.includes(anchor)) {
        const from = Math.min(ids.indexOf(anchor), ids.indexOf(columnId))
        const to = Math.max(ids.indexOf(anchor), ids.indexOf(columnId))
        const range = ids.slice(from, to + 1)
        setSelection((current) => ({
          ...current,
          ids: additive ? [...new Set([...current.ids, ...range])] : range,
        }))
        return
      }

      anchorRef.current = columnId
      setSelection((current) => {
        if (additive) {
          const ids = current.ids.includes(columnId)
            ? current.ids.filter((id) => id !== columnId)
            : [...current.ids, columnId]
          return { ...current, ids }
        }
        // A plain click walks a selected column through page → all → none.
        if (current.ids.includes(columnId)) {
          return current.scope === 'page' ? { ...current, scope: 'all' } : NO_COLUMNS
        }
        return { ids: [columnId], scope: 'page' }
      })
    },
    [setSelection],
  )

  const clear = useCallback(() => {
    anchorRef.current = null
    setSelection(NO_COLUMNS)
  }, [setSelection])

  const widen = useCallback(() => setSelection((current) => ({ ...current, scope: 'all' })), [setSelection])

  return { select, clear, widen }
}

/** Which rows a column selection covers. */
export type ColumnScope = DataTableColumnSelection['scope']
