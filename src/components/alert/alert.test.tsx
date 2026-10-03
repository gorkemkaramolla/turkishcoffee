import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle } from './alert'

describe('Alert', () => {
  it('shows InfoIcon by itself on the info variant', () => {
    render(
      <Alert variant="info">
        <AlertTitle>Heads up</AlertTitle>
      </Alert>,
    )
    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('text-primary')
    expect(alert.firstElementChild?.tagName).toBe('svg')
  })

  it('drops the default icon with icon={null}', () => {
    render(<Alert variant="info" icon={null}>Plain</Alert>)
    expect(screen.getByRole('alert').querySelector('svg')).toBeNull()
  })

  it('gives destructive and success their own icons', () => {
    const { rerender } = render(<Alert variant="destructive">Failed</Alert>)
    expect(screen.getByRole('alert').firstElementChild?.tagName).toBe('svg')

    rerender(<Alert variant="success">Saved</Alert>)
    expect(screen.getByRole('alert').firstElementChild?.tagName).toBe('svg')
  })

  it('renders no icon on default and warning unless one is passed', () => {
    const { rerender } = render(<Alert variant="warning">Careful</Alert>)
    expect(screen.getByRole('alert').querySelector('svg')).toBeNull()

    rerender(
      <Alert variant="warning" icon={<svg data-testid="custom" />}>
        Careful
      </Alert>,
    )
    expect(screen.getByTestId('custom')).toBeTruthy()
  })
})
