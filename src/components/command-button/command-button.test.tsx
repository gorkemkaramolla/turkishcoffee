import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CommandButton } from './command-button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../dropdown-menu/dropdown-menu'

const chevronOf = (el: HTMLElement) => el.querySelector('[data-slot="command-button-chevron"]')

describe('CommandButton', () => {
  it('is a plain button with no chevron on its own', () => {
    render(<CommandButton>Share</CommandButton>)
    const button = screen.getByRole('button', { name: 'Share' })
    expect(button.getAttribute('type')).toBe('button')
    expect(chevronOf(button)).toBeNull()
  })

  it('adds a chevron as a menu trigger and opens the menu', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<CommandButton />}>New item</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Email message</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const trigger = screen.getByRole('button', { name: 'New item' })
    expect(chevronOf(trigger)).toBeTruthy()
    fireEvent.click(trigger)
    expect(await screen.findByRole('menuitem', { name: 'Email message' })).toBeTruthy()
    expect(trigger.hasAttribute('data-popup-open')).toBe(true)
  })

  it('renders as a link with render', () => {
    render(<CommandButton render={<a href="/reports" />}>Reports</CommandButton>)
    const link = screen.getByRole('link', { name: 'Reports' })
    expect(link.getAttribute('type')).toBeNull()
  })
})
