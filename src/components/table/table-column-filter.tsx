'use client'

import { useId, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { inLanguage, type Language } from '../../lib/i18n'
import { useLocale } from '../locale-provider/locale-provider'
import { CheckIcon, FilterIcon, SearchIcon, XIcon } from '../../lib/icons'
import { Button } from '../button/button'
import { Calendar } from '../calendar/calendar'
import { Checkbox } from '../checkbox/checkbox'
import { Input } from '../input/input'
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover'

/** Every word the column filters render, in the locale's language (see LocaleProvider). */
export type TableColumnFilterLabels = {
  /** Title and trigger name: "Filter Name". */
  filter: (column: string) => string
  /** Caption above the text filter's input. */
  contains: string
  apply: string
  clear: string
  cancel: string
  /** The options filter's search field, shown from six options. */
  searchOptions: string
  /** The options filter when its search matches none. */
  noOptions: string
  /** The number filter's lower bound. */
  min: string
  /** The number filter's upper bound. */
  max: string
  /** The date filter before a day is picked. */
  pickDates: string
}

const COLUMN_FILTER_LABELS: Record<Language, TableColumnFilterLabels> = {
  en: {
    filter: (column) => `Filter ${column}`,
    contains: 'Contains',
    apply: 'Apply',
    clear: 'Clear filter',
    cancel: 'Cancel',
    searchOptions: 'Search',
    noOptions: 'No matches',
    min: 'Min',
    max: 'Max',
    pickDates: 'Pick a day or a range',
  },
  tr: {
    filter: (column) => `${column} filtrele`,
    contains: 'İçerir',
    apply: 'Uygula',
    clear: 'Filtreyi kaldır',
    cancel: 'Vazgeç',
    searchOptions: 'Ara',
    noOptions: 'Eşleşen yok',
    min: 'En az',
    max: 'En çok',
    pickDates: 'Bir gün ya da aralık seçin',
  },
}

/** The labels in `locale`'s language. */
export function tableColumnFilterLabelsForLocale(locale: string): TableColumnFilterLabels {
  return inLanguage(COLUMN_FILTER_LABELS, locale)
}

/** The English labels. */
export const defaultTableColumnFilterLabels: TableColumnFilterLabels = COLUMN_FILTER_LABELS.en

function useColumnFilterLabels(overrides: Partial<TableColumnFilterLabels> | undefined, locale?: string): TableColumnFilterLabels {
  return { ...tableColumnFilterLabelsForLocale(useLocale(locale)), ...overrides }
}

/**
 * The funnel: hidden until its header (`group/header`) is hovered or focused,
 * and visible, filled, in the brand colour, while a filter is applied.
 */
export function columnFilterTriggerClass(active: boolean, className?: string) {
  return cn(
    'flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm outline-none',
    'hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
    'data-popup-open:bg-muted data-popup-open:opacity-100',
    active
      ? 'text-primary-text'
      : 'text-muted-foreground opacity-0 transition-opacity group-hover/header:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100',
    className,
  )
}

/**
 * The funnel and its panel, shared by every column filter. The panel is as wide
 * as its content needs (translated buttons, a calendar) and never narrower
 * than 16rem, so nothing in it runs past its edge. `children` renders only
 * while the panel is open, so each opening starts from the applied value.
 */
export function ColumnFilterPopover({
  column,
  active,
  labels,
  tabIndex,
  className,
  children,
}: {
  column: string
  active: boolean
  labels: Pick<TableColumnFilterLabels, 'filter'>
  tabIndex?: number
  className?: string
  children: (close: () => void) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        data-no-drag=""
        data-grid-control={tabIndex === -1 ? '' : undefined}
        tabIndex={tabIndex}
        aria-label={labels.filter(column)}
        className={columnFilterTriggerClass(active, className)}
      >
        <FilterIcon className={cn('size-3.5', active && 'fill-current')} />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="grid w-max min-w-64 max-w-[min(22rem,calc(100vw-2rem))] grid-cols-[minmax(0,1fr)] gap-3 p-3"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FilterIcon className="size-4" />
          {labels.filter(column)}
        </div>
        {children(close)}
      </PopoverContent>
    </Popover>
  )
}

/** Cancel, Clear filter and Apply, under every filter's panel. */
function FilterActions({
  labels,
  active,
  onCancel,
  onClear,
}: {
  labels: TableColumnFilterLabels
  active: boolean
  onCancel: () => void
  onClear: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        <XIcon />
        {labels.cancel}
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={!active} onClick={onClear}>
        {labels.clear}
      </Button>
      <Button type="submit" size="sm">
        <CheckIcon />
        {labels.apply}
      </Button>
    </div>
  )
}

/** A panel's form: its fields and the actions under them. Enter applies. */
function FilterForm({
  labels,
  active,
  onSubmit,
  onClear,
  close,
  children,
}: {
  labels: TableColumnFilterLabels
  active: boolean
  onSubmit: () => void
  onClear: () => void
  close: () => void
  children: React.ReactNode
}) {
  return (
    <form
      className="contents"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
        close()
      }}
    >
      {children}
      <FilterActions
        labels={labels}
        active={active}
        onCancel={close}
        onClear={() => {
          onClear()
          close()
        }}
      />
    </form>
  )
}

type PanelProps<TValue> = {
  value: TValue
  onApply: (value: TValue) => void
  close: () => void
  labels: TableColumnFilterLabels
}

/** The "contains" panel. Applies the trimmed text, `''` to clear. */
export function TextFilterPanel({ value, onApply, close, labels }: PanelProps<string>) {
  const [draft, setDraft] = useState(value)
  return (
    <FilterForm labels={labels} active={value !== ''} close={close} onSubmit={() => onApply(draft.trim())} onClear={() => onApply('')}>
      <label className="grid gap-1.5">
        <span className="text-xs text-muted-foreground">{labels.contains}</span>
        <Input autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} />
      </label>
    </FilterForm>
  )
}

/** One choice of an options filter: the value matched, its label, and how many rows hold it. */
export type TableColumnFilterOption = {
  value: string | number | boolean
  label: string
  /** Shown beside the label: the rows with this value, when the app knows. */
  count?: number
}

/** From this many options the panel offers a search field above them. */
const SEARCH_FROM = 6

/**
 * The checklist panel: tick the values to show. Nothing ticked is no filter,
 * so there is no "Select all" to keep in step. From six options a search
 * field above narrows the list; ArrowDown moves from it into the list.
 */
export function OptionsFilterPanel({
  options,
  value,
  onApply,
  close,
  labels,
  locale,
}: PanelProps<readonly unknown[] | undefined> & {
  options: readonly TableColumnFilterOption[]
  locale?: string
}) {
  const [draft, setDraft] = useState<ReadonlySet<unknown>>(() => new Set(value ?? []))
  const [search, setSearch] = useState('')
  const list = useRef<HTMLDivElement>(null)
  const searchable = options.length >= SEARCH_FROM
  const needle = search.trim().toLocaleLowerCase(locale)
  const shown = needle ? options.filter((option) => option.label.toLocaleLowerCase(locale).includes(needle)) : options

  const toggle = (item: unknown, on: boolean) => {
    const next = new Set(draft)
    if (on) next.add(item)
    else next.delete(item)
    setDraft(next)
  }
  // Up and down walk the checkboxes, like a listbox; Tab still leaves the list.
  const moveFocus = (event: React.KeyboardEvent, from: Element | null, step: 1 | -1) => {
    const boxes = Array.from(list.current?.querySelectorAll<HTMLElement>('[role="checkbox"]') ?? [])
    if (!boxes.length) return
    event.preventDefault()
    const index = from ? boxes.indexOf(from as HTMLElement) : -1
    boxes[Math.min(boxes.length - 1, Math.max(0, index + step))]?.focus()
  }

  return (
    <FilterForm
      labels={labels}
      active={value !== undefined}
      close={close}
      onSubmit={() => {
        const ticked = options.filter((option) => draft.has(option.value)).map((option) => option.value)
        onApply(ticked.length ? ticked : undefined)
      }}
      onClear={() => onApply(undefined)}
    >
      {searchable && (
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            type="search"
            aria-label={labels.searchOptions}
            placeholder={labels.searchOptions}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') moveFocus(event, null, 1)
            }}
            className="ps-8"
          />
        </div>
      )}
      <div
        ref={list}
        data-slot="column-filter-options"
        className="-mx-1 grid max-h-64 overflow-y-auto"
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') moveFocus(event, document.activeElement, 1)
          if (event.key === 'ArrowUp') moveFocus(event, document.activeElement, -1)
        }}
      >
        {shown.length ? (
          shown.map((option, index) => (
            <OptionRow
              key={String(option.value)}
              autoFocus={!searchable && index === 0}
              label={option.label}
              count={option.count === undefined ? undefined : option.count.toLocaleString(locale)}
              checked={draft.has(option.value)}
              onCheckedChange={(on) => toggle(option.value, on)}
            />
          ))
        ) : (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">{labels.noOptions}</p>
        )}
      </div>
    </FilterForm>
  )
}

function OptionRow({
  label,
  count,
  checked,
  autoFocus,
  onCheckedChange,
}: {
  label: string
  count?: string
  checked: boolean
  autoFocus?: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  const id = useId()
  return (
    // The whole row ticks: a label around the checkbox (a button, so labelable).
    // Named by the option alone; its count is the description.
    <label className="flex min-h-8 cursor-pointer items-center gap-2.5 rounded-sm px-2 text-sm hover:bg-accent">
      <Checkbox
        autoFocus={autoFocus}
        checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={count === undefined ? undefined : `${id}-count`}
        onCheckedChange={(next) => onCheckedChange(next === true)}
      />
      <span id={`${id}-label`} className="min-w-0 flex-1 truncate">
        {label}
      </span>
      {count !== undefined && (
        <span id={`${id}-count`} className="text-xs text-muted-foreground tabular-nums">
          {count}
        </span>
      )}
    </label>
  )
}

/** A number filter's value: the inclusive bounds, either of which may be missing. */
export type TableColumnNumberRange = { min?: number; max?: number }

/** Min and Max side by side. Either may stay empty; reversed bounds are swapped. */
export function NumberFilterPanel({ value, onApply, close, labels }: PanelProps<TableColumnNumberRange | undefined>) {
  const [min, setMin] = useState(value?.min === undefined ? '' : String(value.min))
  const [max, setMax] = useState(value?.max === undefined ? '' : String(value.max))
  const parse = (text: string) => {
    const number = text.trim() === '' ? Number.NaN : Number(text)
    return Number.isFinite(number) ? number : undefined
  }
  return (
    <FilterForm
      labels={labels}
      active={value !== undefined}
      close={close}
      onSubmit={() => {
        let low = parse(min)
        let high = parse(max)
        if (low !== undefined && high !== undefined && low > high) [low, high] = [high, low]
        onApply(low === undefined && high === undefined ? undefined : { min: low, max: high })
      }}
      onClear={() => onApply(undefined)}
    >
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1.5">
          <span className="text-xs text-muted-foreground">{labels.min}</span>
          <Input autoFocus type="number" step="any" inputMode="decimal" value={min} onChange={(event) => setMin(event.target.value)} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs text-muted-foreground">{labels.max}</span>
          <Input type="number" step="any" inputMode="decimal" value={max} onChange={(event) => setMax(event.target.value)} />
        </label>
      </div>
    </FilterForm>
  )
}

/** A date filter's value: whole days, both ends included; either may be missing. */
export type TableColumnDateRange = { from?: Date; to?: Date }

/** The locale's first day of the week, for the calendar (Monday where unknown, Sunday in en-US). */
function weekStart(locale: string | undefined): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  try {
    const info = new Intl.Locale(locale ?? 'en-US') as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number }
      weekInfo?: { firstDay: number }
    }
    const firstDay = (info.getWeekInfo?.() ?? info.weekInfo)?.firstDay
    if (firstDay) return (firstDay % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6
  } catch {
    // An unknown locale falls through.
  }
  return (locale ?? 'en-US') === 'en-US' ? 0 : 1
}

/**
 * A calendar to pick one day (click it once) or a range (click both ends).
 * Month and year are drop-downs, to reach years back quickly. Month and day
 * names follow `locale`.
 */
export function DateFilterPanel({
  value,
  onApply,
  close,
  labels,
  locale,
}: PanelProps<TableColumnDateRange | undefined> & { locale?: string }) {
  const [range, setRange] = useState<TableColumnDateRange | undefined>(value)
  // Picks since the panel opened: an odd one starts a new range, an even one ends it.
  const picks = useRef(0)
  const day = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })
  const from = range?.from
  const to = range?.to ?? from
  const summary = from && to ? (from.getTime() === to.getTime() ? day.format(from) : `${day.format(from)} – ${day.format(to)}`) : null
  const months = new Intl.DateTimeFormat(locale, { month: 'long' })
  const caption = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  const thisYear = new Date().getFullYear()

  return (
    <FilterForm
      labels={labels}
      active={value !== undefined}
      close={close}
      onSubmit={() => onApply(from && to ? { from, to } : undefined)}
      onClear={() => onApply(undefined)}
    >
      <p aria-live="polite" className={cn('text-sm', summary ? 'font-medium' : 'text-muted-foreground')}>
        {summary ?? labels.pickDates}
      </p>
      <Calendar
        mode="range"
        className="-mx-1 bg-transparent p-0"
        captionLayout="dropdown"
        endMonth={new Date(thisYear + 10, 11)}
        defaultMonth={from}
        weekStartsOn={weekStart(locale)}
        formatters={{
          formatCaption: (month) => caption.format(month),
          formatMonthDropdown: (month) => months.format(month),
          formatYearDropdown: (year) => String(year.getFullYear()),
          formatWeekdayName: (date) => weekday.format(date),
        }}
        selected={from ? { from, to: range?.to } : undefined}
        onSelect={(next, picked) => {
          picks.current += 1
          setRange(picks.current % 2 === 1 ? { from: picked } : { from: next?.from, to: next?.to })
        }}
      />
    </FilterForm>
  )
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
export function TableColumnFilter({ column, value, onApply, labels: overrides, tabIndex, className }: TableColumnFilterProps) {
  const labels = useColumnFilterLabels(overrides)
  return (
    <ColumnFilterPopover column={column} active={value !== ''} labels={labels} tabIndex={tabIndex} className={className}>
      {(close) => <TextFilterPanel value={value} onApply={onApply} close={close} labels={labels} />}
    </ColumnFilterPopover>
  )
}

export type TableColumnOptionsFilterProps = {
  /** The column's name, for the title and the trigger's accessible name. */
  column: string
  options: readonly TableColumnFilterOption[]
  /** The values shown; `undefined` when nothing is filtered out. */
  value: readonly unknown[] | undefined
  /** The ticked values, or `undefined` when none is ticked. */
  onApply: (value: Array<TableColumnFilterOption['value']> | undefined) => void
  labels?: Partial<TableColumnFilterLabels>
  /** Formats the counts and folds case for the search; the page's language. */
  locale?: string
  /** The funnel's tab order; a grid that manages focus itself passes -1. */
  tabIndex?: number
  className?: string
}

/**
 * A column header's filter for a column of known values (a status, a type, a
 * department): the same funnel as TableColumnFilter, opening a checklist with
 * each option's count beside it, and Apply / Clear / Cancel. Tick the values
 * to show; with none ticked nothing is filtered. From six options a search
 * field above the list narrows it. Controlled: the caller owns the applied
 * values and does the filtering.
 *
 * @example
 * <TableColumnOptionsFilter
 *   column="Status"
 *   options={[{ value: 'active', label: 'Active', count: 12 }, { value: 'passive', label: 'Passive', count: 3 }]}
 *   value={statuses}
 *   onApply={setStatuses}
 * />
 */
export function TableColumnOptionsFilter({
  column,
  options,
  value,
  onApply,
  labels: overrides,
  locale,
  tabIndex,
  className,
}: TableColumnOptionsFilterProps) {
  const labels = useColumnFilterLabels(overrides, locale)
  return (
    <ColumnFilterPopover column={column} active={value !== undefined} labels={labels} tabIndex={tabIndex} className={className}>
      {(close) => (
        <OptionsFilterPanel
          options={options}
          value={value}
          onApply={(next) => onApply(next as Array<TableColumnFilterOption['value']> | undefined)}
          close={close}
          labels={labels}
          locale={locale}
        />
      )}
    </ColumnFilterPopover>
  )
}

export type TableColumnNumberFilterProps = {
  /** The column's name, for the title and the trigger's accessible name. */
  column: string
  value: TableColumnNumberRange | undefined
  /** The bounds, or `undefined` when both are empty. */
  onApply: (value: TableColumnNumberRange | undefined) => void
  labels?: Partial<TableColumnFilterLabels>
  /** The funnel's tab order; a grid that manages focus itself passes -1. */
  tabIndex?: number
  className?: string
}

/**
 * A column header's filter for numbers: Min and Max, both inclusive, either
 * optional. Same funnel and actions as TableColumnFilter. Controlled.
 *
 * @example
 * <TableColumnNumberFilter column="Salary" value={salary} onApply={setSalary} />
 */
export function TableColumnNumberFilter({ column, value, onApply, labels: overrides, tabIndex, className }: TableColumnNumberFilterProps) {
  const labels = useColumnFilterLabels(overrides)
  return (
    <ColumnFilterPopover column={column} active={value !== undefined} labels={labels} tabIndex={tabIndex} className={className}>
      {(close) => <NumberFilterPanel value={value} onApply={onApply} close={close} labels={labels} />}
    </ColumnFilterPopover>
  )
}

export type TableColumnDateFilterProps = {
  /** The column's name, for the title and the trigger's accessible name. */
  column: string
  value: TableColumnDateRange | undefined
  /** The days picked (`from` and `to` the same for one day), or `undefined` to clear. */
  onApply: (value: TableColumnDateRange | undefined) => void
  labels?: Partial<TableColumnFilterLabels>
  /** Month and day names, the first day of the week and the summary's format. */
  locale?: string
  /** The funnel's tab order; a grid that manages focus itself passes -1. */
  tabIndex?: number
  className?: string
}

/**
 * A column header's filter for dates: a calendar picking one day or a range,
 * both ends included. Same funnel and actions as TableColumnFilter. Controlled.
 *
 * @example
 * <TableColumnDateFilter column="Start date" value={started} onApply={setStarted} locale="tr-TR" />
 */
export function TableColumnDateFilter({ column, value, onApply, labels: overrides, locale, tabIndex, className }: TableColumnDateFilterProps) {
  const labels = useColumnFilterLabels(overrides, locale)
  return (
    <ColumnFilterPopover column={column} active={value !== undefined} labels={labels} tabIndex={tabIndex} className={className}>
      {(close) => <DateFilterPanel value={value} onApply={onApply} close={close} labels={labels} locale={locale} />}
    </ColumnFilterPopover>
  )
}
