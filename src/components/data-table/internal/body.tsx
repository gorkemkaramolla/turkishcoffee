'use client'

import { memo, useCallback, useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react'
import { List, type RowComponentProps } from 'react-window'
import { FlexRender, type Cell, type Row, type RowData } from '@tanstack/react-table'
import { cn } from '../../../lib/cn'
import { tableCellPaddingClass, tableRowClass, tableRowStripeClass } from '../../table/internal/styles'
import { ROW_WIDTH_CLASS, columnClass } from './columns'
import { columnSlots } from './column-slots'
import type { DataTableFeatures } from '../features'
import type { ColumnWindow } from './grid'
import { SELECT_COLUMN_ID } from './selection'
import { suspendTabStops, cellId, type CellPosition } from './use-grid-navigation'

type GridRow<TData extends RowData> = Row<DataTableFeatures, TData>

export type BodyProps<TData extends RowData> = {
  rows: Array<GridRow<TData>>
  /** `aria-rowindex` of the first row: header rows plus the rows on earlier pages, 1-based. */
  firstRowIndex: number
  rowHeight: number
  onRowClick?: (row: TData) => void
  /**
   * Not read — here to break the memo when cells must re-render although the
   * rows did not change: new column definitions, or a new order/visibility.
   */
  columns: unknown
  columnsKey: string
  /** Not read either — a new selection re-renders the body, and each row checks its own. */
  rowSelection: unknown
  /** The columns to render, under column virtualization; null for all. */
  columnWindow: ColumnWindow | null
  /** The active cell (keyboard navigation), and the prefix of its id for `aria-activedescendant`. */
  active: CellPosition
  idPrefix: string
}

/**
 * Every row in normal flow. Memoized so a resize drag, which only rewrites the
 * width variables on the grid root, never re-renders the rows.
 */
export const FlowBody = memo(function FlowBody<TData extends RowData>({
  rows,
  firstRowIndex,
  rowHeight,
  onRowClick,
  columns,
  columnsKey,
  columnWindow,
  active,
  idPrefix,
}: BodyProps<TData>) {
  return rows.map((row, index) => (
    <DataRow
      key={row.id}
      row={row}
      rowIndex={firstRowIndex + index}
      onRowClick={onRowClick}
      selected={row.getIsSelected()}
      columnsKey={columnsKey}
      columns={columns}
      columnWindow={columnWindow}
      activeColumn={active.row === firstRowIndex + index ? active.col : null}
      idPrefix={idPrefix}
      className="last:border-b-0"
      style={{ height: rowHeight }}
    />
  ))
}) as <TData extends RowData>(props: BodyProps<TData>) => React.ReactNode

/**
 * The rows through react-window: only the visible ones (plus overscan) are in
 * the DOM. `List` is the scroll container; the header lives outside it and
 * mirrors its horizontal scroll.
 *
 * Memoized like FlowBody. react-window also compares `rowProps` by identity,
 * so it is rebuilt only when a field changes; a fresh object per render would
 * make it redraw every visible row on each mouse move of a resize.
 */
export const VirtualBody = memo(function VirtualBody<TData extends RowData>({
  height,
  listRef,
  onScroll,
  rows,
  firstRowIndex,
  rowHeight,
  onRowClick,
  columns,
  columnsKey,
  rowSelection,
  columnWindow,
  active,
  idPrefix,
  listApiRef,
}: BodyProps<TData> & {
  /** react-window's handle, for scrolling a row into view. */
  listApiRef: React.RefObject<ListApi | null>
  height: number
  /** Called with the scrolling element once react-window has it (a render after mount). */
  listRef: (element: HTMLDivElement | null) => void
  onScroll: React.UIEventHandler<HTMLDivElement>
}) {
  const rowProps = useMemo(
    () => ({ rows, firstRowIndex, rowHeight, onRowClick, columns, columnsKey, rowSelection, columnWindow, active, idPrefix }),
    [rows, firstRowIndex, rowHeight, onRowClick, columns, columnsKey, rowSelection, columnWindow, active, idPrefix],
  )
  const setList = useCallback(
    (api: ListApi | null) => {
      listRef(api?.element ?? null)
      listApiRef.current = api
    },
    [listRef, listApiRef],
  )
  const retainedIndex = active.row - firstRowIndex
  return (
    <List
      role="rowgroup"
      data-dt-body=""
      listRef={setList}
      rowComponent={VirtualRow as (props: RowComponentProps<BodyProps<RowData>>) => React.ReactElement}
      rowProps={rowProps as unknown as BodyProps<RowData>}
      rowCount={rows.length}
      rowHeight={rowHeight}
      rowKey={rowKey}
      overscanCount={8}
      defaultHeight={height}
      onScroll={onScroll}
      style={{ height, overflow: 'auto' }}
    >
      {/*
        The active row stays mounted wherever the list has scrolled, so
        aria-activedescendant never points at a removed element. VirtualRow
        leaves an empty slot in its place.
      */}
      {retainedIndex >= 0 && retainedIndex < rows.length && (
        <DataRow
          row={rows[retainedIndex]!}
          rowIndex={active.row}
          onRowClick={onRowClick}
          selected={rows[retainedIndex]!.getIsSelected()}
          columnsKey={columnsKey}
          columns={columns}
          columnWindow={columnWindow}
          activeColumn={active.col}
          idPrefix={idPrefix}
          style={{
            position: 'absolute',
            insetInlineStart: 0,
            top: 0,
            transform: `translateY(${retainedIndex * rowHeight}px)`,
            height: rowHeight,
          }}
        />
      )}
    </List>
  )
}) as <TData extends RowData>(
  props: BodyProps<TData> & {
    listApiRef: React.RefObject<ListApi | null>
    height: number
    listRef: (element: HTMLDivElement | null) => void
    onScroll: React.UIEventHandler<HTMLDivElement>
  },
) => React.ReactNode

function rowKey(index: number, { rows }: BodyProps<RowData>): string {
  return rows[index]!.id
}

function VirtualRow<TData extends RowData>({
  index,
  style,
  rows,
  firstRowIndex,
  onRowClick,
  columns,
  columnsKey,
  columnWindow,
  active,
  idPrefix,
}: RowComponentProps<BodyProps<TData>>) {
  const row = rows[index]!
  // react-window places rows with a physical `left: 0`; in RTL that pushes them
  // into the overflow on the right, which cannot be scrolled to. Anchor them to
  // the inline start instead, like the retained active row.
  const placed = { ...style, left: undefined, insetInlineStart: 0 }
  if (active.row === firstRowIndex + index) return <div aria-hidden="true" style={placed} />
  return (
    <DataRow
      row={row}
      rowIndex={firstRowIndex + index}
      onRowClick={onRowClick}
      selected={row.getIsSelected()}
      columnsKey={columnsKey}
      columns={columns}
      columnWindow={columnWindow}
      activeColumn={active.row === firstRowIndex + index ? active.col : null}
      idPrefix={idPrefix}
      // The row's width comes from the grid's width rules, not react-window's 100%.
      style={{ ...placed, width: undefined }}
    />
  )
}

type DataRowProps<TData extends RowData> = {
  row: GridRow<TData>
  /** 1-based, across header rows and earlier pages. */
  rowIndex: number
  onRowClick?: (row: TData) => void
  selected: boolean
  /** Not read: a new column order, visibility or definition re-renders the row. */
  columnsKey: string
  columns: unknown
  columnWindow: ColumnWindow | null
  /** aria-colindex of the active cell when it is on this row. */
  activeColumn: number | null
  idPrefix: string
  className?: string
  style?: CSSProperties
}

/**
 * One row. Memoized on what it shows, so selecting a row — or all 10,000 —
 * re-renders only the rendered rows whose selection changed. react-window
 * hands every row a new `style` object; only its position and size count.
 */
const DataRow = memo(DataRowView, (previous, next) => {
  return (
    previous.row === next.row &&
    previous.selected === next.selected &&
    previous.rowIndex === next.rowIndex &&
    previous.columnsKey === next.columnsKey &&
    previous.columns === next.columns &&
    sameWindow(previous.columnWindow, next.columnWindow) &&
    previous.activeColumn === next.activeColumn &&
    previous.onRowClick === next.onRowClick &&
    previous.className === next.className &&
    previous.style?.transform === next.style?.transform &&
    previous.style?.height === next.style?.height &&
    previous.idPrefix === next.idPrefix
  )
}) as <TData extends RowData>(props: DataRowProps<TData>) => React.ReactNode

function DataRowView<TData extends RowData>({
  row,
  rowIndex,
  onRowClick,
  selected,
  columnWindow,
  activeColumn,
  idPrefix,
  className,
  style,
}: DataRowProps<TData>) {
  // The grid is one tab stop: buttons and links inside cells leave the tab
  // order (F2 brings a cell's controls back while working in it).
  const rowRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => suspendTabStops(rowRef.current))
  const cells = row.getVisibleCells()
  return (
    <div
      ref={rowRef}
      role="row"
      aria-rowindex={rowIndex}
      aria-selected={row.table.options.enableRowSelection === false ? undefined : selected}
      data-state={selected ? 'selected' : undefined}
      data-stripe={rowIndex % 2 === 0 ? 'odd' : 'even'}
      onClick={
        onRowClick
          ? (event) => {
              // Clicks from inside portals (a row's dropdown menu) bubble here through React too.
              if (!event.currentTarget.contains(event.target as Node)) return
              if ((event.target as Element).closest('button, a, input, select, textarea, label')) return
              onRowClick(row.original)
            }
          : undefined
      }
      className={cn(
        'group/row flex text-sm',
        ROW_WIDTH_CLASS,
        tableRowClass,
        tableRowStripeClass,
        onRowClick && 'cursor-pointer',
        className,
      )}
      style={style}
    >
      {columnSlots(cells, columnWindow, (cell) => cell.column.id, (cell, index) => (
        <GridCell
          key={cell.id}
          cell={cell}
          colIndex={index + 1}
          activeId={activeColumn === index + 1 ? cellId(idPrefix, { row: rowIndex, col: activeColumn }) : null}
          selected={selected}
        />
      ))}
      <div aria-hidden="true" className="flex-1" />
    </div>
  )
}

type GridCellProps<TData extends RowData> = {
  cell: Cell<DataTableFeatures, TData, unknown>
  /** 1-based position among the visible columns (`aria-colindex`). */
  colIndex: number
  /** Set on the active cell: its id, for `aria-activedescendant`. */
  activeId: string | null
  /** Not read: a cell renderer may show the row's selection (the checkbox does). */
  selected: boolean
}

/**
 * One cell, memoized: TanStack keeps a cell object while its row and column
 * stand, so when a row re-renders — the column window moved, the active cell
 * moved — only the cells that changed render again, not every renderer in it.
 */
const GridCell = memo(function GridCell<TData extends RowData>({ cell, colIndex, activeId }: GridCellProps<TData>) {
  const { column } = cell
  return (
    <div
      role="gridcell"
      aria-colindex={colIndex}
      id={activeId ?? undefined}
      data-active={activeId ? '' : undefined}
      data-col={column.id}
      onPointerEnter={titleIfTruncated}
      className={cn(
        'flex min-w-0 items-center',
        columnClass(column.id),
        activeCellClass,
        column.id === SELECT_COLUMN_ID ? 'justify-center px-0' : tableCellPaddingClass,
        'transition-[translate] duration-150 ease-out in-data-settling:transition-none',
        column.columnDef.meta?.align === 'end' && 'justify-end text-end tabular-nums',
        column.columnDef.meta?.cellClassName,
      )}
      // A header drag slides this cell aside by setting `translate` directly.
    >
      {/* p-1/-m-1 leaves room for a focus ring inside the clipped span; p-2 for the checkbox's 32px target. */}
      <span data-cell-content="" className={cn('-m-1 min-w-0 truncate p-1', column.id === SELECT_COLUMN_ID && '-m-2 p-2')}>
        <FlexRender cell={cell} />
      </span>
    </div>
  )
}) as <TData extends RowData>(props: GridCellProps<TData>) => React.ReactNode

/** The active cell's outline, shown while the grid has keyboard focus. */
export const activeCellClass =
  'in-focus-visible:data-active:outline-2 in-focus-visible:data-active:-outline-offset-2 in-focus-visible:data-active:outline-ring'

/** react-window's List handle: its element, and scrolling a row into view. */
export type ListApi = {
  readonly element: HTMLDivElement | null
  scrollToRow: (config: { index: number; align?: 'auto' | 'center' | 'end' | 'smart' | 'start'; behavior?: 'auto' | 'instant' | 'smooth' }) => void
}

function sameWindow(a: ColumnWindow | null, b: ColumnWindow | null): boolean {
  return a === b || (!!a && !!b && a.start === b.start && a.end === b.end && String(a.retained) === String(b.retained) && String(a.gaps) === String(b.gaps))
}

/** Shows the full text as a tooltip only when the cell is cut off. */
function titleIfTruncated(event: React.PointerEvent<HTMLElement>) {
  const cell = event.currentTarget
  const content = cell.firstElementChild as HTMLElement | null
  if (content && content.scrollWidth > content.clientWidth) cell.title = content.textContent ?? ''
  else cell.removeAttribute('title')
}
