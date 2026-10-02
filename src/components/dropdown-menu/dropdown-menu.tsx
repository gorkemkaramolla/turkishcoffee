'use client'

import type * as React from 'react'
import { DropdownMenu as MenuPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'
import { CheckIcon, ChevronRightIcon } from '../../lib/icons'

/**
 * Menu of actions opened from a trigger. For choosing a form value use Select.
 *
 * @example
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild>
 *     <Button variant="outline">Options</Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent align="end">
 *     <DropdownMenuLabel>Project</DropdownMenuLabel>
 *     <DropdownMenuItem onSelect={rename}>Rename</DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem variant="destructive" onSelect={remove}>Delete</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 */
export const DropdownMenu = MenuPrimitive.Root
/** Opens the menu. Use `asChild` to make your own Button the trigger. */
export const DropdownMenuTrigger = MenuPrimitive.Trigger
/** Groups related items. */
export const DropdownMenuGroup = MenuPrimitive.Group
/** Wraps a DropdownMenuSubTrigger and DropdownMenuSubContent for a nested menu. */
export const DropdownMenuSub = MenuPrimitive.Sub
/** Holds DropdownMenuRadioItems; controlled with `value` + `onValueChange`. */
export const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup

const surface = [
  'z-50 min-w-32 overflow-y-auto overflow-x-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
  'data-[state=open]:animate-ui-pop-in data-[state=closed]:animate-ui-pop-out',
]

const item = [
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none",
  'focus:bg-accent focus:text-accent-foreground',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
]

/** The menu panel; renders its own portal. */
export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          surface,
          'max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin)',
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  )
}

/**
 * One action. Use `onSelect` (not `onClick`) to run it.
 * `variant="destructive"` colours it for dangerous actions.
 */
export function DropdownMenuItem({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item> & {
  /** `destructive` colours the item for dangerous actions like Delete. */
  variant?: 'default' | 'destructive'
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      className={cn(
        item,
        'data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10',
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
}: React.ComponentProps<typeof MenuPrimitive.CheckboxItem>) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(item, 'pr-2 pl-8', className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </MenuPrimitive.ItemIndicator>
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
}: React.ComponentProps<typeof MenuPrimitive.RadioItem>) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(item, 'pr-2 pl-8', className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenuPrimitive.ItemIndicator>
          <span className="size-2 rounded-full bg-current" />
        </MenuPrimitive.ItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

/** Non-interactive heading inside the menu. */
export function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Label>) {
  return (
    <MenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn('px-2 py-1.5 text-sm font-medium', className)}
      {...props}
    />
  )
}

/** Horizontal rule between groups of items. */
export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('-mx-1 my-1 h-px bg-border', className)}
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
}: React.ComponentProps<typeof MenuPrimitive.SubTrigger>) {
  return (
    <MenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={cn(item, 'data-[state=open]:bg-accent', className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </MenuPrimitive.SubTrigger>
  )
}

/** The nested menu panel. */
export function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.SubContent>) {
  return (
    <MenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(surface, 'origin-(--radix-dropdown-menu-content-transform-origin)', className)}
      {...props}
    />
  )
}
