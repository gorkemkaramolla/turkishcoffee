import { describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

const plans = { free: 'Free', pro: 'Pro' }

function PlanSelect(props: { defaultValue?: string }) {
  return (
    <Select items={plans} {...props}>
      <SelectTrigger>
        <SelectValue placeholder="Choose a plan" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="pro">Pro</SelectItem>
      </SelectContent>
    </Select>
  )
}

describe('Select', () => {
  it('shows the placeholder until a value is chosen', () => {
    render(<PlanSelect />)
    const trigger = screen.getByRole('combobox')
    expect(trigger.textContent).toContain('Choose a plan')
    expect(trigger.hasAttribute('data-placeholder')).toBe(true)
  })

  it("shows the chosen item's label, not its value", () => {
    render(<PlanSelect defaultValue="pro" />)
    expect(screen.getByRole('combobox').textContent).toContain('Pro')
  })

  it('picks a value from the list', async () => {
    render(<PlanSelect />)
    act(() => screen.getByRole('combobox').click())
    const option = await screen.findByRole('option', { name: 'Pro' })
    act(() => option.click())
    expect(screen.getByRole('combobox').textContent).toContain('Pro')
  })
})
