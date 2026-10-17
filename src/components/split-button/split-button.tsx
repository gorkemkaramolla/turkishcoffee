'use client'

import { createContext, useContext, useRef } from 'react'
import type * as React from 'react'
import { cn } from '../../lib/cn'
import { ChevronDownIcon } from '../../lib/icons'
import { Button, type ButtonProps } from '../button/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../dropdown-menu/dropdown-menu'

type Variant = 'primary' | 'secondary'
type Size = 'sm' | 'md' | 'lg'

const SplitContext = createContext<{
  variant: Variant
  size: Size
  /** The whole split button, which the menu lines up with. */
  root: React.RefObject<HTMLDivElement | null> | null
}>({ variant: 'primary', size: 'md', root: null })

// The line between the halves, and the primary menu half's fill while its menu is
// open (a secondary one takes Button's own open state).
const menuHalf: Record<Variant, string> = {
  primary: 'border-l border-primary-foreground/30 data-popup-open:bg-primary/90',
  // Both halves have a border; drop the menu half's left one so the line stays 1px.
  secondary: 'border-l-0',
}

/**
 * A button with a main action and a menu of related ones: the left half runs
 * the action, the chevron on the right opens the menu, which opens under the
 * whole button from its left edge. Two separate buttons, so
 * each is a tab stop with its own name. `variant` and `size` apply to both halves.
 *
 * @example
 * <SplitButton>
 *   <SplitButtonAction onClick={save}>Save</SplitButtonAction>
 *   <SplitButtonMenu label="More save options">
 *     <DropdownMenuItem onClick={saveAsDraft}>Save as draft</DropdownMenuItem>
 *     <DropdownMenuItem onClick={saveAndClose}>Save and close</DropdownMenuItem>
 *   </SplitButtonMenu>
 * </SplitButton>
 */
export function SplitButton({
  variant = 'primary',
  size = 'md',
  className,
  ref,
  ...props
}: React.ComponentProps<'div'> & {
  /** `primary` (default) or `secondary`, for both halves. */
  variant?: Variant
  /** `sm` · `md` · `lg`, for both halves. */
  size?: Size
}) {
  const root = useRef<HTMLDivElement | null>(null)
  const setRoot = (el: HTMLDivElement | null) => {
    root.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) ref.current = el
  }
  return (
    <SplitContext.Provider value={{ variant, size, root }}>
      <div ref={setRoot} data-slot="split-button" className={cn('inline-flex items-stretch', className)} {...props} />
    </SplitContext.Provider>
  )
}

/** The main action, on the left. Disable it alone to leave the menu usable. */
export function SplitButtonAction({ className, ...props }: Omit<ButtonProps, 'variant' | 'size'>) {
  const { variant, size } = useContext(SplitContext)
  return (
    <Button
      data-slot="split-button-action"
      variant={variant}
      size={size}
      className={cn('rounded-r-none', className)}
      {...props}
    />
  )
}

/**
 * The chevron on the right and the menu it opens; put DropdownMenuItems inside.
 * `label` names the chevron for screen readers ("More save options").
 */
export function SplitButtonMenu({
  label,
  align = 'start',
  disabled,
  className,
  children,
}: {
  /** Accessible name of the chevron button. */
  label: string
  /** Where the menu lines up under the whole split button; its left edge by default. */
  align?: 'start' | 'center' | 'end'
  disabled?: boolean
  className?: string
  /** The menu's items. */
  children: React.ReactNode
}) {
  const { variant, size, root } = useContext(SplitContext)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        disabled={disabled}
        render={
          <Button
            data-slot="split-button-menu"
            variant={variant}
            size={size}
            className={cn('rounded-l-none px-2 has-[>svg]:px-2', menuHalf[variant], className)}
          />
        }
      >
        <ChevronDownIcon />
      </DropdownMenuTrigger>
      {/* Anchored to the whole split button, not the chevron. */}
      <DropdownMenuContent anchor={root ?? undefined} align={align}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
