'use client'

import type * as React from 'react'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'

/**
 * Switches between views in the same place. Uncontrolled with `defaultValue`,
 * controlled with `value` + `onValueChange`.
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
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

/** The row of TabsTriggers. */
export function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
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
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none",
        'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:pointer-events-none disabled:opacity-50',
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
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}
