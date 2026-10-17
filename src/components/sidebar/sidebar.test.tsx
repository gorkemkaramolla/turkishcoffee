import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import {
  Sidebar,
  SidebarCategory,
  SidebarContent,
  SidebarHeader,
  SidebarItem,
  SidebarProvider,
  SidebarSection,
  SidebarSwitcher,
  SidebarSwitcherItem,
  SidebarTrigger,
} from './sidebar'

function Nav(props: { collapsed?: boolean; onCollapsedChange?: (collapsed: boolean) => void }) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <span>Brand</span>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent aria-label="Main">
        <SidebarSection title="Workforce">
          <SidebarItem href="/people" active count={64}>
            People
          </SidebarItem>
          <SidebarCategory value="time-off" label="Time off">
            <SidebarItem href="/time-off/requests">Requests</SidebarItem>
            <SidebarCategory value="policies" label="Policies">
              <SidebarItem href="/time-off/policies/annual">Annual leave</SidebarItem>
            </SidebarCategory>
          </SidebarCategory>
          <SidebarItem href="/payroll" disabled>
            Payroll
          </SidebarItem>
        </SidebarSection>
      </SidebarContent>
    </Sidebar>
  )
}

const row = (name: RegExp | string) => screen.getByRole('treeitem', { name })

describe('Sidebar', () => {
  it('is a navigation tree of links, each visible one a tab stop', () => {
    render(<Nav />)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeTruthy()
    expect(screen.getByRole('tree', { name: 'Main' })).toBeTruthy()
    const people = row(/People/)
    expect(people.tagName).toBe('A')
    expect(people.getAttribute('href')).toBe('/people')
    expect(people.getAttribute('aria-current')).toBe('page')
    expect(people.tabIndex).toBe(0)
    expect(row('Time off').tabIndex).toBe(0)
    expect(screen.getByRole('group', { name: 'Workforce' })).toBeTruthy()
    expect(screen.getByText('64')).toBeTruthy()
    expect(row('Payroll').getAttribute('aria-disabled')).toBe('true')
    // Disabled: Tab skips it, the arrow keys still reach it.
    expect(row('Payroll').tabIndex).toBe(-1)
  })

  it('folds a category with click and arrow keys', () => {
    render(<Nav />)
    const category = row('Time off')
    expect(category.getAttribute('aria-expanded')).toBe('false')
    act(() => fireEvent.click(category))
    expect(category.getAttribute('aria-expanded')).toBe('true')
    expect(row('Requests').getAttribute('aria-level')).toBe('2')
    // Folders nest to any depth, one level and one indent step each.
    act(() => fireEvent.click(row('Policies')))
    const annual = row('Annual leave')
    expect(annual.getAttribute('aria-level')).toBe('3')
    expect(annual.style.getPropertyValue('--tree-level')).toBe('2')
    act(() => fireEvent.keyDown(category, { key: 'ArrowLeft' }))
    expect(category.getAttribute('aria-expanded')).toBe('false')
  })

  it('does not follow a disabled link', () => {
    render(<Nav />)
    const click = new MouseEvent('click', { bubbles: true, cancelable: true })
    act(() => {
      row('Payroll').dispatchEvent(click)
    })
    expect(click.defaultPrevented).toBe(true)
  })

  it('collapses to a rail that keeps every accessible name', () => {
    const onCollapsedChange = vi.fn()
    render(<Nav onCollapsedChange={onCollapsedChange} />)
    act(() => fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' })))
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('complementary').hasAttribute('data-collapsed')).toBe(true)
    expect(row(/People/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeTruthy()
    expect(screen.queryByText('64')).toBeNull()
  })

  it('expands the rail and opens a category clicked on it', () => {
    const onCollapsedChange = vi.fn()
    render(<Nav collapsed onCollapsedChange={onCollapsedChange} />)
    act(() => fireEvent.click(row('Time off')))
    expect(onCollapsedChange).toHaveBeenCalledWith(false)
    expect(row('Time off').getAttribute('aria-expanded')).toBe('true')
  })
})

describe('SidebarProvider', () => {
  it('lets a trigger outside the sidebar collapse it', () => {
    const onCollapsedChange = vi.fn()
    render(
      <SidebarProvider onCollapsedChange={onCollapsedChange}>
        <Sidebar aria-label="Desktop" />
        <header>
          <SidebarTrigger />
        </header>
      </SidebarProvider>,
    )
    const sidebar = screen.getByRole('complementary', { name: 'Desktop' })
    act(() => fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' })))
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
    expect(sidebar.hasAttribute('data-collapsed')).toBe(true)
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeTruthy()
  })

  it('leaves a Sidebar with its own `collapsed` alone', () => {
    render(
      <SidebarProvider defaultCollapsed>
        <Sidebar aria-label="Desktop" />
        <Sidebar aria-label="Drawer" collapsed={false} />
      </SidebarProvider>,
    )
    expect(screen.getByRole('complementary', { name: 'Desktop' }).hasAttribute('data-collapsed')).toBe(true)
    expect(screen.getByRole('complementary', { name: 'Drawer' }).hasAttribute('data-collapsed')).toBe(false)
  })
})

describe('SidebarSwitcher', () => {
  function Switcher({ collapsed, onValueChange }: { collapsed?: boolean; onValueChange?: (value: string) => void }) {
    return (
      <Sidebar collapsed={collapsed}>
        <SidebarHeader>
          <SidebarSwitcher icon={<span>TA</span>} label="Torun AVM" description="Owner" value="avm" onValueChange={onValueChange}>
            <SidebarSwitcherItem value="avm">Torun AVM</SidebarSwitcherItem>
            <SidebarSwitcherItem value="gyo">Torun GYO</SidebarSwitcherItem>
          </SidebarSwitcher>
          <SidebarTrigger />
        </SidebarHeader>
      </Sidebar>
    )
  }

  it('opens a menu that checks the current choice and reports a new one', async () => {
    const onValueChange = vi.fn()
    render(<Switcher onValueChange={onValueChange} />)
    const trigger = screen.getByRole('button', { name: /Torun AVM/ })
    expect(trigger.textContent).toContain('Owner')
    act(() => fireEvent.click(trigger))
    const current = await screen.findByRole('menuitemradio', { name: 'Torun AVM' })
    expect(current.getAttribute('aria-checked')).toBe('true')
    act(() => fireEvent.click(screen.getByRole('menuitemradio', { name: 'Torun GYO' })))
    expect(onValueChange).toHaveBeenCalledWith('gyo', expect.anything())
  })

  it('keeps its mark and name on the rail', () => {
    render(<Switcher collapsed />)
    const trigger = screen.getByRole('button', { name: /Torun AVM/ })
    expect(trigger.closest('[data-slot=sidebar-switcher]')).toBeTruthy()
    expect(screen.getByText('TA')).toBeTruthy()
  })
})
