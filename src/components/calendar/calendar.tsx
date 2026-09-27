'use client'

import * as React from 'react'
import {
  DayPicker,
  getDefaultClassNames,
  type ChevronProps,
  type DayButtonProps,
} from 'react-day-picker'
import { cn } from '../../lib/cn'
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '../../lib/icons'
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
        'data-[range-middle]:rounded-none data-[range-middle]:bg-accent data-[range-middle]:text-accent-foreground',
        className,
      )}
      {...props}
    />
  )
}

/**
 * react-day-picker styled with the theme tokens instead of its stylesheet, so it
 * follows `.dark`. Pass a locale from `react-day-picker/locale` (e.g. `tr`).
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components,
  ...props
}: CalendarProps) {
  const defaults = getDefaultClassNames()

  return (
    <DayPicker
      data-slot="calendar"
      showOutsideDays={showOutsideDays}
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
        caption_label: cn('text-sm font-medium select-none', defaults.caption_label),
        month_grid: 'w-full border-collapse',
        weekdays: cn('flex', defaults.weekdays),
        weekday: cn(
          'flex-1 text-[0.8rem] font-normal text-muted-foreground select-none',
          defaults.weekday,
        ),
        week: cn('mt-2 flex w-full', defaults.week),
        day: cn(
          'relative aspect-square h-full w-full p-0 text-center select-none',
          defaults.day,
        ),
        day_button: defaults.day_button,
        range_start: cn('rounded-l-md bg-accent', defaults.range_start),
        range_middle: cn('rounded-none', defaults.range_middle),
        range_end: cn('rounded-r-md bg-accent', defaults.range_end),
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
