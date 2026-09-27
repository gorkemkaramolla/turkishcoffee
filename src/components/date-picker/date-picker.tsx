'use client'

import * as React from 'react'
import { format, type Locale } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { cn } from '../../lib/cn'
import { CalendarIcon } from '../../lib/icons'
import { useIsDesktop } from '../../lib/responsive'
import { Button } from '../button/button'
import { Calendar, type CalendarProps } from '../calendar/calendar'
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '../drawer/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover'

type TriggerProps = Omit<React.ComponentProps<'button'>, 'value' | 'onChange' | 'children'>

type ResponsivePickerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Accessible name for the drawer; the popover is labelled by its trigger. */
  title: string
  trigger: React.ReactNode
  children: React.ReactNode
}

/** A popover anchored to the trigger on `sm` and up, a bottom drawer below. */
function ResponsivePicker({ open, onOpenChange, title, trigger, children }: ResponsivePickerProps) {
  const isDesktop = useIsDesktop()

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          {children}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="sr-only">{title}</DrawerTitle>
        <div className="flex justify-center">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}

function PickerButton({
  label,
  placeholder,
  className,
  ...props
}: TriggerProps & { label?: string; placeholder: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      data-empty={!label || undefined}
      className={cn(
        'w-full justify-start text-left font-normal data-[empty]:text-muted-foreground sm:w-64',
        className,
      )}
      {...props}
    >
      <CalendarIcon />
      <span className="truncate">{label ?? placeholder}</span>
    </Button>
  )
}

export type DatePickerProps = TriggerProps & {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  /** date-fns format string for the trigger label. */
  formatStr?: string
  /** A date-fns locale (e.g. `tr` from `date-fns/locale`); also localizes the calendar. */
  locale?: Locale
  calendarProps?: Omit<CalendarProps, 'mode' | 'selected' | 'onSelect' | 'locale'>
}

/** Controlled single-date picker. Works as a `FormControl` child. */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  formatStr = 'PPP',
  locale,
  calendarProps,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <ResponsivePicker
      open={open}
      onOpenChange={setOpen}
      title={placeholder}
      trigger={
        <PickerButton
          data-slot="date-picker"
          label={value ? format(value, formatStr, { locale }) : undefined}
          placeholder={placeholder}
          {...props}
        />
      }
    >
      <Calendar
        {...calendarProps}
        mode="single"
        selected={value}
        defaultMonth={value}
        locale={locale}
        onSelect={(date) => {
          onChange?.(date)
          setOpen(false)
        }}
      />
    </ResponsivePicker>
  )
}

export type DateRangePickerProps = TriggerProps & {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  formatStr?: string
  locale?: Locale
  calendarProps?: Omit<
    CalendarProps,
    'mode' | 'selected' | 'onSelect' | 'locale' | 'numberOfMonths'
  >
}

/** Controlled date-range picker. Stays open until both ends are picked. */
export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Pick a date range',
  formatStr = 'LLL d, y',
  locale,
  calendarProps,
  className,
  ...props
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useIsDesktop()
  // Picks since the picker opened: the first starts a fresh range, the second ends it.
  const picks = React.useRef(0)

  const handleOpenChange = (next: boolean) => {
    if (next) picks.current = 0
    setOpen(next)
  }

  const fmt = (date: Date) => format(date, formatStr, { locale })
  const label = value?.from
    ? value.to
      ? `${fmt(value.from)} – ${fmt(value.to)}`
      : fmt(value.from)
    : undefined

  return (
    <ResponsivePicker
      open={open}
      onOpenChange={handleOpenChange}
      title={placeholder}
      trigger={
        <PickerButton
          data-slot="date-range-picker"
          label={label}
          placeholder={placeholder}
          className={cn('sm:w-72', className)}
          {...props}
        />
      }
    >
      <Calendar
        {...calendarProps}
        mode="range"
        selected={value}
        defaultMonth={value?.from}
        locale={locale}
        numberOfMonths={isDesktop ? 2 : 1}
        onSelect={(range, day) => {
          picks.current += 1
          if (picks.current === 1) {
            onChange?.({ from: day, to: undefined })
            return
          }
          onChange?.(range)
          if (range?.from && range.to) setOpen(false)
        }}
      />
    </ResponsivePicker>
  )
}
