import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { SegmentedControl, SegmentedControlCount, SegmentedControlItem } from './segmented-control'

const meta = { title: 'Components/SegmentedControl', component: SegmentedControl } satisfies Meta<typeof SegmentedControl>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <SegmentedControl aria-label="View" defaultValue="list">
      <SegmentedControlItem value="list">List</SegmentedControlItem>
      <SegmentedControlItem value="board">Board</SegmentedControlItem>
      <SegmentedControlItem value="calendar">Calendar</SegmentedControlItem>
    </SegmentedControl>
  ),
}

/** A list's status filter with a count per segment. One segment always stays pressed. */
export const WithCounts: Story = {
  render: function Render() {
    const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
    return (
      <SegmentedControl aria-label="Status" value={status} onValueChange={setStatus}>
        <SegmentedControlItem value="all">
          All <SegmentedControlCount>135</SegmentedControlCount>
        </SegmentedControlItem>
        <SegmentedControlItem value="active">
          Active <SegmentedControlCount>128</SegmentedControlCount>
        </SegmentedControlItem>
        <SegmentedControlItem value="inactive">
          Inactive <SegmentedControlCount>7</SegmentedControlCount>
        </SegmentedControlItem>
      </SegmentedControl>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const active = canvas.getByRole('button', { name: 'Active 128' })
    await userEvent.click(active)
    await expect(active).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(active)
    await expect(active).toHaveAttribute('aria-pressed', 'true')
    await expect(canvas.getByRole('button', { name: 'All 135' })).toHaveAttribute('aria-pressed', 'false')
    // Arrow keys move focus; Space or Enter presses.
    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('button', { name: 'Inactive 7' })).toHaveFocus()
    await expect(active).toHaveAttribute('aria-pressed', 'true')
  },
}

export const Disabled: Story = {
  render: () => (
    <SegmentedControl aria-label="Period" defaultValue="month" disabled>
      <SegmentedControlItem value="week">Week</SegmentedControlItem>
      <SegmentedControlItem value="month">Month</SegmentedControlItem>
      <SegmentedControlItem value="year">Year</SegmentedControlItem>
    </SegmentedControl>
  ),
}
