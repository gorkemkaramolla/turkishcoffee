'use client'

import { Select as SelectPrimitive } from '@base-ui/react/select'
import { cn, cnState } from '../../lib/cn'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '../../lib/icons'
import { popupMotion } from '../../lib/motion'

/**
 * Custom-styled dropdown for picking one value. Controlled with `value` +
 * `onValueChange(value, eventDetails)`. Pass `items` (a `{ value: label }` map or
 * `{ value, label }[]`) so SelectValue shows the chosen item's label; without it
 * SelectValue shows the raw value. Needs a client boundary; inside server
 * components or long mobile forms prefer NativeSelect.
 *
 * @example
 * const plans = { free: 'Free', pro: 'Pro' }
 *
 * <Select items={plans} value={plan} onValueChange={setPlan}>
 *   <SelectTrigger className="w-48">
 *     <SelectValue placeholder="Choose a plan" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="free">Free</SelectItem>
 *     <SelectItem value="pro">Pro</SelectItem>
 *   </SelectContent>
 * </Select>
 */
export const Select = SelectPrimitive.Root
/** Groups SelectItems under a SelectLabel. */
export const SelectGroup = SelectPrimitive.Group
/** Shows the selected item's label inside SelectTrigger (needs `items` on Select), or `placeholder`. */
export const SelectValue = SelectPrimitive.Value

/**
 * The button that opens the Select. `size`: `sm` | `md` (default). Sized to
 * its content (`w-fit`); pass `className="w-full"` to fill the row.
 */
export function SelectTrigger({
  className,
  size = 'md',
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  /** Height: `sm` (h-8) or `md` (h-9, default) — matches Input and NativeSelect. */
  size?: 'sm' | 'md'
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cnState(
        'flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none',
        'data-[size=md]:h-9 data-[size=sm]:h-8',
        'data-placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon render={<ChevronDownIcon className="size-4 opacity-50" />} />
    </SelectPrimitive.Trigger>
  )
}

export type SelectContentProps = SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    'side' | 'sideOffset' | 'align' | 'alignOffset' | 'alignItemWithTrigger'
  >

/**
 * The options panel; renders its own portal and scroll arrows. Opens below
 * the trigger like a dropdown; pass `alignItemWithTrigger` for the macOS-style
 * menu that overlaps the trigger with the selected item.
 */
export function SelectContent({
  className,
  children,
  side,
  sideOffset = 4,
  align,
  alignOffset,
  alignItemWithTrigger = false,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        className="z-50 outline-none"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cnState(
            'relative max-h-(--available-height) min-w-(--anchor-width) overflow-x-hidden overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md',
            popupMotion,
            className,
          )}
          {...props}
        >
          <SelectScrollArrow direction="up" />
          <SelectPrimitive.List className="p-1">{children}</SelectPrimitive.List>
          <SelectScrollArrow direction="down" />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

/** One option. `value` may be any value, not only a string. */
export function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cnState(
        'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none',
        'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

/** Heading for a SelectGroup. */
export function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cnState('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    />
  )
}

/** Horizontal rule between groups. */
export function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cnState('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

function SelectScrollArrow({ direction }: { direction: 'up' | 'down' }) {
  const Arrow =
    direction === 'up' ? SelectPrimitive.ScrollUpArrow : SelectPrimitive.ScrollDownArrow
  const Icon = direction === 'up' ? ChevronUpIcon : ChevronDownIcon
  return (
    <Arrow
      className={cn(
        'sticky z-10 flex w-full cursor-default items-center justify-center bg-popover py-1',
        direction === 'up' ? 'top-0' : 'bottom-0',
      )}
    >
      <Icon className="size-4" />
    </Arrow>
  )
}
