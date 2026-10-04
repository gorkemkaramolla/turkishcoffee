import type * as React from 'react'
import { cn } from '../../lib/cn'

/**
 * Bordered surface that groups related content. Server-renderable by design:
 * no state, no handlers, no "use client". Compose with the sub-parts rather than
 * passing title/footer props.
 *
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Team</CardTitle>
 *     <CardDescription>Invite people to your workspace.</CardDescription>
 *   </CardHeader>
 *   <CardContent>…</CardContent>
 *   <CardFooter className="justify-end">
 *     <Button>Invite</Button>
 *   </CardFooter>
 * </Card>
 */
export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border py-6 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

/** Top section holding CardTitle and CardDescription. */
export function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-col gap-1.5 px-6', className)}
      {...props}
    />
  )
}

/** Card heading; renders an `<h3>`. */
export function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="card-title"
      className={cn('text-lg leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

/** Muted text under CardTitle. */
export function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

/** Main body of the Card. */
export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />
}

/** Bottom row, usually actions. A flex row: align with `justify-*`. */
export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6', className)}
      {...props}
    />
  )
}
