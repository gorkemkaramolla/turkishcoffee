import type * as React from 'react'
import { cn } from '../../lib/cn'

export type EmptyStateProps = React.ComponentProps<'div'> & {
  /** Pass any icon element — the package pins no icon library. */
  icon?: React.ReactNode
  /** Required: one short line saying what is missing. */
  title: React.ReactNode
  /** Muted text under the title: why it is empty or what to do next. */
  description?: React.ReactNode
  /** Buttons or links rendered under the description. */
  action?: React.ReactNode
}

/**
 * Placeholder for a list or page that has no content yet: icon, title,
 * description and a call to action.
 *
 * @example
 * <EmptyState
 *   icon={<InboxIcon />}
 *   title="No invoices yet"
 *   description="Invoices you create will show up here."
 *   action={<Button>New invoice</Button>}
 * />
 */
export function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-10 text-center',
        className,
      )}
      {...props}
    >
      {icon ? (
        <div
          data-slot="empty-state-icon"
          className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5"
        >
          {icon}
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <p className="font-medium">{title}</p>
        {description ? (
          <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1 flex items-center gap-2">{action}</div> : null}
    </div>
  )
}
