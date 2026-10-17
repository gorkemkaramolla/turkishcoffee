'use client'

import type * as React from 'react'
import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import { cn, cnState } from '../../lib/cn'

export type SegmentedControlProps<Value extends string = string> = Omit<
  ToggleGroup.Props<Value>,
  'value' | 'defaultValue' | 'onValueChange' | 'multiple'
> & {
  /** The pressed segment, controlled. Pair it with `onValueChange`. */
  value?: Value
  /** The segment pressed at first, uncontrolled. */
  defaultValue?: Value
  /** Called with the segment just pressed. Pressing the pressed one again changes nothing: one segment always stays pressed. */
  onValueChange?: (value: Value, eventDetails: ToggleGroup.ChangeEventDetails) => void
}

/**
 * A row of mutually exclusive options that change what the page shows, such as
 * a list's status filter: All · Active · Inactive. One segment is always
 * pressed. Name the group with `aria-label`. Each segment is a toggle button
 * (`aria-pressed`), and the arrow keys move between them. Put a count in a
 * segment with SegmentedControlCount.
 *
 * Use Tabs for separate views with their own panels, and RadioGroup for a
 * choice submitted with a form.
 *
 * @example
 * <SegmentedControl aria-label="Status" value={status} onValueChange={setStatus}>
 *   <SegmentedControlItem value="all">All</SegmentedControlItem>
 *   <SegmentedControlItem value="active">
 *     Active <SegmentedControlCount>128</SegmentedControlCount>
 *   </SegmentedControlItem>
 *   <SegmentedControlItem value="inactive">
 *     Inactive <SegmentedControlCount>7</SegmentedControlCount>
 *   </SegmentedControlItem>
 * </SegmentedControl>
 */
export function SegmentedControl<Value extends string = string>({
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: SegmentedControlProps<Value>) {
  return (
    <ToggleGroup<Value>
      data-slot="segmented-control"
      value={value === undefined ? undefined : [value]}
      defaultValue={defaultValue === undefined ? undefined : [defaultValue]}
      onValueChange={(next, eventDetails) => {
        const [pressed] = next
        if (pressed === undefined) return eventDetails.cancel()
        onValueChange?.(pressed, eventDetails)
      }}
      className={cnState(
        'inline-flex h-control w-fit items-center gap-0.5 rounded-md bg-muted p-0.5',
        'data-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export type SegmentedControlItemProps<Value extends string = string> = Toggle.Props<Value> & {
  /** Identifies the segment in the group's `value`. */
  value: Value
}

/** One segment. Pressed, it takes the page's background and a `--field` edge, at least 3:1 against the track. */
export function SegmentedControlItem<Value extends string = string>({ className, ...props }: SegmentedControlItemProps<Value>) {
  return (
    <Toggle<Value>
      data-slot="segmented-control-item"
      className={cnState(
        'inline-flex h-full items-center justify-center gap-1.5 rounded-sm px-3 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none transition-[color,background-color,box-shadow]',
        'hover:text-foreground',
        'data-pressed:bg-background data-pressed:text-foreground data-pressed:inset-ring data-pressed:inset-ring-field',
        'focus-visible:ring-2 focus-visible:ring-ring',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

/** A count beside a segment's label, in tabular figures so the segment keeps its width as the number changes. */
export function SegmentedControlCount({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="segmented-control-count" className={cn('text-muted-foreground tabular-nums', className)} {...props} />
}
