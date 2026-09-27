import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Calendar } from './calendar'

const JAN_2026 = new Date(2026, 0, 1)

describe('Calendar', () => {
  it('calls onSelect with the clicked day', () => {
    const onSelect = vi.fn()
    render(<Calendar mode="single" defaultMonth={JAN_2026} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /January 15th, 2026/ }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect((onSelect.mock.calls[0]![0] as Date).getDate()).toBe(15)
  })

  it('marks range positions on the day buttons', () => {
    render(
      <Calendar
        mode="range"
        defaultMonth={JAN_2026}
        selected={{ from: new Date(2026, 0, 10), to: new Date(2026, 0, 12) }}
      />,
    )
    const day = (n: number) => screen.getByRole('button', { name: new RegExp(`January ${n}th, 2026`) })
    expect(day(10).hasAttribute('data-range-start')).toBe(true)
    expect(day(11).hasAttribute('data-range-middle')).toBe(true)
    expect(day(12).hasAttribute('data-range-end')).toBe(true)
  })
})
