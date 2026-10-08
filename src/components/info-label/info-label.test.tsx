import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { InfoLabel } from './info-label'

describe('InfoLabel', () => {
  it('still labels its control', () => {
    render(
      <>
        <InfoLabel htmlFor="iban" info="Salaries are paid here.">IBAN</InfoLabel>
        <input id="iban" />
      </>,
    )
    expect(screen.getByRole('textbox', { name: 'IBAN' })).toBeTruthy()
  })

  it('names the info button after the label', () => {
    render(<InfoLabel info="Salaries are paid here.">IBAN</InfoLabel>)
    expect(screen.getByRole('button', { name: 'More information IBAN' })).toBeTruthy()
  })

  it('keeps a label id passed in', () => {
    render(<InfoLabel id="iban-label" infoLabel="About" info="…">IBAN</InfoLabel>)
    expect(screen.getByRole('button').getAttribute('aria-labelledby')).toContain('iban-label')
    expect(screen.getByRole('button', { name: 'About IBAN' })).toBeTruthy()
  })

  it('opens the explanation on click', async () => {
    render(<InfoLabel info="Salaries are paid here.">IBAN</InfoLabel>)
    expect(screen.queryByText('Salaries are paid here.')).toBeNull()
    fireEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('Salaries are paid here.')).toBeTruthy()
  })

  it('marks the button open, which fills its icon in primary', async () => {
    render(<InfoLabel info="Salaries are paid here.">IBAN</InfoLabel>)
    const button = screen.getByRole('button')
    expect(button.hasAttribute('data-popup-open')).toBe(false)
    fireEvent.click(button)
    await screen.findByText('Salaries are paid here.')
    expect(button.hasAttribute('data-popup-open')).toBe(true)
    expect(button.className).toContain('data-popup-open:text-primary-text')
  })
})
