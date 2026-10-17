import '../../styles/storybook.css'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { Form } from './form'
import { FormTabs, FormTabsActions, FormTabsContent, FormTabsList, FormTabsNext, FormTabsPrevious, FormTabsTrigger, useFormTabs } from './form-tabs'
import { Button } from '../button/button'

const names = ['Çalışan kişisel bilgileri', 'Özlük ve işe giriş bilgileri', 'İletişim ve adres bilgileri', 'Bildirim tercihleri', 'Ek bilgiler ve açıklamalar']
function Actions() {
  const { isLast } = useFormTabs()
  return <FormTabsActions><FormTabsPrevious /><FormTabsNext />{isLast && <Button type="submit">Kaydet</Button>}</FormTabsActions>
}
function Example({ linear = true }: { linear?: boolean }) {
  const form = useForm()
  return <div className="w-full min-w-0 p-2"><Form {...form}>
    <form onSubmit={form.handleSubmit(() => {})}>
      <FormTabs linear={linear} labels={{ next: 'Devam et', previous: 'Geri', position: (current, total) => `Adım ${current} / ${total}` }}>
        <FormTabsList aria-label="Form bölümleri">
          {names.map((name) => <FormTabsTrigger key={name} value={name}>{name}</FormTabsTrigger>)}
        </FormTabsList>
        {names.map((name) => <FormTabsContent key={name} value={name}><p>{name} içeriği</p></FormTabsContent>)}
        <Actions />
      </FormTabs>
    </form>
  </Form></div>
}

afterEach(() => { cleanup(); document.documentElement.classList.remove('dark') })

describe('FormTabs layout and keyboard', () => {
  for (const width of [320, 1024]) for (const dark of [false, true]) for (const linear of [false, true]) {
    it(`${width}px ${dark ? 'dark' : 'light'} ${linear ? 'steps' : 'tabs'} preserves labels and contains overflow`, async () => {
      await page.viewport(width, 700)
      document.documentElement.classList.toggle('dark', dark)
      const { container } = render(<Example linear={linear} />)
      const strip = screen.getByRole('tablist').parentElement!
      for (let step = 1; step < names.length; step++) {
        fireEvent.click(screen.getByRole('button', { name: 'Devam et' }))
        await waitFor(() => expect(screen.getByRole('tab', { name: names[step] }).getAttribute('aria-selected')).toBe('true'))
      }
      const active = screen.getByRole('tab', { name: names[4] })
      await waitFor(() => {
        const bounds = strip.getBoundingClientRect()
        const item = active.getBoundingClientRect()
        expect(item.left).toBeGreaterThanOrEqual(bounds.left - 1)
        expect(item.right).toBeLessThanOrEqual(bounds.right + 1)
      })
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width)
      for (const tab of screen.getAllByRole('tab')) expect(tab.getBoundingClientRect().height).toBeGreaterThanOrEqual(32)
      const back = screen.getByRole('button', { name: 'Geri' }).getBoundingClientRect()
      const save = screen.getByRole('button', { name: 'Kaydet' }).getBoundingClientRect()
      expect(save.left).toBeGreaterThan(back.right)
      expect(container.querySelector('[data-slot="form-tabs-actions"]')).toBeTruthy()
      if (linear) expect(screen.getByRole('status').textContent).toBe('Adım 5 / 5')
    })
  }

  it('arrows move focus without activation; Enter and Space select', async () => {
    await page.viewport(1024, 700)
    render(<Example />)
    const first = screen.getByRole('tab', { name: names[0] })
    first.focus()
    await userEvent.keyboard('{ArrowRight}')
    const second = screen.getByRole('tab', { name: names[1] })
    expect(document.activeElement).toBe(second)
    expect(first.getAttribute('aria-selected')).toBe('true')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(second.getAttribute('aria-selected')).toBe('true'))
    await userEvent.keyboard('{ArrowRight}')
    await userEvent.keyboard(' ')
    await waitFor(() => expect(screen.getByRole('tab', { name: names[2] }).getAttribute('aria-selected')).toBe('true'))
  })
})
