import type { RowSelectionState } from '@tanstack/react-table'
import type { DataTableRowSelection } from '../state'

export const NO_SELECTION: DataTableRowSelection = { type: 'ids', ids: [] }

/** What the header checkbox shows: the page on screen, or `all` once every matching row is selected. */
export type HeaderSelection = 'all' | 'page' | 'some' | 'none'

/**
 * The selection as TanStack's `{ [rowId]: true }` map, for the rows DataTable
 * holds. `ids` maps one to one (ids on other pages included, so toggling a row
 * keeps them); `allMatching` expands over `matchingIds` minus the exclusions.
 */
export function toSelectionMap(selection: DataTableRowSelection, matchingIds: readonly string[]): RowSelectionState {
  const map: RowSelectionState = {}
  if (selection.type === 'ids') {
    for (const id of selection.ids) map[id] = true
    return map
  }
  const excluded = new Set(selection.excludedIds)
  for (const id of matchingIds) if (!excluded.has(id)) map[id] = true
  return map
}

/**
 * TanStack's next map, back into the model. Under `allMatching` a row toggled
 * off joins `excludedIds` and one toggled on leaves it; rows DataTable does not
 * hold keep their state.
 */
export function fromSelectionMap(
  next: RowSelectionState,
  previous: DataTableRowSelection,
  matchingIds: readonly string[],
): DataTableRowSelection {
  if (previous.type === 'allMatching') {
    const excluded = new Set(previous.excludedIds)
    for (const id of matchingIds) {
      if (next[id]) excluded.delete(id)
      else excluded.add(id)
    }
    return { type: 'allMatching', excludedIds: [...excluded] }
  }
  return { type: 'ids', ids: Object.keys(next).filter((id) => next[id]) }
}

/**
 * How many rows are selected. `ids`: each id counts, on any page.
 * `allMatching`: the matching rows minus the exclusions — on the client only
 * exclusions still matching the filters count against it.
 */
export function selectedCount(
  selection: DataTableRowSelection,
  matchingCount: number,
  matchingIds: ReadonlySet<string> | null,
): number {
  if (selection.type === 'ids') return selection.ids.length
  const excluded = matchingIds
    ? selection.excludedIds.filter((id) => matchingIds.has(id)).length
    : selection.excludedIds.length
  return Math.max(matchingCount - excluded, 0)
}

/**
 * The header checkbox. It describes the page on screen — none, some, or the
 * whole page — and turns `all` once every matching row is selected: the
 * allMatching selection without exclusions, or, on the client, every matching
 * id. With `scope: 'page'` a full page already is everything selectable.
 */
export function headerSelection(options: {
  selection: DataTableRowSelection
  pageIds: readonly string[]
  isSelected: (id: string) => boolean
  matchingIds: ReadonlySet<string> | null
  /** How many rows match in all (server mode: `rowCount`). */
  total: number
  scope: 'page' | 'crossPage'
}): HeaderSelection {
  const { selection, pageIds, isSelected, matchingIds, total, scope } = options
  const onPage = pageIds.filter(isSelected).length
  if (pageIds.length === 0 || onPage === 0) return 'none'
  if (onPage < pageIds.length) return 'some'
  // The page is every matching row: nothing more to select.
  if (scope === 'page' || pageIds.length >= total) return 'all'

  if (selection.type === 'allMatching') {
    const excludedMatching = matchingIds
      ? selection.excludedIds.some((id) => matchingIds.has(id))
      : selection.excludedIds.length > 0
    return excludedMatching ? 'page' : 'all'
  }
  if (matchingIds) {
    for (const id of matchingIds) if (!isSelected(id)) return 'page'
    return 'all'
  }
  return 'page'
}
