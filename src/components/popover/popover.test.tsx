import { describe, expect, it } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

describe('Popover', () => {
  it('opens from the trigger and closes on Escape', async () => {
    render(
      <Popover>
        <PopoverTrigger>Filters</PopoverTrigger>
        <PopoverContent>Panel</PopoverContent>
      </Popover>,
    )
    const trigger = screen.getByRole('button', { name: 'Filters' })
    act(() => trigger.click())
    const panel = await screen.findByText('Panel')
    expect(panel.getAttribute('data-slot')).toBe('popover-content')

    act(() => {
      fireEvent.keyDown(panel, { key: 'Escape' })
    })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })
})
