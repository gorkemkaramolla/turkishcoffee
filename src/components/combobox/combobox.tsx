'use client'

import * as React from 'react'
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'
import { cn, cnState } from '../../lib/cn'
import { inLanguage } from '../../lib/i18n'
import { MESSAGES } from '../../lib/messages'
import { useLocale } from '../locale-provider/locale-provider'
import { CheckIcon, ChevronDownIcon, XIcon } from '../../lib/icons'
import { popupMotion } from '../../lib/motion'
import { highlightedItem } from '../../lib/states'

/** The field the popup lines up under: the input group or the chips box. */
const AnchorContext = React.createContext<{
  anchor: HTMLElement | null
  setAnchor: (element: HTMLElement | null) => void
}>({ anchor: null, setAnchor: () => {} })

/**
 * A text field that filters a list as you type, for picking one value (or
 * several, with `multiple`) out of more than a Select comfortably holds: a
 * manager out of 300 people, a city, a cost centre. Give it the options as
 * `items`; ComboboxList renders each through a function child and filters them
 * itself. For objects, pass `itemToStringLabel` so the input shows a label.
 * Controlled with `value` + `onValueChange(value, eventDetails)`. For under a
 * dozen fixed options use Select.
 *
 * @example
 * <Combobox items={people} itemToStringLabel={(p) => p.name} value={manager} onValueChange={setManager}>
 *   <ComboboxInput placeholder="Search people" aria-label="Manager" />
 *   <ComboboxContent>
 *     <ComboboxEmpty>No one matches.</ComboboxEmpty>
 *     <ComboboxList>
 *       {(person: Person) => (
 *         <ComboboxItem key={person.id} value={person}>{person.name}</ComboboxItem>
 *       )}
 *     </ComboboxList>
 *   </ComboboxContent>
 * </Combobox>
 *
 * @example
 * <caption>Several values, as chips</caption>
 * <Combobox multiple items={skills} value={picked} onValueChange={setPicked}>
 *   <ComboboxChips>
 *     <ComboboxValue>
 *       {(values: string[]) => values.map((skill) => <ComboboxChip key={skill}>{skill}</ComboboxChip>)}
 *     </ComboboxValue>
 *     <ComboboxChipsInput placeholder="Add a skill" aria-label="Skills" />
 *   </ComboboxChips>
 *   <ComboboxContent>
 *     <ComboboxList>{(skill: string) => <ComboboxItem key={skill} value={skill}>{skill}</ComboboxItem>}</ComboboxList>
 *   </ComboboxContent>
 * </Combobox>
 */
export function Combobox<Value, Multiple extends boolean | undefined = false, Item = Value>(
  props: ComboboxPrimitive.Root.Props<Value, Multiple, Item>,
) {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null)
  const context = React.useMemo(() => ({ anchor, setAnchor }), [anchor])
  return (
    <AnchorContext.Provider value={context}>
      <ComboboxPrimitive.Root {...props} />
    </AnchorContext.Provider>
  )
}

/** Renders the selected value(s) through a function child; use it inside ComboboxChips. */
export const ComboboxValue = ComboboxPrimitive.Value
/** Groups ComboboxItems under a ComboboxGroupLabel. */
export const ComboboxGroup = ComboboxPrimitive.Group
/** Renders the items of a group passed as `{ value, items }` in `items`. */
export const ComboboxCollection = ComboboxPrimitive.Collection
/** The default filter (locale-aware "contains"), for filtering `items` yourself. */
export const useComboboxFilter = ComboboxPrimitive.useFilter

const field = [
  'relative flex w-full min-w-0 items-center rounded-md border border-field bg-transparent transition-[color,border-color,box-shadow]',
  'hover:border-field-hover',
  'has-[input:focus-visible]:border-ring has-[input:focus-visible]:inset-ring has-[input:focus-visible]:inset-ring-ring',
  'has-[input[aria-invalid=true]]:border-danger has-[input[aria-invalid=true]]:inset-ring-danger',
  'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50',
]

export type ComboboxInputProps = Omit<ComboboxPrimitive.Input.Props, 'size'> & {
  /** Height: `sm` (32px) or `md` (36px, default) — matches Button, Input and Select. */
  size?: 'sm' | 'md'
  /** Show the × that clears the value once there is one. Defaults to true. */
  showClear?: boolean
  /** Accessible name of the clear button. Defaults to "Clear" in the page's language. */
  clearLabel?: string
  /** Show the chevron that opens the list without typing. Defaults to true. */
  showTrigger?: boolean
  /** Accessible name of the chevron. Defaults to "Show options" in the page's language. */
  triggerLabel?: string
  /** Classes on the field around the input (border, width). `className` styles the input. */
  groupClassName?: string
}

/**
 * The single-value field: the text input, a clear button and a chevron, in one
 * bordered box. Give it `aria-label`, or pair it with a Label through `id`.
 */
export function ComboboxInput({
  className,
  size = 'md',
  showClear = true,
  clearLabel: clearLabelProp,
  showTrigger = true,
  triggerLabel: triggerLabelProp,
  groupClassName,
  ...props
}: ComboboxInputProps) {
  const locale = useLocale()
  const clearLabel = clearLabelProp ?? inLanguage(MESSAGES.clear, locale)
  const triggerLabel = triggerLabelProp ?? inLanguage(MESSAGES.showOptions, locale)
  const { setAnchor } = React.useContext(AnchorContext)
  return (
    <ComboboxPrimitive.InputGroup
      ref={setAnchor}
      data-slot="combobox-field"
      data-size={size}
      className={cn(field, groupClassName)}
    >
      <ComboboxPrimitive.Input
        data-slot="combobox-input"
        className={cnState(
          'w-full min-w-0 flex-1 bg-transparent px-3 text-base outline-none md:text-sm',
          size === 'sm' ? 'h-control-sm' : 'h-control',
          'placeholder:text-muted-foreground disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      />
      <span className="flex shrink-0 items-center pe-1 empty:hidden">
        {showClear && (
          <ComboboxPrimitive.Clear
            aria-label={clearLabel}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex size-6 items-center justify-center rounded-sm outline-none focus-visible:ring-2"
          >
            <XIcon className="size-3.5" />
          </ComboboxPrimitive.Clear>
        )}
        {showTrigger && (
          <ComboboxPrimitive.Trigger
            aria-label={triggerLabel}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex size-6 items-center justify-center rounded-sm outline-none focus-visible:ring-2 data-popup-open:[&_svg]:rotate-180"
          >
            <ChevronDownIcon className="size-4 transition-transform" />
          </ComboboxPrimitive.Trigger>
        )}
      </span>
    </ComboboxPrimitive.InputGroup>
  )
}

/**
 * The multi-value field: chips for what is picked, then the input. Backspace
 * in an empty input removes the last chip; Left Arrow moves onto the chips.
 */
export function ComboboxChips({ className, ...props }: ComboboxPrimitive.Chips.Props) {
  const { setAnchor } = React.useContext(AnchorContext)
  return (
    <ComboboxPrimitive.Chips
      ref={setAnchor}
      data-slot="combobox-chips"
      className={cnState(field, 'min-h-control flex-wrap gap-1 px-1.5 py-1', className)}
      {...props}
    />
  )
}

/** One picked value inside ComboboxChips, with its own remove button. */
export function ComboboxChip({
  className,
  children,
  removeLabel,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  /** Accessible name of the × button. Defaults to "Remove" followed by the chip's text. */
  removeLabel?: string
}) {
  const label = removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove')
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cnState(
        'bg-muted text-foreground flex h-6 items-center gap-1 rounded-sm ps-2 pe-0.5 text-xs font-medium outline-none',
        'focus-visible:ring-ring focus-visible:ring-2 data-highlighted:bg-selection',
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ChipRemove
        aria-label={label}
        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex size-5 items-center justify-center rounded-sm"
      >
        <XIcon className="size-3" />
      </ComboboxPrimitive.ChipRemove>
    </ComboboxPrimitive.Chip>
  )
}

/** The input inside ComboboxChips; it takes the rest of the row. */
export function ComboboxChipsInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      className={cnState(
        'h-6 min-w-24 flex-1 bg-transparent px-1.5 text-base outline-none md:text-sm',
        'placeholder:text-muted-foreground disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}

export type ComboboxContentProps = ComboboxPrimitive.Popup.Props &
  Pick<ComboboxPrimitive.Positioner.Props, 'side' | 'sideOffset' | 'align' | 'alignOffset' | 'anchor'>

/** The options panel under the field, as wide as the field; renders its own portal. */
export function ComboboxContent({
  className,
  side,
  sideOffset = 4,
  align = 'start',
  alignOffset,
  anchor,
  ...props
}: ComboboxContentProps) {
  const context = React.useContext(AnchorContext)
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        className="z-50 outline-none"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor ?? context.anchor ?? undefined}
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cnState(
            'flex max-h-[min(var(--available-height),24rem)] w-(--anchor-width) min-w-48 flex-col overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-float',
            popupMotion,
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

/** The scrolling list. Pass a function child to render each of `items`; it is called for the filtered ones only. */
export function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cnState('scroll-py-1 overflow-y-auto p-1 data-empty:p-0', className)}
      {...props}
    />
  )
}

/** One option. `value` is the item itself; a check marks the selected one(s). */
export function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cnState(
        'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-8 text-sm outline-none select-none',
        highlightedItem,
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        '[&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4',
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator className="absolute end-2 flex size-4 items-center justify-center">
        <CheckIcon className="size-4" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

/** Shown in place of the list when nothing matches the typed text. */
export function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cnState('text-muted-foreground px-3 py-6 text-center text-sm empty:hidden', className)}
      {...props}
    />
  )
}

/** Heading for a ComboboxGroup. */
export function ComboboxGroupLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-group-label"
      className={cnState('text-muted-foreground px-2 py-1 text-xs', className)}
      {...props}
    />
  )
}

/** Horizontal rule between groups. */
export function ComboboxSeparator({ className, ...props }: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cnState('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  )
}
