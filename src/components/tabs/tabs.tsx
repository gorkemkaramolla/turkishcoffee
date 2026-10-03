'use client'

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { cnState } from '../../lib/cn'

/**
 * Switches between views in the same place. Uncontrolled with `defaultValue`,
 * controlled with `value` + `onValueChange(value, eventDetails)`.
 *
 * @example
 * <Tabs defaultValue="account">
 *   <TabsList>
 *     <TabsTrigger value="account">Account</TabsTrigger>
 *     <TabsTrigger value="password">Password</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="account">…</TabsContent>
 *   <TabsContent value="password">…</TabsContent>
 * </Tabs>
 */
export function Tabs({
  className,
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cnState('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

/** The row of TabsTriggers. */
export function TabsList({
  className,
  ...props
}: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cnState(
        'inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

/** Selects the TabsContent with the same `value`. */
export function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cnState(
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none",
        'data-active:bg-background data-active:text-foreground data-active:shadow-sm',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

/** Panel shown while its `value` is selected. */
export function TabsContent({
  className,
  ...props
}: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cnState('flex-1 outline-none', className)}
      {...props}
    />
  )
}
