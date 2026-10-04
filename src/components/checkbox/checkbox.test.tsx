import { describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { Checkbox } from './checkbox'
import { Label } from '../label/label'

describe('Checkbox', () => {
  it('toggles data-checked when clicked', () => {
    render(<Checkbox aria-label="Accept" />)
    const box = screen.getByRole('checkbox', { name: 'Accept' })
    expect(box.hasAttribute('data-unchecked')).toBe(true)
    act(() => box.click())
    expect(box.hasAttribute('data-checked')).toBe(true)
  })

  it('takes its name from a sibling label', () => {
    render(
      <>
        <Checkbox id="terms" />
        <Label htmlFor="terms">Accept terms</Label>
      </>,
    )
    expect(screen.getByRole('checkbox', { name: 'Accept terms' }).tagName).toBe('BUTTON')
  })
})
