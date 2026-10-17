'use client'

import { memo } from 'react'
import { FlexRender, type Column, type Header, type RowData } from '@tanstack/react-table'
import { cn } from '../../../lib/cn'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  AutofitWidthIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeOffIcon,
  XIcon,
} from '../../../lib/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../dropdown-menu/dropdown-menu'
import {
  ColumnFilterPopover,
  DateFilterPanel,
  NumberFilterPanel,
  OptionsFilterPanel,
  TextFilterPanel,
  type TableColumnFilterLabels,
} from '../../table/table-column-filter'
import { isDateRange, isNumberRange } from './filter'
import { tableCellPaddingClass, tableHeadTextClass } from '../../table/internal/styles'
import { columnCanMove, columnClass, columnLabel } from './columns'
import type { DataTableFeatures } from '../features'
import type { ColumnWindow, GridApi } from './grid'
import { ResizeHandle } from './resize-handle'
import { SELECT_COLUMN_ID } from './selection'
import type { ColumnScope } from './use-column-selection'
import { activeCellClass } from './body'
import { columnSlots } from './column-slots'
import { cellId } from './use-grid-navigation'

type GridHeader<TData extends RowData> = Header<DataTableFeatures, TData, unknown>
type GridColumn<TData extends RowData> = Column<DataTableFeatures, TData, unknown>

/**
 * The header row. Column groups are flattened: only leaf headers render.
 *
 * Each cell is memoized on what it shows — sort, filter, width, drag and
 * selection state — so resizing or dragging one column re-renders that one
 * header, not all of them.
 */
export function HeaderRow<TData extends RowData>({
  grid,
  headers,
  rowHeight,
  dragColumnId,
  multiSort,
  selectedColumns,
  selectableColumns,
  columnScope,
  allRowsSelection,
  menuColumnId,
  columnWindow,
  activeColumn,
  idPrefix,
  lockedEdges,
}: {
  grid: GridApi
  /** The leaf headers in display order (column groups are flattened). */
  headers: Array<GridHeader<TData>>
  rowHeight: number
  dragColumnId: string | null
  /** Several columns are sorted (Shift+click): headers show their priority. */
  multiSort: boolean
  selectedColumns: ReadonlySet<string>
  /** Columns a column selection can pick (data columns). */
  selectableColumns: ReadonlySet<string>
  columnScope: ColumnScope
  /** The header checkbox's state, so only that cell re-renders on a selection change. */
  allRowsSelection: 'all' | 'page' | 'some' | 'none'
  /** The column whose options menu is open. */
  menuColumnId: string | null
  /** The columns to render, under column virtualization; null for all. */
  columnWindow: ColumnWindow | null
  /** aria-colindex of the active cell when it is in the header row. */
  activeColumn: number | null
  idPrefix: string
  /** Columns whose right edge can't move (no resize handle). */
  lockedEdges: ReadonlySet<string>
}) {
  return (
    <>
      {grid.columnSelection && (
        // A pointer shortcut: keyboard and screen-reader users select columns
        // with Ctrl+Space on a header, which reports aria-selected.
        <div aria-hidden="true" className="flex border-b border-border">
          {columnSlots(headers, columnWindow, (header) => header.column.id, ({ column }) => (
            <SelectionStrip
              key={column.id}
              grid={grid}
              columnId={column.id}
              name={columnLabel(column)}
              selectable={selectableColumns.has(column.id)}
              selected={selectedColumns.has(column.id)}
              scope={columnScope}
            />
          ))}
          <div aria-hidden="true" className="flex-1" />
        </div>
      )}
      <HeaderCells
        grid={grid}
        headers={headers}
        rowHeight={rowHeight}
        dragColumnId={dragColumnId}
        multiSort={multiSort}
        selectedColumns={selectedColumns}
        selectableColumns={selectableColumns}
        allRowsSelection={allRowsSelection}
        menuColumnId={menuColumnId}
        columnWindow={columnWindow}
        activeColumn={activeColumn}
        idPrefix={idPrefix}
        lockedEdges={lockedEdges}
      />
    </>
  )
}

function HeaderCells<TData extends RowData>({
  grid,
  headers,
  rowHeight,
  dragColumnId,
  multiSort,
  selectedColumns,
  selectableColumns,
  allRowsSelection,
  menuColumnId,
  columnWindow,
  activeColumn,
  idPrefix,
  lockedEdges,
}: {
  grid: GridApi
  headers: Array<GridHeader<TData>>
  rowHeight: number
  dragColumnId: string | null
  multiSort: boolean
  selectedColumns: ReadonlySet<string>
  selectableColumns: ReadonlySet<string>
  allRowsSelection: 'all' | 'page' | 'some' | 'none'
  menuColumnId: string | null
  columnWindow: ColumnWindow | null
  activeColumn: number | null
  idPrefix: string
  lockedEdges: ReadonlySet<string>
}) {
  return (
    <div role="row" aria-rowindex={1} className="group/headers flex border-b border-border" style={{ height: rowHeight }}>
      {columnSlots(headers, columnWindow, (header) => header.column.id, (header, index) => {
        const { column } = header
        const sorted = column.getIsSorted()
        return (
          <HeaderCell
            key={header.id}
            grid={grid}
            header={header}
            columnIndex={index + 1}
            last={index === headers.length - 1}
            edgeLocked={lockedEdges.has(column.id)}
            sorted={sorted}
            sortPriority={sorted && multiSort ? column.getSortIndex() + 1 : null}
            filterValue={column.getFilterValue()}
            size={column.getSize()}
            resizing={column.getIsResizing()}
            dragging={dragColumnId === column.id}
            selectable={selectableColumns.has(column.id)}
            selected={selectedColumns.has(column.id)}
            rowSelection={column.id === SELECT_COLUMN_ID ? allRowsSelection : undefined}
            menuOpen={menuColumnId === column.id}
            activeId={activeColumn === index + 1 ? cellId(idPrefix, { row: 1, col: index + 1 }) : null}
          />
        )
      })}
      <div aria-hidden="true" className="flex-1" />
    </div>
  )
}

/**
 * A thin band above a header that selects its column (Excel's column letters,
 * without the letters). Separate from the header so a click on the name still
 * sorts. Faint when selected for this page, solid once widened to every row.
 * It carries `data-col`, so it slides with its column during a header drag.
 */
const SelectionStrip = memo(function SelectionStrip({
  grid,
  columnId,
  name,
  selectable,
  selected,
  scope,
}: {
  grid: GridApi
  columnId: string
  name: string
  selectable: boolean
  selected: boolean
  scope: ColumnScope
}) {
  return (
    <div
      data-col={columnId}
      className={cn(
        'flex h-2.5 min-w-0 transition-[translate] duration-150 ease-out in-data-settling:transition-none',
        columnClass(columnId),
      )}
    >
      {selectable && (
        <button
          type="button"
          tabIndex={-1}
          data-grid-control=""
          aria-label={grid.labels.selectColumn(name)}
          aria-pressed={selected}
          title={grid.labels.selectColumn(name)}
          onClick={(event) => grid.selectColumn(columnId, event)}
          className={cn(
            'mx-px my-0.5 flex-1 cursor-pointer rounded-sm outline-none transition-colors',
            'focus-visible:ring-2 focus-visible:ring-ring',
            !selected && 'bg-muted hover:bg-selection',
            selected && scope === 'page' && 'bg-selection border border-foreground hover:bg-muted',
            selected && scope === 'all' && 'bg-foreground',
          )}
        />
      )}
    </div>
  )
})

type HeaderCellProps<TData extends RowData> = {
  grid: GridApi
  header: GridHeader<TData>
  /** 1-based position among the visible columns (`aria-colindex`). */
  columnIndex: number
  last: boolean
  /** The right edge can't move: the columns fit and nothing on the right can give way. */
  edgeLocked: boolean
  sorted: false | 'asc' | 'desc'
  /** 1-based priority when several columns are sorted (Shift+click), else null. */
  sortPriority: number | null
  /** The applied filter text, '' when none. */
  filterValue: unknown
  /** Not read here — the resize handle reads it live; here to re-render on resize. */
  size: number
  resizing: boolean
  dragging: boolean
  /** A column selection can pick this column. */
  selectable: boolean
  selected: boolean
  /** Only for the checkbox column: re-renders it when the row selection changes. */
  rowSelection: 'all' | 'page' | 'some' | 'none' | undefined
  /** This column's options menu is open. */
  menuOpen: boolean
  /** Set on the active header cell: its id, for `aria-activedescendant`. */
  activeId: string | null
}

const HeaderCell = memo(function HeaderCell<TData extends RowData>({
  grid,
  header,
  columnIndex,
  last,
  edgeLocked,
  sorted,
  sortPriority,
  filterValue,
  dragging,
  selectable,
  selected,
  menuOpen,
  activeId,
}: HeaderCellProps<TData>) {
  const { column } = header
  const { labels } = grid
  const { canSort, canResize, canHide, canMove, canFilter } = columnCapabilities(grid, column)
  const selectsColumn = grid.columnSelection && selectable
  const checkbox = column.id === SELECT_COLUMN_ID
  const end = column.columnDef.meta?.align === 'end'
  const name = columnLabel(column)

  const label = (
    // The checkbox's span leaves room for its 32px target, which the clip would cut.
    <span data-cell-content="" className={cn('min-w-0 truncate', checkbox && '-m-2 p-2')}>
      <FlexRender header={header} />
    </span>
  )

  const toggleSorting = column.getToggleSortingHandler()
  let body: React.ReactNode
  if (canSort) {
    body = (
      <button
        type="button"
        tabIndex={-1}
        data-grid-control=""
        onClick={(event) => {
          // A movable column's label is its drag handle: a pointer sorts only
          // from the arrow. Keyboard and screen-reader presses (detail 0) still sort.
          const fromArrow = (event.target as Element).closest('[data-sort-arrow]')
          if (canMove && event.detail > 0 && !fromArrow) return
          toggleSorting?.(event)
        }}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-1 self-stretch rounded-sm text-start outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
          canMove ? 'cursor-[inherit]' : 'cursor-pointer',
          end && 'justify-end',
        )}
      >
        {label}
        <SortIndicator sorted={sorted} priority={sortPriority} movable={canMove} />
      </button>
    )
  } else {
    body = (
      <div className={cn('flex min-w-0 flex-1 items-center', checkbox && 'justify-center', end && 'justify-end')}>
        {label}
      </div>
    )
  }

  return (
    <div
      role="columnheader"
      aria-colindex={columnIndex}
      id={activeId ?? undefined}
      data-active={activeId ? '' : undefined}
      aria-sort={sorted && (sortPriority === null || sortPriority === 1) ? sorted === 'asc' ? 'ascending' : 'descending' : undefined}
      aria-description={sorted && sortPriority !== null ? labels.sortDescription(sorted, sortPriority) : undefined}
      aria-selected={selectsColumn ? selected : undefined}
      data-col={column.id}
      data-fixed={canMove ? undefined : ''}
      onPointerDown={canMove ? (event) => grid.startDrag(event, column.id) : undefined}
      className={cn(
        'group/header relative flex min-w-0 items-center gap-0.5 select-none',
        columnClass(column.id),
        activeCellClass,
        tableHeadTextClass,
        checkbox ? 'justify-center px-0' : tableCellPaddingClass,
        'transition-[translate] duration-150 ease-out in-data-settling:transition-none',
        canSort && 'hover:bg-muted/60 active:bg-muted',
        canMove && 'cursor-grab',
        dragging && 'z-20 cursor-grabbing bg-[var(--table-header)] shadow-float ring-1 ring-border',
        column.columnDef.meta?.headerClassName,
      )}
      // During a header drag useColumnDrag sets `translate` here to slide the
      // column aside, or `transform` on the dragged header to follow the pointer.
    >
      {body}
      {canFilter && <ColumnFilter column={column} grid={grid} name={name} value={filterValue} />}
      {(canSort || canResize || canMove || canHide) && (
        <button
          type="button"
          tabIndex={-1}
          data-grid-control=""
          data-no-drag=""
          aria-label={labels.columnMenu(name)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          data-popup-open={menuOpen ? '' : undefined}
          onClick={(event) => grid.openMenu(column.id, event.currentTarget)}
          className={cn(
            'flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none',
            'opacity-0 transition-opacity group-hover/header:opacity-100 [@media(hover:none)]:opacity-100',
            'hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring',
            'data-popup-open:bg-muted data-popup-open:text-foreground data-popup-open:opacity-100',
          )}
        >
          <ChevronDownIcon className="size-3.5" />
        </button>
      )}
      {/* Hidden mid-drag: it overhangs the cell and would widen the scroll area at the far end. */}
      {canResize && !edgeLocked && !dragging && <ResizeHandle grid={grid} header={header} last={last} />}
    </div>
  )
}) as <TData extends RowData>(props: HeaderCellProps<TData>) => React.ReactNode

/**
 * The arrow after a sortable header's label. It shows only on the sorted
 * column, so the headers stay quiet; unsorted ones hint at it on hover. The slot is always reserved, so
 * sorting never truncates a header that was just fitted. On a movable column
 * the arrow is the only place a click sorts, so it gets a target of its own.
 */
function SortIndicator({
  sorted,
  priority,
  movable,
}: {
  sorted: false | 'asc' | 'desc'
  priority: number | null
  movable: boolean
}) {
  const Icon = sorted === 'desc' ? ArrowDownIcon : ArrowUpIcon
  return (
    // Pressing the arrow sorts; only the label starts a column drag.
    <span
      data-no-drag=""
      data-sort-arrow=""
      className={cn(
        'group/sort flex shrink-0 cursor-pointer items-center text-foreground',
        movable && '-my-1 rounded-sm p-1 transition-colors hover:bg-muted',
      )}
    >
      <Icon
        className={cn(
          'size-3.5 transition-opacity',
          !sorted && 'opacity-0 group-hover/header:opacity-40',
          // Touch has no hover: a movable column shows the arrow it must be sorted from.
          !sorted && movable && 'group-hover/sort:opacity-100 [@media(hover:none)]:opacity-40',
        )}
      />
      {priority !== null && <span className="text-[0.625rem] leading-none tabular-nums">{priority}</span>}
    </span>
  )
}

/** What a column's header offers, given the grid's features and the column's own switches. */
export function columnCapabilities<TData extends RowData>(grid: GridApi, column: GridColumn<TData>) {
  return {
    canSort: grid.sortable && column.getCanSort(),
    canResize: grid.resizable && column.getCanResize(),
    canHide: grid.hideable && column.getCanHide(),
    canMove: grid.reorderable && columnCanMove(column),
    canFilter: grid.filterable && column.getCanFilter(),
  }
}

/**
 * The headers' options menu — one for the whole grid, opened by any header's
 * chevron and anchored to it. A menu per header would mount a hundred popups
 * on a hundred-column grid. It carries every drag gesture (resize, move) and
 * the sort cycle for the keyboard and touch screens, and gives focus back to
 * the grid when it closes.
 */
export function HeaderMenu<TData extends RowData>({
  grid,
  column,
  anchor,
  returnFocus,
  onClose,
}: {
  grid: GridApi
  column: GridColumn<TData> | null
  anchor: HTMLElement | null
  /** Where focus goes when the menu closes: the grid, which keeps keyboard focus. */
  returnFocus: () => HTMLElement | null
  onClose: () => void
}) {
  const open = column !== null && anchor !== null
  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      {open && (
        <DropdownMenuContent align="start" className="min-w-44" anchor={anchor} finalFocus={returnFocus}>
          <HeaderMenuItems grid={grid} column={column} {...columnCapabilities(grid, column)} />
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )
}

/** The menu's items. Rendered only while the menu is open, so they read the table fresh. */
function HeaderMenuItems<TData extends RowData>({
  grid,
  column,
  canSort,
  canResize,
  canMove,
  canHide,
}: {
  grid: GridApi
  column: GridColumn<TData>
  canSort: boolean
  canResize: boolean
  canMove: boolean
  canHide: boolean
}) {
  const { labels } = grid
  const sorted = column.getIsSorted()
  const visible = column.table.getVisibleLeafColumns()
  const movable = visible.filter((candidate) => columnCanMove(candidate))
  const position = movable.findIndex((candidate) => candidate.id === column.id)
  const towardsStart = grid.dir === 'rtl' ? 1 : -1
  const canLeft = grid.dir === 'rtl' ? position < movable.length - 1 : position > 0
  const canRight = grid.dir === 'rtl' ? position > 0 : position < movable.length - 1
  const lastVisible = visible.length <= 1

  return (
    <>
        {canSort && (
          <>
            <DropdownMenuItem disabled={sorted === 'asc'} onClick={() => column.toggleSorting(false)}>
              <ArrowUpIcon />
              {labels.sortAscending}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={sorted === 'desc'} onClick={() => column.toggleSorting(true)}>
              <ArrowDownIcon />
              {labels.sortDescending}
            </DropdownMenuItem>
            {sorted && (
              <DropdownMenuItem onClick={() => column.clearSorting()}>
                <XIcon />
                {labels.clearSort}
              </DropdownMenuItem>
            )}
          </>
        )}
        {canSort && (canResize || canMove || canHide) && <DropdownMenuSeparator />}
        {canResize && (
          <DropdownMenuItem onClick={() => grid.autofit([column.id])}>
            <AutofitWidthIcon />
            {labels.autofit}
          </DropdownMenuItem>
        )}
        {canMove && (
          <>
            <DropdownMenuItem disabled={!canLeft} onClick={() => grid.move(column.id, towardsStart)}>
              <ChevronLeftIcon />
              {labels.moveLeft}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={position === -1 || !canRight}
              onClick={() => grid.move(column.id, towardsStart === 1 ? -1 : 1)}
            >
              <ChevronRightIcon />
              {labels.moveRight}
            </DropdownMenuItem>
          </>
        )}
        {canHide && (
          <>
            {(canResize || canMove) && <DropdownMenuSeparator />}
            <DropdownMenuItem disabled={lastVisible} onClick={() => column.toggleVisibility(false)}>
              <EyeOffIcon />
              {labels.hideColumn}
            </DropdownMenuItem>
          </>
        )}
    </>
  )
}

/**
 * The header's funnel. Which panel it opens — the column's own
 * `meta.filter.control`, a checklist, Min and Max, a calendar or "contains" — is
 * worked out when it opens, from the column, its value and the rows then, so a
 * memoized header never shows a stale kind.
 */
function ColumnFilter<TData extends RowData>({
  column,
  grid,
  name,
  value,
}: {
  column: GridColumn<TData>
  grid: GridApi
  name: string
  value: unknown
}) {
  return (
    <ColumnFilterPopover column={name} active={value !== undefined} labels={grid.labels} tabIndex={-1}>
      {(close) => <FilterPanel column={column} grid={grid} value={value} close={close} />}
    </ColumnFilterPopover>
  )
}

function FilterPanel<TData extends RowData>({
  column,
  grid,
  value,
  close,
}: {
  column: GridColumn<TData>
  grid: GridApi
  value: unknown
  close: () => void
}) {
  const { labels, locale } = grid
  const apply = (next: unknown) => column.setFilterValue(next)
  const Control = column.columnDef.meta?.filter?.control
  if (Control) {
    return (
      <Control
        columnId={column.id}
        value={value}
        onApply={(next) => {
          apply(next)
          close()
        }}
        close={close}
      />
    )
  }
  const panelLabels: TableColumnFilterLabels = {
    filter: labels.filter,
    contains: labels.filterContains,
    apply: labels.apply,
    clear: labels.clearFilter,
    cancel: labels.cancel,
    searchOptions: labels.filterSearchOptions,
    noOptions: labels.filterNoOptions,
    min: labels.filterMin,
    max: labels.filterMax,
    pickDates: labels.filterPickDates,
  }
  const setup = grid.filterSetup(column.id, value)
  const props = { onApply: apply, close, labels: panelLabels }
  switch (setup.variant) {
    case 'options':
      return <OptionsFilterPanel {...props} options={setup.options ?? []} value={Array.isArray(value) ? value : undefined} locale={locale} />
    case 'number':
      return <NumberFilterPanel {...props} value={isNumberRange(value) ? value : undefined} />
    case 'date':
      return <DateFilterPanel {...props} value={isDateRange(value) ? value : undefined} locale={locale} />
    default:
      return <TextFilterPanel {...props} value={typeof value === 'string' ? value : ''} onApply={(text) => apply(text || undefined)} />
  }
}
