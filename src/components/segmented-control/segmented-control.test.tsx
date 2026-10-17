import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { SegmentedControl, SegmentedControlCount, SegmentedControlItem } from './segmented-control'

const pressed = (name: string) => screen.getByRole('button', { name }).getAttribute('aria-pressed')

function Status({ onValueChange }: { onValueChange?: (value: string) => void }) {
  const [status, setStatus] = useState('all')
  return (
    <SegmentedControl
      aria-label="Status"
      value={status}
      onValueChange={(value) => {
        setStatus(value)
        onValueChange?.(value)
      }}
    >
      <SegmentedControlItem value="all">All</SegmentedControlItem>
      <SegmentedControlItem value="active">
        Active <SegmentedControlCount>12</SegmentedControlCount>
      </SegmentedControlItem>
    </SegmentedControl>
  )
}

describe('SegmentedControl', () => {
  it('is a named group of toggle buttons with one pressed', () => {
    render(<Status />)
    expect(screen.getByRole('group', { name: 'Status' })).toBeTruthy()
    expect(pressed('All')).toBe('true')
    expect(pressed('Active 12')).toBe('false')
  })

  it('reports a single value and moves the pressed state', () => {
    const onValueChange = vi.fn()
    render(<Status onValueChange={onValueChange} />)
    act(() => screen.getByRole('button', { name: 'Active 12' }).click())
    expect(onValueChange).toHaveBeenCalledWith('active')
    expect(pressed('Active 12')).toBe('true')
    expect(pressed('All')).toBe('false')
  })

  it('pressing the pressed segment again keeps it pressed and reports nothing', () => {
    const onValueChange = vi.fn()
    render(<Status onValueChange={onValueChange} />)
    act(() => screen.getByRole('button', { name: 'All' }).click())
    expect(onValueChange).not.toHaveBeenCalled()
    expect(pressed('All')).toBe('true')
  })

  it('uncontrolled: starts from defaultValue and never empties', () => {
    render(
      <SegmentedControl aria-label="View" defaultValue="list">
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="board">Board</SegmentedControlItem>
      </SegmentedControl>,
    )
    expect(pressed('List')).toBe('true')
    act(() => screen.getByRole('button', { name: 'List' }).click())
    expect(pressed('List')).toBe('true')
    act(() => screen.getByRole('button', { name: 'Board' }).click())
    expect(pressed('Board')).toBe('true')
    expect(pressed('List')).toBe('false')
  })
})
