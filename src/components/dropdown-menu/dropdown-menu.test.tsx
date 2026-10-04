import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './dropdown-menu'

function Menu({ onRename = () => {} }: { onRename?: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Options</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Project</DropdownMenuLabel>
        <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

describe('DropdownMenu', () => {
  it('opens from the trigger and runs an item with onClick', async () => {
    const onRename = vi.fn()
    render(<Menu onRename={onRename} />)
    act(() => screen.getByRole('button', { name: 'Options' }).click())
    const item = await screen.findByRole('menuitem', { name: 'Rename' })
    act(() => item.click())
    expect(onRename).toHaveBeenCalledOnce()
  })

  it('closes on Escape', async () => {
    render(<Menu />)
    act(() => screen.getByRole('button', { name: 'Options' }).click())
    const menu = await screen.findByRole('menu')
    act(() => {
      fireEvent.keyDown(menu, { key: 'Escape' })
    })
    expect(screen.getByRole('button', { name: 'Options' }).getAttribute('aria-expanded')).toBe('false')
  })
})
