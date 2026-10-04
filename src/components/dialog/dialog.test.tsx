import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './dialog'
import { DESKTOP_WIDTH, MOBILE_WIDTH, setViewport } from '../../test/viewport'

function OpenDialog() {
  return (
    <Dialog open>
      <DialogContent>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>Make changes.</DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders a centered modal with a close button on desktop', () => {
    setViewport(DESKTOP_WIDTH)
    render(<OpenDialog />)
    const dialog = screen.getByRole('dialog', { name: 'Edit profile' })
    expect(dialog.getAttribute('data-slot')).toBe('dialog-content')
    expect(dialog.hasAttribute('data-swipe-direction')).toBe(false)
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy()
  })

  it('renders a Base UI drawer without the close button on mobile', () => {
    setViewport(MOBILE_WIDTH)
    render(<OpenDialog />)
    const dialog = screen.getByRole('dialog', { name: 'Edit profile' })
    expect(dialog.getAttribute('data-slot')).toBe('dialog-content')
    // Only Base UI's Drawer popup carries the swipe direction.
    expect(dialog.getAttribute('data-swipe-direction')).toBe('down')
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
  })
})
