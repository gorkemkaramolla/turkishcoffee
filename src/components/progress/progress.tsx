'use client'

import { Progress as ProgressPrimitive } from '@base-ui/react/progress'
import { cnState } from '../../lib/cn'

export type ProgressProps = Omit<ProgressPrimitive.Root.Props, 'value'> & {
  /** 0–100 by default. Leave out, or pass `null`, for an indeterminate bar. */
  value?: number | null
}

/**
 * Horizontal bar for a known completion percentage (`value`, 0–100). For
 * unknown durations use Spinner or Skeleton.
 *
 * @example
 * <Progress value={uploadPercent} aria-label="Upload progress" />
 */
export function Progress({ className, value = null, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cnState('relative w-full', className)}
      {...props}
    >
      <ProgressPrimitive.Track
        data-slot="progress-track"
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        {/* Base UI sets the indicator's width from `value`. */}
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="h-full bg-primary transition-[width]"
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}
