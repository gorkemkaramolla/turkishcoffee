import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { Toaster, toast } from './toast'

const iconOf = (text: string) =>
  screen.getByText(text).closest('[data-sonner-toast]')?.querySelector('[data-icon] svg')

describe('Toaster', () => {
  afterEach(() => {
    act(() => toast.dismiss())
    cleanup()
  })

  it('uses the filled icons, coloured by type', async () => {
    render(<Toaster />)
    act(() => {
      toast.success('Saved')
      toast.error('Failed')
      toast.info('Heads up')
    })
    await screen.findByText('Heads up')

    expect(iconOf('Saved')?.getAttribute('fill')).toBe('currentColor')
    expect(iconOf('Saved')?.getAttribute('class')).toContain('text-success')
    expect(iconOf('Failed')?.getAttribute('class')).toContain('text-destructive')
    expect(iconOf('Heads up')?.getAttribute('class')).toContain('text-primary')
  })

  it('gives warning toasts the error icon in the warning colour', async () => {
    render(<Toaster />)
    act(() => {
      toast.warning('Careful')
      toast.error('Failed')
    })
    await screen.findByText('Failed')

    expect(iconOf('Careful')?.innerHTML).toBe(iconOf('Failed')?.innerHTML)
    expect(iconOf('Careful')?.getAttribute('class')).toContain('text-warning')
  })

  it('keeps the action button on the toast surface, outlined', async () => {
    render(<Toaster />)
    act(() => {
      toast('Message archived', { action: { label: 'Undo', onClick: () => {} } })
    })
    const button = await screen.findByRole('button', { name: 'Undo' })
    expect(button.getAttribute('class')).toContain('bg-inverse')
    expect(button.getAttribute('class')).toContain('outline-white/20')
  })

  it('lets the icon follow the text on rich toasts', async () => {
    render(<Toaster richColors />)
    act(() => {
      toast.success('Rich')
    })
    await screen.findByText('Rich')
    expect(iconOf('Rich')?.getAttribute('class')).not.toContain('text-success')
  })
})
