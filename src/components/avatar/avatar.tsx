'use client'

import type * as React from 'react'
import { Avatar as AvatarPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'

/**
 * Round user image with a fallback while it loads or when it fails.
 * Defaults to `size-8`; resize with `className`.
 *
 * @example
 * <Avatar>
 *   <AvatarImage src={user.avatarUrl} alt={user.name} />
 *   <AvatarFallback>GK</AvatarFallback>
 * </Avatar>
 */
export function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  )
}

/** The image; hidden until it has loaded. */
export function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  )
}

/** Shown while AvatarImage loads or when it fails — usually initials. */
export function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-muted text-xs font-medium',
        className,
      )}
      {...props}
    />
  )
}
