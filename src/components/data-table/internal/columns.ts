import type { Column, RowData } from '@tanstack/react-table'
import { cssAttributeValue } from '../../../lib/css'
import type { DataTableFeatures } from '../features'

type AnyColumn<TData extends RowData> = Column<DataTableFeatures, TData, unknown>

/**
 * The class every cell, header and selection band of a column carries. Its
 * width is one rule in the grid's width stylesheet (`widthStyleSheet`): a
 * resize rewrites the rules, and the browser restyles only the cells of the
 * columns whose rule changed. Variables on the grid root would be inherited by
 * every cell, so any width change would restyle the whole grid — four to five
 * times the work on a 100-column grid. Ids of any characters map to distinct
 * class names.
 */
export function columnClass(columnId: string): string {
  return `dt-c-${Array.from(columnId, (char) => (/^[a-zA-Z0-9-]$/.test(char) ? char : `_${char.codePointAt(0)!.toString(16)}_`)).join('')}`
}

/** The row-width class: the rows and strips that span every column. */
export const ROW_WIDTH_CLASS = 'dt-w'

/**
 * The grid's widths as a stylesheet, scoped to one grid: a `flex` per column
 * and the row width. Rendered in a `<style>`, so the server render has them too.
 */
export function widthStyleSheet(
  gridId: string,
  columns: ReadonlyArray<{ id: string; flex: string }>,
  rowWidth: string,
): string {
  const scope = `[data-dt="${cssAttributeValue(gridId)}"]`
  let css = `${scope} .${ROW_WIDTH_CLASS}{width:max(${rowWidth},100%)}`
  for (const column of columns) css += `\n${scope} .${columnClass(column.id)}{flex:${column.flex}}`
  return css
}

/**
 * The leaf column ids of a set of definitions, by TanStack's rule: `id`, else
 * `accessorKey` with dots as underscores, else a string `header`. Groups
 * contribute their leaves. Lets state that precedes the table instance (a
 * stored layout) know the columns.
 */
export function columnDefIds(defs: ReadonlyArray<ColumnDefLike>): string[] {
  return columnDefLeaves(defs).map((leaf) => leaf.id)
}

type ColumnDefLike = {
  id?: string
  accessorKey?: unknown
  header?: unknown
  columns?: unknown
  size?: number
  minSize?: number
  maxSize?: number
}

/** A leaf column definition's id and size settings, read without building the table. */
export type ColumnDefLeaf = { id: string; size?: number; minSize?: number; maxSize?: number }

/** Every leaf column definition, groups flattened, with its id by TanStack's rule. */
export function columnDefLeaves(defs: ReadonlyArray<ColumnDefLike>): ColumnDefLeaf[] {
  return defs.flatMap((def): ColumnDefLeaf[] => {
    if (Array.isArray(def.columns)) return columnDefLeaves(def.columns as ColumnDefLike[])
    const id =
      def.id ?? (def.accessorKey === undefined ? undefined : String(def.accessorKey).replaceAll('.', '_')) ??
      (typeof def.header === 'string' ? def.header : undefined)
    return id === undefined ? [] : [{ id, size: def.size, minSize: def.minSize, maxSize: def.maxSize }]
  })
}

/** A column's human name: `meta.label`, else a string `header`, else its id. */
export function columnLabel<TData extends RowData>(column: AnyColumn<TData>): string {
  const { meta, header } = column.columnDef
  if (meta?.label) return meta.label
  return typeof header === 'string' ? header : column.id
}

/** Whether the user may drag or move this column. */
export function columnCanMove<TData extends RowData>(column: AnyColumn<TData>): boolean {
  return column.columnDef.meta?.reorderable !== false
}

/**
 * Every leaf column id in display order: ids named in `columnOrder` first, the
 * rest in definition order — the same rule TanStack applies.
 */
export function orderedColumnIds(allIds: string[], columnOrder: string[]): string[] {
  const known = new Set(allIds)
  const ordered = columnOrder.filter((id) => known.has(id))
  const placed = new Set(ordered)
  return [...ordered, ...allIds.filter((id) => !placed.has(id))]
}

/**
 * Moves `id` so it sits before `beforeId` (or last, for `null`). Columns in
 * `fixed` keep their index: only the movable columns shuffle around them, so an
 * actions column marked `meta.reorderable: false` stays put.
 */
export function moveColumn(
  order: string[],
  id: string,
  beforeId: string | null,
  fixed: ReadonlySet<string>,
): string[] {
  const movable = order.filter((columnId) => !fixed.has(columnId) && columnId !== id)

  let insertAt = movable.length
  const start = beforeId === null ? -1 : order.indexOf(beforeId)
  if (start !== -1) {
    // Inserting before a fixed column means before the next movable one after it.
    const anchor = order.slice(start).find((columnId) => !fixed.has(columnId) && columnId !== id)
    if (anchor !== undefined) insertAt = movable.indexOf(anchor)
  }
  movable.splice(insertAt, 0, id)

  let next = 0
  return order.map((columnId) => (fixed.has(columnId) ? columnId : movable[next++]!))
}
