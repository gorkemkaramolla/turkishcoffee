import { describe, expect, it, vi } from 'vitest'
import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { SplitButton, SplitButtonAction, SplitButtonMenu } from './split-button'
import { DropdownMenuItem } from '../dropdown-menu/dropdown-menu'

function Save({ onSave = () => {}, actionDisabled = false }: { onSave?: () => void; actionDisabled?: boolean }) {
  return (
    <SplitButton variant="secondary">
      <SplitButtonAction onClick={onSave} disabled={actionDisabled}>
        Save
      </SplitButtonAction>
      <SplitButtonMenu label="More save options">
        <DropdownMenuItem>Save as draft</DropdownMenuItem>
      </SplitButtonMenu>
    </SplitButton>
  )
}

describe('SplitButton', () => {
  it('is two buttons: the action and a named menu trigger', () => {
    render(<Save />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
    const menu = screen.getByRole('button', { name: 'More save options' })
    expect(menu.getAttribute('aria-haspopup')).toBe('menu')
  })

  it('runs the action without opening the menu', () => {
    const onSave = vi.fn()
    render(<Save onSave={onSave} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledOnce()
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('opens the menu from the chevron', async () => {
    render(<Save />)
    fireEvent.click(screen.getByRole('button', { name: 'More save options' }))
    expect(await screen.findByRole('menuitem', { name: 'Save as draft' })).toBeTruthy()
  })

  it('keeps the menu usable when only the action is disabled', async () => {
    render(<Save actionDisabled />)
    expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'More save options' }))
    expect(await screen.findByRole('menuitem', { name: 'Save as draft' })).toBeTruthy()
  })

  it("still hands the root to a ref passed in, though it keeps one to anchor the menu", () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <SplitButton ref={ref}>
        <SplitButtonAction>Save</SplitButtonAction>
        <SplitButtonMenu label="More save options">
          <DropdownMenuItem>Save as draft</DropdownMenuItem>
        </SplitButtonMenu>
      </SplitButton>,
    )
    expect(ref.current?.dataset.slot).toBe('split-button')
  })

  it('passes the variant to both halves and joins them', () => {
    render(<Save />)
    const action = screen.getByRole('button', { name: 'Save' })
    const menu = screen.getByRole('button', { name: 'More save options' })
    expect(action.className).toContain('rounded-r-none')
    expect(menu.className).toContain('rounded-l-none')
    expect(action.className).toContain('border-input')
    expect(menu.className).toContain('border-l-0')
  })
})
