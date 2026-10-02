import type * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

export const alertVariants = cva(
  [
    'relative grid w-full gap-y-1 rounded-lg border px-4 py-3 text-sm',
    'has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3',
    "[&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:row-span-2 [&>svg]:text-current",
  ],
  {
    variants: {
      variant: {
        default: 'border-border bg-card text-card-foreground',
        destructive: 'border-destructive/50 bg-card text-destructive',
        success: 'border-success/50 bg-card text-success',
        warning: 'border-warning/50 bg-card text-warning',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type AlertProps = React.ComponentProps<'div'> & VariantProps<typeof alertVariants>

/**
 * Inline, non-dismissable message inside the page flow (`role="alert"`).
 * Variants: `default` | `destructive` | `success` | `warning`. Put an icon as the
 * first child and it gets its own column. For a transient message use `toast()`;
 * for a blocking question use AlertDialog.
 *
 * @example
 * <Alert variant="warning">
 *   <AlertTitle>Trial ends soon</AlertTitle>
 *   <AlertDescription>Add a payment method to keep your projects.</AlertDescription>
 * </Alert>
 */
export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

/** Heading line of an Alert. */
export function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('col-start-2 font-medium tracking-tight', className)}
      {...props}
    />
  )
}

/**
 * Body text of an Alert. Inherits the variant colour at 80% rather than
 * always going muted, so a destructive alert stays readable as one block of colour.
 */
export function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('col-start-2 text-sm text-current/80 [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
}
