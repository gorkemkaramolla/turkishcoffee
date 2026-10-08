'use client'

import { Children, createContext, useContext } from 'react'
import type * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { cn } from '../../lib/cn'
import { Avatar, AvatarFallback, AvatarImage } from '../avatar/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip/tooltip'

const sizes = {
  sm: 'size-7 text-[0.625rem]',
  md: 'size-8 text-xs',
  lg: 'size-9 text-xs',
} as const

type Size = keyof typeof sizes

const SizeContext = createContext<Size>('md')
// Inside the overflow popover an item is a row of avatar + name, not a bare avatar.
const InOverflowContext = createContext(false)

// Stacked: each slot after the first tucks under the one before. Spread on
// hover, on keyboard focus and while the overflow list is open. :focus-visible,
// not focus-within: closing the list returns focus to the +N button, and after
// a click outside that focus must not hold the group spread.
// The slot under the pointer (or keyboard focus) rises above its neighbours.
const slotLayout = cn(
  'relative not-first:-ml-2',
  'group-hover/avatars:not-first:ml-1 group-has-[:focus-visible]/avatars:not-first:ml-1 group-has-[[data-popup-open]]/avatars:not-first:ml-1',
  'hover:z-10 focus-visible:z-10',
  'transition-[margin] duration-150 ease-out motion-reduce:transition-none',
)

// An avatar also grows, so each person can be picked out once the group has spread.
const avatarSlot = cn(
  slotLayout,
  'ring-2 ring-background transition-[margin,scale] hover:scale-110 focus-visible:scale-110',
)

/** Keyboard focus on a slot that is a link or button. */
const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-ring'

// The +N button anchors the overflow list, and the list is positioned from the
// button's on-screen box, which includes any scale. So the button itself never
// scales (else the list jumps when the pointer leaves it for the list); its
// inner disc does, and stays grown while the list is open.
const moreDisc = cn(
  'flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-background',
  'transition-[scale,background-color,color] duration-150 ease-out motion-reduce:transition-none',
  'group-hover/more:scale-110 group-hover/more:bg-selection group-hover/more:text-foreground',
  'group-focus-visible/more:scale-110 group-focus-visible/more:ring-2 group-focus-visible/more:ring-ring',
  'group-data-popup-open/more:scale-110 group-data-popup-open/more:bg-selection group-data-popup-open/more:text-foreground',
)

/**
 * A stack of overlapping avatars for the people on a record. It spreads apart
 * on hover and keyboard focus. Shows `max` avatars (4 by default); the rest
 * collapse into a `+N` button that lists them by name. Children must be
 * AvatarGroupItems, passed directly (an array from `.map()` is fine). Give the
 * group an `aria-label` saying who they are.
 *
 * @example
 * <AvatarGroup aria-label="Reviewers">
 *   {reviewers.map((r) => (
 *     <AvatarGroupItem key={r.id} name={r.name} src={r.avatarUrl} />
 *   ))}
 * </AvatarGroup>
 */
export function AvatarGroup({
  max = 4,
  size = 'md',
  overflowLabel = (count) => `View ${count} more people`,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  /** How many avatars show before the rest collapse into `+N`. */
  max?: number
  /** `sm` 28px · `md` 32px · `lg` 36px. */
  size?: Size
  /** Accessible name of the `+N` button. */
  overflowLabel?: (count: number) => string
}) {
  const items = Children.toArray(children)
  const inline = items.slice(0, max)
  const overflow = items.slice(max)

  return (
    <SizeContext.Provider value={size}>
      <div
        role="group"
        data-slot="avatar-group"
        className={cn('group/avatars flex items-center', className)}
        {...props}
      >
        {inline}
        {overflow.length > 0 && (
          <Popover>
            <PopoverTrigger
              aria-label={overflowLabel(overflow.length)}
              className={cn(
                slotLayout,
                sizes[size],
                'group/more shrink-0 rounded-full font-medium outline-none data-popup-open:z-10',
              )}
            >
              <span data-slot="avatar-group-more" className={moreDisc}>
                +{overflow.length}
              </span>
            </PopoverTrigger>
            <PopoverContent align="start" className="max-h-72 w-auto max-w-64 overflow-y-auto p-1">
              <InOverflowContext.Provider value={true}>
                <ul className="flex flex-col">{overflow}</ul>
              </InOverflowContext.Provider>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </SizeContext.Provider>
  )
}

/** First letters of the first and last word: "Mona Kane" → "MK". */
function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words
  return letters.map((w) => Array.from(w ?? '')[0] ?? '').join('').toLocaleUpperCase()
}

/** A row in the overflow list; the whole row is the link when `render` is one. */
function OverflowRow({ render, children }: { render?: React.ReactElement; children: React.ReactNode }) {
  const row = 'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm'
  const element = useRender({
    defaultTagName: 'div',
    render,
    props: {
      className: cn(row, render && cn(focusRing, 'transition-colors hover:bg-selection')),
      children,
    },
  })
  return <li>{element}</li>
}

/**
 * One person in an AvatarGroup: their image, or their initials while it loads
 * or when there is none. `name` is what screen readers announce, what the
 * hover tooltip and the overflow list show. Pass `render` to make the avatar a
 * link, e.g. to a profile: `render={<Link href="/people/42" />}`.
 */
export function AvatarGroupItem({
  name,
  src,
  initials = initialsOf(name),
  render,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Avatar>, 'children' | 'className' | 'render'> & {
  className?: string
  /** The person's full name. */
  name: string
  /** Image URL; initials show without one. */
  src?: string
  /** Overrides the initials taken from `name`. */
  initials?: string
  /** An element to render the avatar as, usually a link to the person. */
  render?: React.ReactElement
}) {
  const size = useContext(SizeContext)
  const inOverflow = useContext(InOverflowContext)

  const face = (
    <>
      {src && <AvatarImage src={src} alt="" />}
      <AvatarFallback aria-hidden="true">{initials}</AvatarFallback>
    </>
  )

  if (inOverflow) {
    return (
      <OverflowRow render={render}>
        <Avatar aria-hidden="true" className={cn(sizes.sm, className)} {...props}>
          {face}
        </Avatar>
        {name}
      </OverflowRow>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Avatar
            render={render}
            // A link is named by aria-label; a plain avatar is an image.
            role={render ? undefined : 'img'}
            aria-label={name}
            data-slot="avatar-group-item"
            className={cn(avatarSlot, sizes[size], render && focusRing, className)}
            {...props}
          >
            {face}
          </Avatar>
        }
      />
      <TooltipContent>{name}</TooltipContent>
    </Tooltip>
  )
}
