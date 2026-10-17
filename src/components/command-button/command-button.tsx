'use client'

import { useRender } from '@base-ui/react/use-render'
import { cn } from '../../lib/cn'
import { ChevronDownIcon } from '../../lib/icons'

export type CommandButtonProps = useRender.ComponentProps<'button'>

/**
 * A borderless command for toolbars and command bars: text and icon neutral
 * at rest; on hover a grey fill and the icon in the brand colour, as on a
 * Button. Put the icon before the text as a child. As a menu trigger it adds
 * a chevron by itself, and while the menu is open keeps a pressed fill and
 * the brand-coloured icon. Pass `render` to make it a link.
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
        // The leading icon is grey at rest and takes the brand colour on hover, pressed or
        // with its menu open, like a Button's; the chevron stays quiet.
        '[&>svg:not([data-slot=command-button-chevron])]:text-muted-foreground',
        'hover:[&>svg:not([data-slot=command-button-chevron])]:text-primary-text',
        'active:[&>svg:not([data-slot=command-button-chevron])]:text-primary-text',
        'data-popup-open:[&>svg:not([data-slot=command-button-chevron])]:text-primary-text',
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
