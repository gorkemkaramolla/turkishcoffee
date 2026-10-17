import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import {
  functionalUpdate,
  type ColumnFiltersState,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Updater,
} from '@tanstack/react-table'
import type { DataTableFeatures } from '../features'
import type { DataTableRowSelection } from '../state'
import {
  NO_SELECTION,
  fromSelectionMap,
  headerSelection,
  selectedCount,
  toSelectionMap,
  type HeaderSelection,
} from './row-selection'
import { sameIds } from './widths'

type GridRow<TData extends RowData> = Row<DataTableFeatures, TData>
type SetSelection = (updater: Updater<DataTableRowSelection>) => void

const NO_IDS: string[] = []

/**
 * The selection model in TanStack's terms, before the table exists: the id of
 * every loaded row, which rows are eligible, and the `{ [id]: true }` map the
 * table reads. The ids follow `data`, as TanStack's own row model does: a new
 * `getRowId` function alone (an inline arrow) does not re-key 10,000 rows.
 */
export function useSelectionModel<TData extends RowData>({
  data,
  getRowId,
  selectable,
  isRowSelectable,
  selection,
  setSelection,
}: {
  data: TData[]
  getRowId: ((row: TData, index: number) => string) | undefined
  selectable: boolean
  isRowSelectable: ((row: TData) => boolean) | undefined
  selection: DataTableRowSelection
  setSelection: SetSelection
}) {
  const ids = useMemo(
    () => (selectable ? data.map((row, index) => (getRowId ? getRowId(row, index) : String(index))) : NO_IDS),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by data, like TanStack's row model
    [data, selectable],
  )
  const eligibleIds = useMemo(
    () => (selectable && isRowSelectable ? new Set(ids.filter((_, index) => isRowSelectable(data[index]!))) : null),
    [selectable, data, ids, isRowSelectable],
  )
  const selectionMap = useMemo(() => {
    if (!selectable) return {}
    const map = toSelectionMap(selection, ids)
    if (eligibleIds) for (const id of ids) if (!eligibleIds.has(id)) delete map[id]
    return map
  }, [selection, ids, selectable, eligibleIds])

  const onRowSelectionChange = (updater: Updater<RowSelectionState>) => {
    const next = functionalUpdate(updater, selectionMap as RowSelectionState)
    setSelection((current) => fromSelectionMap(next, current, ids))
  }

  return { ids, eligibleIds, selectionMap, onRowSelectionChange }
}

/**
 * Server mode: the data of selected rows, kept from when they were loaded. A
 * row can only be ticked while it is on screen, so its data was at hand then;
 * holding it lets an `ids` selection outlive its page (another page, a new
 * search) and still be exported without asking the backend.
 */
export function useHeldRows<TData extends RowData>({
  server,
  selection,
  ids,
  data,
}: {
  server: boolean
  selection: DataTableRowSelection
  /** The loaded rows' ids, index for index with `data`. */
  ids: readonly string[]
  data: TData[]
}) {
  const held = useRef(new Map<string, TData>())
  useLayoutEffect(() => {
    const rows = held.current
    if (!server || selection.type !== 'ids' || !selection.ids.length) return rows.clear()
    const selected = new Set(selection.ids)
    for (const id of rows.keys()) if (!selected.has(id)) rows.delete(id)
    ids.forEach((id, index) => {
      if (selected.has(id)) rows.set(id, data[index]!)
    })
  }, [server, selection, ids, data])
  return held
}

/**
 * Everything the grid shows and does about row selection once the rows are
 * known: the counts, the header checkbox's state and step, select-all, and the
 * rules that keep a selection valid — removed rows leave it, a page-scoped one
 * resets with the view, and an "all matching" one resets with the filters,
 * the grid's own or the selection's `scopeKey` (it, and its exclusions,
 * describe a result that no longer exists). Ids picked one by one stay.
 */
export function useSelectionView<TData extends RowData>({
  selectable,
  isRowSelectable,
  server,
  restricted,
  scope,
  selection,
  setSelection,
  model,
  allRows,
  pageRows,
  total,
  view,
}: {
  selectable: boolean
  isRowSelectable: ((row: TData) => boolean) | undefined
  server: boolean
  /** Server rows with `isRowSelectable`: explicit ids only. */
  restricted: boolean
  scope: 'page' | 'crossPage'
  selection: DataTableRowSelection
  setSelection: SetSelection
  model: ReturnType<typeof useSelectionModel<TData>>
  /** Every filtered, sorted row (client), or the server's page. */
  allRows: Array<GridRow<TData>>
  /** The rows on screen. */
  pageRows: Array<GridRow<TData>>
  /** How many selectable rows match in all (server: `rowCount`, or the backend's count of eligible rows). */
  total: number
  /** What a selection resets with. `scopeKey`: the query's filters outside the grid. */
  view: {
    pageIndex: number
    pageLength: number
    sorting: SortingState
    columnFilters: ColumnFiltersState
    scopeKey: string | undefined
  }
}) {
  const { ids, eligibleIds, selectionMap } = model
  const eligible = useCallback((row: GridRow<TData>) => isRowSelectable?.(row.original) ?? true, [isRowSelectable])

  // The predicate itself, not row.getCanSelect(): the row models don't change with it.
  const matchingIds = useMemo(
    () => (server || !selectable ? null : new Set(allRows.filter(eligible).map((row) => row.id))),
    [allRows, server, selectable, eligible],
  )
  const pageIds = useMemo(
    () => (selectable ? pageRows.filter(eligible).map((row) => row.id) : NO_IDS),
    [pageRows, selectable, eligible],
  )
  const selectableTotal = matchingIds?.size ?? total

  // Rows removed on the client, and loaded server rows that became ineligible, leave the selection.
  useLayoutEffect(() => {
    if (!selectable || selection.type !== 'ids' || !selection.ids.length) return
    const present = new Set(ids)
    const next = selection.ids.filter((id) => (!present.has(id) ? server : !eligibleIds || eligibleIds.has(id)))
    if (!sameIds(next, selection.ids)) setSelection({ type: 'ids', ids: next })
  }, [server, selectable, selection, ids, eligibleIds, setSelection])

  const previousView = useRef(view)
  useLayoutEffect(() => {
    const previous = previousView.current
    if (previous === view) return
    previousView.current = view
    const filtersChanged =
      previous.scopeKey !== view.scopeKey ||
      previous.columnFilters.length !== view.columnFilters.length ||
      previous.columnFilters.some((filter, i) => filter.id !== view.columnFilters[i]?.id || !Object.is(filter.value, view.columnFilters[i]?.value))
    const sortChanged =
      previous.sorting.length !== view.sorting.length ||
      previous.sorting.some((sort, i) => sort.id !== view.sorting[i]?.id || sort.desc !== view.sorting[i]?.desc)
    const pageChanged = previous.pageIndex !== view.pageIndex || previous.pageLength !== view.pageLength
    if (
      (scope === 'page' && (pageChanged || sortChanged || filtersChanged)) ||
      (filtersChanged && selection.type === 'allMatching')
    ) {
      setSelection(NO_SELECTION)
    }
  }, [view, scope, selection.type, setSelection])

  const selectedRowCount = selectable ? selectedCount(selection, selectableTotal, matchingIds) : 0
  const hiddenSelectedRows =
    selectable && matchingIds && selection.type === 'ids' ? selection.ids.filter((id) => !matchingIds.has(id)).length : 0
  const offPageSelectedRows = useMemo(() => {
    if (!selectable || !server || selection.type !== 'ids') return 0
    const loaded = new Set(ids)
    return selection.ids.filter((id) => !loaded.has(id)).length
  }, [selectable, server, selection, ids])
  const headerState: HeaderSelection = selectable
    ? headerSelection({
        selection,
        pageIds,
        isSelected: (id) => selectionMap[id] === true,
        matchingIds,
        total: selectableTotal,
        scope: restricted ? 'page' : scope,
      })
    : 'none'

  const selectAllMatching = useCallback(() => {
    if (!restricted) setSelection({ type: 'allMatching', excludedIds: [] })
  }, [setSelection, restricted])
  const clearSelection = useCallback(() => setSelection(NO_SELECTION), [setSelection])
  /** Adds the page's eligible rows to the selection. */
  const selectPage = () =>
    setSelection((current) =>
      current.type === 'allMatching'
        ? { type: 'allMatching', excludedIds: current.excludedIds.filter((id) => !pageIds.includes(id)) }
        : { type: 'ids', ids: [...new Set([...current.ids, ...pageIds])] },
    )

  /** The header checkbox's step: this page, then every matching row, then none. */
  const advance = () => {
    if (headerState === 'all') {
      if (restricted && selection.type === 'ids') {
        const page = new Set(pageIds)
        return setSelection({ type: 'ids', ids: selection.ids.filter((id) => !page.has(id)) })
      }
      return clearSelection()
    }
    if (headerState === 'page' && scope === 'crossPage') return selectAllMatching()
    selectPage()
  }

  /** Ctrl+A: every matching row (cross-page), else this page. */
  const selectAll = () => {
    if (scope === 'page') setSelection({ type: 'ids', ids: pageIds })
    else if (!restricted) selectAllMatching()
    // Restricted server rows: explicit ids only, so add this page's to the other pages'.
    else selectPage()
  }

  return {
    matchingIds,
    pageIds,
    selectableTotal,
    selectedRowCount,
    hiddenSelectedRows,
    offPageSelectedRows,
    headerState,
    selectAllMatching,
    clearSelection,
    advance,
    selectAll,
  }
}
