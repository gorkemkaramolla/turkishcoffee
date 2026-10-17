import '../../styles/storybook.css'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { ColumnsIcon } from '../../lib/icons'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../dropdown-menu/dropdown-menu'
import { CommandButton } from '../command-button/command-button'
import { Button } from './button'

afterEach(cleanup)

describe('Button as a menu trigger', () => {
  for (const variant of ['secondary', 'ghost'] as const) {
    it(`${variant}: keeps the fill and the primary icon while its menu is open`, async () => {
      const { container } = render(
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant={variant} />}>
            <ColumnsIcon />
            Columns
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Name</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      )
      const trigger = container.querySelector('button')!
      const icon = trigger.querySelector('svg')!
      const resting = { fill: getComputedStyle(trigger).backgroundColor, icon: getComputedStyle(icon).color }

      await page.elementLocator(trigger).click()
      await expect.element(page.getByRole('menu')).toBeVisible()
      // The pointer is on the menu now, not the trigger: the open state alone holds it.
      await page.getByRole('menuitem', { name: 'Name' }).hover()
      expect(trigger.hasAttribute('data-popup-open')).toBe(true)
      expect(getComputedStyle(trigger).backgroundColor).not.toBe(resting.fill)
      expect(getComputedStyle(icon).color).not.toBe(resting.icon)

      const probe = document.createElement('span')
      probe.className = 'text-primary-text'
      document.body.append(probe)
      expect(getComputedStyle(icon).color).toBe(getComputedStyle(probe).color)
      probe.remove()
    })
  }
})

describe('CommandButton', () => {
  it('keeps its icon grey at rest and brand-coloured while its menu is open', async () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<CommandButton />}>
          <ColumnsIcon />
          Columns
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Name</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const trigger = container.querySelector('button')!
    const icon = trigger.querySelector('svg:not([data-slot=command-button-chevron])')!
    const tone = (className: string) => {
      const probe = document.createElement('span')
      probe.className = className
      document.body.append(probe)
      const color = getComputedStyle(probe).color
      probe.remove()
      return color
    }
    expect(getComputedStyle(icon).color).toBe(tone('text-muted-foreground'))

    await page.elementLocator(trigger).click()
    await page.getByRole('menuitem', { name: 'Name' }).hover()
    expect(getComputedStyle(icon).color).toBe(tone('text-primary-text'))
  })
})
