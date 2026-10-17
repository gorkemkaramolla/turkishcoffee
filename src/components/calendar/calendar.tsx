'use client'

import * as React from 'react'
import {
  DayPicker,
  getDefaultClassNames,
  type ChevronProps,
  type DayButtonProps,
} from 'react-day-picker'
import { cn } from '../../lib/cn'
import { dayPickerLocale } from '../../lib/day-picker-locale'
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '../../lib/icons'
import { useLocale } from '../locale-provider/locale-provider'
import { buttonVariants } from '../button/button'

export type { DateRange } from 'react-day-picker'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Chevron({ orientation, className }: ChevronProps) {
  const Icon =
    orientation === 'left'
      ? ChevronLeftIcon
      : orientation === 'right'
        ? ChevronRightIcon
        : ChevronDownIcon
  return <Icon className={cn('size-4', className)} />
}

/**
 * Exposes where a day sits in a range as data attributes, which the default
 * DayButton does not, and keeps its focus-follows-keyboard behavior.
 */
function DayButton({ day, modifiers, className, ...props }: DayButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const inRange = modifiers.range_start || modifiers.range_middle || modifiers.range_end

  return (
    <button
      ref={ref}
      data-day={day.date.toLocaleDateString()}
      data-selected-single={(modifiers.selected && !inRange) || undefined}
      data-range-start={modifiers.range_start || undefined}
      data-range-middle={modifiers.range_middle || undefined}
      data-range-end={modifiers.range_end || undefined}
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'icon' }),
        'size-(--cell-size) font-normal',
        'data-[selected-single]:bg-primary data-[selected-single]:text-primary-foreground',
        'data-[range-start]:bg-primary data-[range-start]:text-primary-foreground',
        'data-[range-end]:bg-primary data-[range-end]:text-primary-foreground',
        'data-[range-middle]:rounded-none data-[range-middle]:bg-selection data-[range-middle]:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

/**
 * react-day-picker styled with the theme tokens instead of its stylesheet, so it
 * follows `.dark`. Month and day names, the week's first day and the
 * screen-reader labels follow LocaleProvider (else `<html lang>`); pass a
 * `locale` from `react-day-picker/locale` to choose another. Without `mode` it is a read-only month: mark days with `modifiers` and
 * style them with `modifiersClassNames`.
 *
 * @example
 * <Calendar mode="single" selected={day} onSelect={setDay} />
 *
 * <Calendar modifiers={{ holiday: holidays }} modifiersClassNames={{ holiday: 'text-danger-text' }} />
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  components,
  locale,
  ...props
}: CalendarProps) {
  const defaults = getDefaultClassNames()
  const pageLocale = useLocale()

  return (
    <DayPicker
      data-slot="calendar"
      locale={locale ?? dayPickerLocale(pageLocale)}
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn('bg-background p-3 [--cell-size:--spacing(9)]', className)}
      classNames={{
        root: cn('w-fit', defaults.root),
        months: cn('relative flex flex-col gap-4 sm:flex-row', defaults.months),
        month: cn('flex w-full flex-col gap-4', defaults.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          defaults.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'size-(--cell-size) aria-disabled:opacity-50',
          defaults.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'size-(--cell-size) aria-disabled:opacity-50',
          defaults.button_next,
        ),
        month_caption: cn(
          'flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)',
          defaults.month_caption,
        ),
        // With `captionLayout="dropdown"` the label shows the chosen month or
        // year over an invisible native select, which takes the clicks.
        dropdowns: cn('flex h-(--cell-size) w-full items-center justify-center gap-1 text-sm font-medium', defaults.dropdowns),
        dropdown_root: cn(
          'relative rounded-sm hover:bg-muted has-focus-visible:ring-2 has-focus-visible:ring-ring',
          defaults.dropdown_root,
        ),
        dropdown: cn('absolute inset-0 cursor-pointer opacity-0', defaults.dropdown),
        caption_label: cn(
          'text-sm font-medium select-none',
          captionLayout !== 'label' && 'flex h-7 items-center gap-0.5 ps-2 pe-1 [&>svg]:size-3.5 [&>svg]:text-muted-foreground',
          defaults.caption_label,
        ),
        month_grid: 'w-full border-collapse',
        weekdays: cn('flex', defaults.weekdays),
        weekday: cn(
          'flex-1 text-[0.8rem] font-normal text-muted-foreground select-none',
          defaults.weekday,
        ),
        week: cn('mt-2 flex w-full', defaults.week),
        // The cell carries its own size: without `mode` or `onDayClick` the day
        // renders as plain text, with no DayButton to give the column a width.
        day: cn(
          'relative grid aspect-square h-full w-full min-w-(--cell-size) place-items-center p-0 text-center text-sm select-none',
          defaults.day,
        ),
        day_button: defaults.day_button,
        range_start: cn('rounded-l-md bg-selection', defaults.range_start),
        range_middle: cn('rounded-none', defaults.range_middle),
        range_end: cn('rounded-r-md bg-selection', defaults.range_end),
        today: cn(
          '[&>button]:ring-1 [&>button]:ring-ring/60 data-selected:[&>button]:ring-0',
          defaults.today,
        ),
        outside: cn('text-muted-foreground opacity-60', defaults.outside),
        disabled: cn('text-muted-foreground opacity-50', defaults.disabled),
        hidden: cn('invisible', defaults.hidden),
        ...classNames,
      }}
      components={{ Chevron, DayButton, ...components }}
      {...props}
    />
  )
}
