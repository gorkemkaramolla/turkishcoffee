import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
  functionalUpdate,
  type ColumnFiltersState,
  type ReactTable,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Updater,
} from '@tanstack/react-table'
import type { DataTableFeatures } from '../features'
import type { DataTableRowSelection } from '../state'
import { selectedLoadedRows } from './export-columns'
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
 * Everything the grid shows and does about row selection once the rows are
 * known: the counts, the header checkbox's state and step, select-all, and the
 * rules that keep a selection valid — removed rows leave it, a page-scoped one
 * resets with the view, and a server "all matching" one resets with the
 * filters (its exclusions describe a result that no longer exists).
 */
export function useSelectionView<TData extends RowData>({
  table,
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
  onSelectionChange,
}: {
  table: ReactTable<DataTableFeatures, TData>
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
  /** How many rows match in all (server: `rowCount`). */
  total: number
  /** What a page-scoped selection resets with. */
  view: { pageIndex: number; pageLength: number; sorting: SortingState; columnFilters: ColumnFiltersState }
  /** The deprecated rows callback. */
  onSelectionChange: ((rows: TData[]) => void) | undefined
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
      previous.columnFilters.length !== view.columnFilters.length ||
      previous.columnFilters.some((filter, i) => filter.id !== view.columnFilters[i]?.id || !Object.is(filter.value, view.columnFilters[i]?.value))
    const sortChanged =
      previous.sorting.length !== view.sorting.length ||
      previous.sorting.some((sort, i) => sort.id !== view.sorting[i]?.id || sort.desc !== view.sorting[i]?.desc)
    const pageChanged = previous.pageIndex !== view.pageIndex || previous.pageLength !== view.pageLength
    if (
      (scope === 'page' && (pageChanged || sortChanged || filtersChanged)) ||
      (server && filtersChanged && selection.type === 'allMatching')
    ) {
      setSelection(NO_SELECTION)
    }
  }, [view, scope, server, selection.type, setSelection])

  const selectedRowCount = selectable ? selectedCount(selection, selectableTotal, matchingIds) : 0
  const hiddenSelectedRows =
    selectable && matchingIds && selection.type === 'ids' ? selection.ids.filter((id) => !matchingIds.has(id)).length : 0
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

  // The deprecated rows callback, kept for compatibility.
  const callback = useRef(onSelectionChange)
  const tableRef = useRef(table)
  useLayoutEffect(() => {
    callback.current = onSelectionChange
    tableRef.current = table
  })
  const reported = useRef(selection)
  useEffect(() => {
    if (reported.current === selection) return
    reported.current = selection
    callback.current?.(selectedLoadedRows(tableRef.current, selection).map((row) => row.original))
  }, [selection])

  return {
    matchingIds,
    pageIds,
    selectableTotal,
    selectedRowCount,
    hiddenSelectedRows,
    headerState,
    selectAllMatching,
    clearSelection,
    advance,
    selectAll,
  }
}
