'use client'

import type * as React from 'react'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { cn, cnState } from '../../lib/cn'
import { CheckIcon, ChevronRightIcon } from '../../lib/icons'
import { popupMotion } from '../../lib/motion'

/**
 * Menu of actions opened from a trigger. Built on Base UI's Menu. For choosing a
 * form value use Select.
 *
 * @example
 * <DropdownMenu>
 *   <DropdownMenuTrigger render={<Button variant="outline" />}>Options</DropdownMenuTrigger>
 *   <DropdownMenuContent align="end">
 *     <DropdownMenuLabel>Project</DropdownMenuLabel>
 *     <DropdownMenuItem onClick={rename}>Rename</DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem variant="destructive" onClick={remove}>Delete</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 */
export const DropdownMenu = MenuPrimitive.Root
/** Opens the menu. Pass `render={<Button />}` to make your own Button the trigger. */
export const DropdownMenuTrigger = MenuPrimitive.Trigger
/** Groups related items. */
export const DropdownMenuGroup = MenuPrimitive.Group
/** Wraps a DropdownMenuSubTrigger and DropdownMenuSubContent for a nested menu. */
export const DropdownMenuSub = MenuPrimitive.SubmenuRoot
/** Holds DropdownMenuRadioItems; controlled with `value` + `onValueChange`. */
export const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup

const surface =
  'min-w-32 max-h-(--available-height) overflow-y-auto overflow-x-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none'

const item = [
  'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none',
  'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
  'data-disabled:pointer-events-none data-disabled:opacity-50',
  "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
]

export type DropdownMenuContentProps = MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, 'side' | 'sideOffset' | 'align' | 'alignOffset'>

/** The menu panel; renders its own portal. */
export function DropdownMenuContent({
  className,
  side,
  sideOffset = 4,
  align,
  alignOffset,
  ...props
}: DropdownMenuContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="z-50 outline-none"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cnState(surface, popupMotion, className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

/**
 * One action. Run it with `onClick`; the menu closes afterwards.
 * `variant="destructive"` colours it for dangerous actions.
 */
export function DropdownMenuItem({
  className,
  variant = 'default',
  ...props
}: MenuPrimitive.Item.Props & {
  /** `destructive` colours the item for dangerous actions like Delete. */
  variant?: 'default' | 'destructive'
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      className={cnState(
        item,
        'data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-destructive',
        className,
      )}
      {...props}
    />
  )
}

/** A toggleable item; controlled with `checked` + `onCheckedChange`. */
export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: MenuPrimitive.CheckboxItem.Props) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cnState(item, 'pr-2 pl-8', className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon className="size-4" />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

/** One option inside a DropdownMenuRadioGroup. */
export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: MenuPrimitive.RadioItem.Props) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cnState(item, 'pr-2 pl-8', className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenuPrimitive.RadioItemIndicator>
          <span className="block size-2 rounded-full bg-current" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

/**
 * Non-interactive heading inside the menu. A plain element, so it works
 * anywhere in the menu, inside a DropdownMenuGroup or not.
 */
export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dropdown-menu-label"
      className={cn('px-2 py-1.5 text-sm font-medium', className)}
      {...props}
    />
  )
}

/** Horizontal rule between groups of items. */
export function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cnState('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

/** Right-aligned keyboard hint inside an item, e.g. `⌘K`. Display only. */
export function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn('text-muted-foreground ml-auto text-xs tracking-widest', className)}
      {...props}
    />
  )
}

/** Item that opens a nested DropdownMenuSubContent. */
export function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={cnState(item, 'data-popup-open:bg-accent', className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

/** The nested menu panel; opens beside its DropdownMenuSubTrigger. */
export function DropdownMenuSubContent({
  className,
  sideOffset = 0,
  alignOffset = -4,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      className={className}
      {...props}
    />
  )
}
