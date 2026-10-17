# CommandButton

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { CommandButton, type CommandButtonProps } from 'turkishcoffee'
```

A borderless command for toolbars and command bars: text and icon neutral
at rest; on hover a grey fill and the icon in the brand colour, as on a
Button. Put the icon before the text as a child. As a menu trigger it adds
a chevron by itself, and while the menu is open keeps a pressed fill and
the brand-coloured icon. Pass `render` to make it a link.

## Example

```tsx
<CommandButton onClick={share}><ShareIcon />Share</CommandButton>

<DropdownMenu>
  <DropdownMenuTrigger render={<CommandButton />}><PlusIcon />New item</DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    <DropdownMenuItem><MailIcon />Email message</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Parts

- `type CommandButtonProps`
