'use client'

import { useState } from 'react'
import { cn } from '../../lib/cn'
import { CheckIcon, FilterIcon, XIcon } from '../../lib/icons'
import { Button } from '../button/button'
import { Input } from '../input/input'
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover'

/** Every word TableColumnFilter renders. English by default. */
export type TableColumnFilterLabels = {
  /** Title and trigger name: "Filter Name". */
  filter: (column: string) => string
  /** Caption above the input. */
  contains: string
  apply: string
  clear: string
  cancel: string
}

export const defaultTableColumnFilterLabels: TableColumnFilterLabels = {
  filter: (column) => `Filter ${column}`,
  contains: 'Contains',
  apply: 'Apply',
  clear: 'Clear filter',
  cancel: 'Cancel',
}

export type TableColumnFilterProps = {
  /** The column's name, for the title and the trigger's accessible name. */
  column: string
  /** The applied filter text; empty when none. */
  value: string
  /** Called with the new text, or `''` to clear. */
  onApply: (value: string) => void
  labels?: Partial<TableColumnFilterLabels>
  /** The funnel's tab order; a grid that manages focus itself passes -1. */
  tabIndex?: number
  className?: string
}

/**
 * A column header's "contains" filter: a funnel that opens a small panel with a
 * text field and Apply / Clear / Cancel. Enter applies, Escape cancels. The
 * funnel stays hidden until its header (`group/header`) is hovered or focused,
 * and stays visible — filled — while a filter is applied. Controlled: the
 * caller owns the applied value and does the filtering.
 *
 * @example
 * <TableHead className="group/header">
 *   Name
 *   <TableColumnFilter column="Name" value={nameFilter} onApply={setNameFilter} />
 * </TableHead>
 */
export function TableColumnFilter({
  column,
  value,
  onApply,
  labels: labelOverrides,
  tabIndex,
  className,
}: TableColumnFilterProps) {
  const labels = { ...defaultTableColumnFilterLabels, ...labelOverrides }
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const active = value !== ''

  const apply = (next: string) => {
    onApply(next.trim())
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // Every opening starts from what is applied, not from an abandoned draft.
        if (next) setDraft(value)
        setOpen(next)
      }}
    >
      <PopoverTrigger
        data-no-drag=""
        data-grid-control={tabIndex === -1 ? '' : undefined}
        tabIndex={tabIndex}
        aria-label={labels.filter(column)}
        className={cn(
          'flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm outline-none',
          'hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
          'data-popup-open:bg-muted data-popup-open:opacity-100',
          active
            ? 'text-primary-text'
            : 'text-muted-foreground opacity-0 transition-opacity group-hover/header:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100',
          className,
        )}
      >
        <FilterIcon className={cn('size-3.5', active && 'fill-current')} />
      </PopoverTrigger>
      <PopoverContent align="start" className="grid w-72 gap-3 p-3">
        <form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault()
            apply(draft)
          }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FilterIcon className="size-4" />
            {labels.filter(column)}
          </div>
          <label className="grid gap-1.5">
            <span className="text-xs text-muted-foreground">{labels.contains}</span>
            <Input autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} />
          </label>
          <div className="flex items-center justify-end gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              <XIcon />
              {labels.cancel}
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={!active} onClick={() => apply('')}>
              {labels.clear}
            </Button>
            <Button type="submit" size="sm">
              <CheckIcon />
              {labels.apply}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
