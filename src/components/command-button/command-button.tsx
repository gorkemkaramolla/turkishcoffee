'use client'

import { useRender } from '@base-ui/react/use-render'
import { cn } from '../../lib/cn'
import { ChevronDownIcon } from '../../lib/icons'

export type CommandButtonProps = useRender.ComponentProps<'button'>

/**
 * A borderless command for toolbars and command bars: the icon in the brand
 * colour, the text neutral, a grey fill on hover. Put the icon before the text
 * as a child. As a menu trigger it adds a chevron by itself, and keeps the
 * fill while the menu is open. Pass `render` to make it a link.
 *
 * @example
 * <CommandButton onClick={share}><ShareIcon />Share</CommandButton>
 *
 * <DropdownMenu>
 *   <DropdownMenuTrigger render={<CommandButton />}><PlusIcon />New item</DropdownMenuTrigger>
 *   <DropdownMenuContent align="start">
 *     <DropdownMenuItem><MailIcon />Email message</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 */
export function CommandButton({ className, render, ref, children, ...props }: CommandButtonProps) {
  // Base UI's menu and popover triggers pass aria-haspopup to the element they render.
  const opensMenu = props['aria-haspopup'] !== undefined && props['aria-haspopup'] !== false
  return useRender({
    defaultTagName: 'button',
    render,
    ref,
    props: {
      'data-slot': 'command-button',
      type: render ? undefined : 'button',
      className: cn(
        'inline-flex h-control shrink-0 items-center gap-1.5 rounded-md px-2 text-sm whitespace-nowrap text-foreground',
        'outline-none transition-colors hover:bg-accent active:bg-selection data-popup-open:bg-selection',
        'focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // The leading icon carries the brand colour; the chevron stays quiet.
        '[&>svg:not([data-slot=command-button-chevron])]:text-primary-text',
        className,
      ),
      children: (
        <>
          {children}
          {opensMenu && (
            <ChevronDownIcon data-slot="command-button-chevron" className="size-3.5 text-muted-foreground" />
          )}
        </>
      ),
      ...props,
    },
  })
}
