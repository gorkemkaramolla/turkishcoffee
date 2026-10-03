import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import type { DateRange } from 'react-day-picker'
import { DatePicker, DateRangePicker } from './date-picker'
import { DESKTOP_WIDTH, MOBILE_WIDTH, setViewport } from '../../test/viewport'

const day = (label: RegExp) => screen.getByRole('button', { name: label })

function ControlledDatePicker() {
  const [value, setValue] = React.useState<Date | undefined>(new Date(2026, 0, 1))
  return <DatePicker value={value} onChange={setValue} />
}

function ControlledRangePicker({ onChange }: { onChange: (r: DateRange | undefined) => void }) {
  const [value, setValue] = React.useState<DateRange | undefined>({
    from: new Date(2026, 0, 1),
    to: new Date(2026, 0, 3),
  })
  return (
    <DateRangePicker
      value={value}
      onChange={(range) => {
        setValue(range)
        onChange(range)
      }}
    />
  )
}

describe('DatePicker', () => {
  beforeEach(() => setViewport(DESKTOP_WIDTH))
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the placeholder when empty', () => {
    render(<DatePicker />)
    expect(screen.getByRole('button', { name: 'Pick a date' })).toBeTruthy()
  })

  it('selects a day, updates the label and closes', () => {
    render(<ControlledDatePicker />)
    fireEvent.click(screen.getByRole('button', { name: 'January 1st, 2026' }))
    fireEvent.click(day(/January 20th, 2026/))
    expect(screen.getByRole('button', { name: 'January 20th, 2026' })).toBeTruthy()
    expect(screen.queryByRole('grid')).toBeNull()
  })

  it('opens in a drawer on mobile', () => {
    setViewport(MOBILE_WIDTH)
    render(<DatePicker value={new Date(2026, 0, 1)} />)
    fireEvent.click(screen.getByRole('button', { name: 'January 1st, 2026' }))
    expect(screen.getByRole('dialog').getAttribute('data-swipe-direction')).toBe('down')
    expect(screen.getByRole('grid')).toBeTruthy()
  })
})

describe('DateRangePicker', () => {
  beforeEach(() => setViewport(DESKTOP_WIDTH))
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts a fresh range and closes only after the second pick', () => {
    const onChange = vi.fn()
    render(<ControlledRangePicker onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Jan 1, 2026 – Jan 3, 2026' }))

    fireEvent.click(day(/January 10th, 2026/))
    expect(onChange).toHaveBeenLastCalledWith({ from: new Date(2026, 0, 10), to: undefined })
    expect(screen.getAllByRole('grid').length).toBe(2)

    fireEvent.click(day(/January 14th, 2026/))
    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 0, 10),
      to: new Date(2026, 0, 14),
    })
    expect(screen.queryByRole('grid')).toBeNull()
    expect(screen.getByRole('button', { name: 'Jan 10, 2026 – Jan 14, 2026' })).toBeTruthy()
  })
})
