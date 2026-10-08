import type { Meta, StoryObj } from '@storybook/react-vite'
import { CommandButton } from './command-button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../dropdown-menu/dropdown-menu'
import { CalendarIcon, MailIcon, PlusIcon, UsersIcon } from '../../lib/icons'

const meta = { title: 'Components/CommandButton', component: CommandButton } satisfies Meta<typeof CommandButton>
export default meta
type Story = StoryObj<typeof meta>

/** As a menu trigger it adds the chevron by itself and stays filled while open. */
export const WithMenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<CommandButton />}>
        <PlusIcon />
        New item
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>
          <MailIcon className="text-primary-text" />
          Email message
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CalendarIcon className="text-primary-text" />
          Calendar event
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

/** A row of commands. Not a `role="toolbar"`: that promises arrow-key navigation this row does not have. */
export const CommandBar: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger render={<CommandButton />}>
          <PlusIcon />
          New
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>Employee</DropdownMenuItem>
          <DropdownMenuItem>Department</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CommandButton>
        <UsersIcon />
        Share
      </CommandButton>
      <CommandButton disabled>
        <MailIcon />
        Send reminder
      </CommandButton>
    </div>
  ),
}
