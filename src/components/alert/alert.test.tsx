import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle } from './alert'

describe('Alert', () => {
  it('shows InfoIcon by itself on the info tone', () => {
    render(
      <Alert tone="info">
        <AlertTitle>Heads up</AlertTitle>
      </Alert>,
    )
    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('text-primary-text')
    expect(alert.firstElementChild?.tagName).toBe('svg')
  })

  it('drops the default icon with icon={null}', () => {
    render(<Alert tone="info" icon={null}>Plain</Alert>)
    expect(screen.getByRole('alert').querySelector('svg')).toBeNull()
  })

  it('gives every status tone its own icon', () => {
    const { rerender } = render(<Alert tone="danger">Failed</Alert>)
    expect(screen.getByRole('alert').firstElementChild?.tagName).toBe('svg')

    for (const tone of ['success', 'warning'] as const) {
      rerender(<Alert tone={tone}>Done</Alert>)
      expect(screen.getByRole('alert').firstElementChild?.tagName).toBe('svg')
    }
  })

  it('renders no icon on neutral unless one is passed', () => {
    const { rerender } = render(<Alert>Note</Alert>)
    expect(screen.getByRole('alert').querySelector('svg')).toBeNull()

    rerender(
      <Alert icon={<svg data-testid="custom" />}>
        Note
      </Alert>,
    )
    expect(screen.getByTestId('custom')).toBeTruthy()
  })
})
