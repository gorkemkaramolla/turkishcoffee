import { useCallback, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import type { Column, ColumnSizingState, ColumnVisibilityState, ReactTable, Row, RowData, Updater } from '@tanstack/react-table'
import type { DataTableFeatures } from '../features'
import {
  CELL_PADDING,
  estimateColumnWidth,
  lockedEdgeIds,
  measureColumnWidths,
  resizeWithin,
  type FitColumn,
} from './autofit'
import { columnCanMove, columnLabel, type ColumnDefLeaf } from './columns'
import type { DataTableLayout } from './use-persisted-layout'
import {
  DEFAULT_SIZE,
  ESTIMATE_SAMPLE,
  MAX_SIZE,
  MIN_SIZE,
  NO_SIZING,
  clampSize,
  estimateText,
  fillWidth,
  isAuto,
  sameWidths,
} from './widths'

type GridTable<TData extends RowData> = ReactTable<DataTableFeatures, TData>
type GridColumn<TData extends RowData> = Column<DataTableFeatures, TData, unknown>

/** After the last scroll event, how long until columns that scrolled into view are measured. */
const SCROLL_IDLE_MS = 150

/** Content-fitted widths of the automatic columns: derived from the content, never the user's state. */
type Fit = { natural: ColumnSizingState; measured: boolean }
/** The scroller's box: the width the columns stretch over, and its vertical scrollbar. */
type Box = { available: number; scrollbar: number }

/**
 * The widths the grid shows, before the table exists: the user's, else the
 * fitted ones, stretched so the row reaches the frame's edge. A user-resized
 * automatic column stays automatic — its width still stretches with the
 * container, as on the server render. With `autoSize={false}` every column
 * has a fixed size and nothing stretches.
 */
export function useColumnSizing({
  leaves,
  visibility,
  userSizing,
  autoSize,
}: {
  leaves: readonly ColumnDefLeaf[]
  visibility: ColumnVisibilityState
  userSizing: ColumnSizingState
  autoSize: 'initial' | 'data' | false
}) {
  const [fit, setFit] = useState<Fit>({ natural: NO_SIZING, measured: false })
  const [box, setBox] = useState<Box>({ available: 0, scrollbar: 0 })
  /** Reads an element's box into state (a no-op while it is unchanged). */
  const readBox = useCallback((element: HTMLElement | null) => {
    if (!element) return
    const available = element.clientWidth
    const scrollbar = element.offsetWidth - element.clientWidth
    setBox((current) => (current.available === available && current.scrollbar === scrollbar ? current : { available, scrollbar }))
  }, [])
  const columnSizing = useMemo(
    () =>
      fillWidth(
        autoSize === false ? leaves.map((leaf) => ({ ...leaf, size: leaf.size ?? DEFAULT_SIZE })) : leaves,
        visibility,
        { ...fit.natural, ...userSizing },
        box.available,
      ),
    [leaves, visibility, fit.natural, userSizing, box.available, autoSize],
  )
  return { columnSizing, fit, setFit, box, readBox }
}

/**
 * Fitting and resizing, once the table exists.
 *
 * - Automatic columns are fitted to their rendered content before the first
 *   paint (estimated from their text on the server), then kept: `autoSize`
 *   `'initial'` keeps them across data changes, `'data'` refits on new data.
 * - Content widths are cached per content. A column is measured once — not
 *   again when another column is resized, hidden or moved, and not on every
 *   key press of a keyboard resize (the cache gives the others' floors).
 * - Under column virtualization, columns that scroll into view are measured
 *   once scrolling pauses, so a scroll never forces a layout of every cell.
 * - Resizing follows the splitter rule (`resizeWithin`).
 */
export function useColumnFitting<TData extends RowData>({
  table,
  frameRef,
  scrollerRef,
  scroller,
  sizing,
  userSizing,
  setUserSizing,
  autoSize,
  data,
  columns,
  size,
  sampleRows,
  features,
  window,
  savedAutoSizing,
  persistAutoSizing,
}: {
  table: GridTable<TData>
  frameRef: RefObject<HTMLElement | null>
  scrollerRef: RefObject<HTMLElement | null>
  /** The scroller as state: react-window hands it over a render after mounting. */
  scroller: HTMLElement | null
  sizing: ReturnType<typeof useColumnSizing>
  userSizing: ColumnSizingState
  setUserSizing: (updater: Updater<ColumnSizingState>) => void
  autoSize: 'initial' | 'data' | false
  data: TData[]
  /** The column definitions: new ones are new content. */
  columns: unknown
  size: 'sm' | 'md'
  /** Rows to estimate from: the first page. */
  sampleRows: Array<Row<DataTableFeatures, TData>>
  features: { sortable: boolean; filterable: boolean; hideable: boolean; resizable: boolean; reorderable: boolean }
  /** The rendered column indexes under column virtualization; null when all render. */
  window: { start: number; end: number; retained?: readonly number[] } | null
  /** Content widths saved with the layout, for the server render. */
  savedAutoSizing: DataTableLayout['columnAutoSizing']
  /** Saves fresh content widths with the layout; undefined when nothing keeps it. */
  persistAutoSizing: ((widths: ColumnSizingState) => void) | undefined
}) {
  const { fit, setFit, box } = sizing
  const tableRef = useRef(table)
  useLayoutEffect(() => {
    tableRef.current = table
  })

  const visibleColumns = table.getVisibleLeafColumns()
  const automatic = (column: GridColumn<TData>) => isAuto(column.columnDef.size) && !(column.id in userSizing)
  // Sorted: moving a column changes nothing to measure.
  const autoKey = visibleColumns.filter(automatic).map((column) => column.id).sort().join('\u0000')
  const columnsKey = visibleColumns.map((column) => column.id).join('\u0000')

  // What the content widths depend on. `'initial'` ignores new data.
  const sizingData = autoSize === 'data' ? data : null
  const content = useMemo(() => [sizingData, columns, size, autoSize], [sizingData, columns, size, autoSize])

  // The server can't measure: until the first measurement, automatic columns
  // start from widths estimated from their text (the label, a sample of rows),
  // or from the content widths saved with the layout.
  const estimatedWidths = useMemo(() => {
    if (autoSize === false) return NO_SIZING
    const sample = sampleRows.slice(0, ESTIMATE_SAMPLE)
    const widths: ColumnSizingState = {}
    for (const column of visibleColumns) {
      if (!automatic(column)) continue
      const def = column.columnDef
      const saved = savedAutoSizing?.[column.id]
      widths[column.id] = clampSize(
        saved ?? estimateColumnWidth(columnLabel(column), sampleValues(column, sample), headerChrome(column, features)),
        def.minSize,
        def.maxSize,
      )
    }
    return widths
    // Read once per content and column set; measuring takes over from there.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, columnsKey, features.sortable, features.filterable, features.hideable, features.resizable, features.reorderable])

  const clamp = useCallback((columnId: string, width: number) => {
    const def = tableRef.current.getColumn(columnId)?.columnDef
    return clampSize(width, def?.minSize, def?.maxSize)
  }, [])

  // Content widths by column id, for the current content.
  const cache = useRef<{ content: unknown[]; widths: ColumnSizingState }>({ content: [], widths: {} })
  const contentWidths = () => {
    if (cache.current.content !== content) cache.current = { content, widths: {} }
    return cache.current.widths
  }
  /** Measures the rendered ones of `ids` not yet known, into the cache. Returns whether any was measured. */
  const measureMissing = (ids: readonly string[]) => {
    const frame = frameRef.current
    const known = contentWidths()
    const missing = ids.filter((id) => !(id in known))
    if (!frame || !missing.length) return false
    let any = false
    for (const [id, width] of Object.entries(measureColumnWidths(frame, missing))) {
      if (width > 0) {
        known[id] = clamp(id, width)
        any = true
      }
    }
    return any
  }

  /** The natural widths of the automatic columns: measured, else estimated. */
  const commitNatural = (ids: readonly string[], measuredNow: boolean) => {
    const known = contentWidths()
    const natural: ColumnSizingState = {}
    for (const id of ids) natural[id] = known[id] ?? estimatedWidths[id] ?? clamp(id, DEFAULT_SIZE)
    setFit((current) =>
      current.measured && sameWidths(current.natural, natural) ? current : { natural, measured: true },
    )
    // Saved apart from manual sizes: the next server render starts from these proportions.
    if (measuredNow && persistAutoSizing && !sameWidths(savedAutoSizing ?? NO_SIZING, natural)) persistAutoSizing(natural)
  }

  const renderedIds = (ids: readonly string[]) => {
    if (!window) return ids
    const rendered = new Set<string>()
    const columns = tableRef.current.getVisibleLeafColumns()
    for (let index = window.start; index <= window.end; index++) if (columns[index]) rendered.add(columns[index]!.id)
    for (const index of window.retained ?? []) if (columns[index]) rendered.add(columns[index]!.id)
    return ids.filter((id) => rendered.has(id))
  }

  const readBox = sizing.readBox

  // Fit the automatic columns before the first paint, and again whenever the
  // content or the set of automatic columns changes. The box is read in the
  // same pass, so the first fit and stretch land in one commit.
  useLayoutEffect(() => {
    if (!frameRef.current) return
    const ids = autoKey ? autoKey.split('\u0000') : []
    const measuredNow = measureMissing(renderedIds(ids))
    commitNatural(ids, measuredNow)
    readBox(scrollerRef.current)
    // Runs on content and column changes only; `window` is handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoKey, content, estimatedWidths, scroller])

  // Columns that scroll into view: measured at once when the window moved for
  // another reason (a resize, keyboard navigation), after the scroll pauses
  // when the user is scrolling — a measurement mid-scroll would force a
  // layout of every rendered cell in the frame.
  const lastScroll = useRef(0)
  const noteScroll = useCallback(() => {
    lastScroll.current = performance.now()
  }, [])
  const windowKey = window ? `${window.start}:${window.end}:${window.retained?.join(',') ?? ''}` : ''
  useLayoutEffect(() => {
    if (!window || !fit.measured || !frameRef.current) return
    const ids = autoKey ? autoKey.split('\u0000') : []
    const pending = renderedIds(ids).filter((id) => !(id in contentWidths()))
    if (!pending.length) return
    const run = () => {
      if (measureMissing(renderedIds(ids))) commitNatural(ids, true)
    }
    const since = performance.now() - lastScroll.current
    if (since >= SCROLL_IDLE_MS) return run()
    const timer = setTimeout(run, SCROLL_IDLE_MS - since)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowKey, fit.measured])

  // The scroller's box. Content didn't change on a container resize: the
  // columns re-stretch without a re-measure.
  useLayoutEffect(() => {
    if (!scroller || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => readBox(scroller))
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [scroller, readBox])

  // ── Resizing ────────────────────────────────────────────────────────────

  /** The visible columns as the resize rules see them, at their current widths. */
  const fitColumns = (): FitColumn[] =>
    tableRef.current.getVisibleLeafColumns().map((column) => ({
      id: column.id,
      width: column.getSize(),
      min: column.columnDef.minSize ?? MIN_SIZE,
      max: column.columnDef.maxSize ?? MAX_SIZE,
      resizable: features.resizable && column.getCanResize(),
    }))

  // Where the column being dragged started: a drag is measured from there, so
  // going back and forth puts every column back where it was.
  const resizeStart = useRef<{ id: string; columns: FitColumn[] } | null>(null)

  /**
   * Gives a column a new width by the splitter rule: while the columns fit,
   * the others make or take the room, down to their content width, so the row
   * stays exactly as wide as the frame. Every width that moved becomes the user's.
   */
  const resizeColumn = (columnId: string, width: number) => {
    const current = tableRef.current
    const dragging = current.state.columnResizing.isResizingColumn === columnId
    let start = dragging ? resizeStart.current : null
    if (!start || start.id !== columnId) {
      const columns = fitColumns()
      const others = columns.filter((column) => column.resizable && column.id !== columnId).map((column) => column.id)
      measureMissing(others)
      const floors = contentWidths()
      start = { id: columnId, columns: columns.map((column) => ({ ...column, floor: floors[column.id] })) }
      if (dragging) resizeStart.current = start
    }
    const widths = resizeWithin(start.columns, columnId, width, scroller?.clientWidth ?? box.available)
    const natural = fit.natural
    const columns = start.columns
    setUserSizing((previous) => {
      const result = { ...previous }
      for (const column of columns) {
        const next = widths[column.id]!
        if (column.resizable && next !== (previous[column.id] ?? natural[column.id])) result[column.id] = next
      }
      return result
    })
  }
  const endResize = () => {
    resizeStart.current = null
  }

  /** Fits columns to their content: what renders, and a sample of the loaded values. */
  const autofit = (columnIds: string[]) => {
    const frame = frameRef.current
    if (!frame) return
    const current = tableRef.current
    const widths = measureColumnWidths(frame, columnIds)
    const sample = current.getCoreRowModel().rows.slice(0, ESTIMATE_SAMPLE)
    for (const id of columnIds) {
      const column = current.getColumn(id)
      if (!column) continue
      widths[id] = Math.max(widths[id] ?? 0, estimateColumnWidth(columnLabel(column), sample.map((row) => estimateText(row.getValue(id))), CELL_PADDING))
    }
    const [only] = columnIds
    if (columnIds.length === 1 && widths[only!] !== undefined) return resizeColumn(only!, clamp(only!, widths[only!]!))
    current.setColumnSizing((old) => {
      const next = { ...old }
      for (const id of columnIds) if (widths[id] !== undefined) next[id] = clamp(id, widths[id]!)
      return next
    })
  }

  const resizeBy = (columnId: string, delta: number) => {
    const column = tableRef.current.getColumn(columnId)
    if (column) resizeColumn(columnId, clamp(columnId, column.getSize() + delta))
  }

  // Edges that can't move while the columns fit (the last one sits on the frame): no handle.
  const lockedKey = features.resizable && box.available ? lockedEdgeIds(fitColumns(), box.available).join('\u0000') : ''
  const lockedEdges = useMemo(() => new Set(lockedKey ? lockedKey.split('\u0000') : []), [lockedKey])

  return { estimatedWidths, resizeColumn, endResize, autofit, resizeBy, lockedEdges, noteScroll }
}

/** The header's fixed parts: padding, then the sort arrow and the filter and menu buttons, with their gaps. */
function headerChrome<TData extends RowData>(
  column: GridColumn<TData>,
  features: { sortable: boolean; filterable: boolean; hideable: boolean; resizable: boolean; reorderable: boolean },
): number {
  const canSort = features.sortable && column.getCanSort()
  const canFilter = features.filterable && column.getCanFilter()
  const hasMenu =
    canSort || features.hideable || (features.resizable && column.getCanResize()) || (features.reorderable && columnCanMove(column))
  return CELL_PADDING + (canSort ? 18 : 0) + (canFilter ? 26 : 0) + (hasMenu ? 32 : 0)
}

/** A column's sampled values as shown, for the width estimate. */
function sampleValues<TData extends RowData>(column: GridColumn<TData>, sample: Array<Row<DataTableFeatures, TData>>): string[] {
  const exportValue = column.columnDef.meta?.exportValue as ((row: TData) => unknown) | undefined
  return sample.map((row) =>
    estimateText(exportValue ? exportValue(row.original) : column.accessorFn ? row.getValue(column.id) : ''),
  )
}
