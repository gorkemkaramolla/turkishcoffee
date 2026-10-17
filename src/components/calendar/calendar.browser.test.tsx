import '../../styles/storybook.css'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Calendar } from './calendar'

afterEach(cleanup)

const cellWidths = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>('td')].map((td) => td.getBoundingClientRect().width)

describe('Calendar layout', () => {
  // Read-only days render as text with no DayButton; the cell must size itself.
  it('keeps full-size day cells without a mode', () => {
    const { container } = render(<Calendar defaultMonth={new Date(2026, 9, 1)} />)
    const widths = cellWidths(container)
    expect(widths.length).toBeGreaterThan(27)
    for (const width of widths) expect(width).toBeGreaterThanOrEqual(36)
  })

  it('sizes interactive and read-only months the same', () => {
    const readOnly = render(<Calendar defaultMonth={new Date(2026, 9, 1)} />)
    const interactive = render(<Calendar mode="single" defaultMonth={new Date(2026, 9, 1)} />)
    expect(cellWidths(readOnly.container)).toEqual(cellWidths(interactive.container))
  })
})
