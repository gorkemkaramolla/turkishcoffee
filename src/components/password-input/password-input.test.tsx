import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { LocaleProvider } from '../locale-provider/locale-provider'
import { PasswordInput } from './password-input'

afterEach(cleanup)

const field = () => document.querySelector<HTMLInputElement>('[data-slot="input-group-control"]')!

describe('PasswordInput', () => {
  it('hides the password until the toggle is pressed, and hides it again', () => {
    render(<PasswordInput aria-label="Password" defaultValue="hunter2" />)
    const toggle = screen.getByRole('button', { name: 'Show password' })
    expect(field().type).toBe('password')
    expect(toggle.getAttribute('aria-pressed')).toBe('false')

    act(() => toggle.click())
    expect(field().type).toBe('text')
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    // One name in both states: the pressed state says which.
    expect(screen.getByRole('button', { name: 'Show password' })).toBe(toggle)

    act(() => toggle.click())
    expect(field().type).toBe('password')
  })

  it('passes the rest to the input and names the toggle in the page language', () => {
    render(
      <LocaleProvider locale="tr-TR">
        <PasswordInput id="password" name="password" autoComplete="current-password" required disabled />
      </LocaleProvider>,
    )
    expect(field().id).toBe('password')
    expect(field().name).toBe('password')
    expect(field().autocomplete).toBe('current-password')
    expect(field().required).toBe(true)
    const toggle = screen.getByRole('button', { name: 'Şifreyi göster' }) as HTMLButtonElement
    expect(toggle.disabled).toBe(true)
  })
})
