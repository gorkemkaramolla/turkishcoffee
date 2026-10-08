import type * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

/** Badge classes as a function — style a link or other element like a Badge. */
export const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border border-transparent px-1.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors [&>svg]:size-3 [&>svg]:pointer-events-none',
  {
    variants: {
      tone: {
        neutral: '',
        info: '',
        success: '',
        warning: '',
        danger: '',
      },
      variant: {
        soft: '',
        solid: '',
      },
    },
    compoundVariants: [
      { variant: 'soft', tone: 'neutral', className: 'bg-secondary text-secondary-foreground' },
      { variant: 'soft', tone: 'info', className: 'bg-primary-soft text-primary-text' },
      { variant: 'soft', tone: 'success', className: 'bg-success-soft text-success-text' },
      { variant: 'soft', tone: 'warning', className: 'bg-warning-soft text-warning-text' },
      { variant: 'soft', tone: 'danger', className: 'bg-danger-soft text-danger-text' },
      // Neutral solid is the grey of toasts and tooltips, which reads on light and dark pages.
      { variant: 'solid', tone: 'neutral', className: 'bg-inverse text-inverse-foreground' },
      { variant: 'solid', tone: 'info', className: 'bg-primary text-primary-foreground' },
      { variant: 'solid', tone: 'success', className: 'bg-success text-success-foreground' },
      { variant: 'solid', tone: 'warning', className: 'bg-warning text-warning-foreground' },
      { variant: 'solid', tone: 'danger', className: 'bg-danger text-danger-foreground' },
    ],
    defaultVariants: {
      tone: 'neutral',
      variant: 'soft',
    },
  },
)

export type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>

/**
 * Small inline label for a status or count. `tone` says what it means:
 * `neutral` (default) | `info` | `success` | `warning` | `danger`. `variant`
 * says how loud: `soft` (default, a tinted fill for statuses in tables and
 * lists) or `solid` (for counts and the one badge that must stand out). Not
 * interactive — wrap it in a Button or link if it needs to be clickable.
 *
 * @example
 * <Badge tone="success">Paid</Badge>
 * <Badge tone="danger" variant="solid">3</Badge>
 */
export function Badge({ className, tone, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ tone, variant }), className)}
      {...props}
    />
  )
}
