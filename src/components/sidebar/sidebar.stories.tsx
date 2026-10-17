import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Avatar, AvatarFallback } from '../avatar/avatar'
import { Badge } from '../badge/badge'
import { Button } from '../button/button'
import {
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  FolderUserIcon,
  HomeIcon,
  PlusIcon,
  SettingsIcon,
  UsersIcon,
  WalletIcon,
} from '../../lib/icons'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../breadcrumb/breadcrumb'
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../dropdown-menu/dropdown-menu'
import { Separator } from '../separator/separator'
import {
  Sidebar,
  SidebarCategory,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarProvider,
  SidebarSection,
  SidebarSeparator,
  SidebarSwitcher,
  SidebarSwitcherItem,
  SidebarTrigger,
  useSidebar,
} from './sidebar'

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: { a11y: { test: 'error' } },
} satisfies Meta<typeof Sidebar>
export default meta
type Story = StoryObj<typeof meta>

function Footer() {
  const { collapsed } = useSidebar()
  return (
    <Button variant="ghost" className={collapsed ? 'justify-center px-0' : 'justify-start gap-2.5 px-2'}>
      <Avatar className="size-6" aria-hidden="true">
        <AvatarFallback className="text-[10px]">GK</AvatarFallback>
      </Avatar>
      <span className={collapsed ? 'sr-only' : 'truncate'}>Görkem Karamolla</span>
    </Button>
  )
}

const companies = [
  { id: 'torun-avm', name: 'Torun AVM', role: 'Owner', initials: 'TA' },
  { id: 'torun-gyo', name: 'Torun GYO', role: 'HR', initials: 'TG' },
  { id: 'torun-insaat', name: 'Torun İnşaat', role: 'Employee', initials: 'Tİ' },
]

const Initials = ({ children }: { children: string }) => <span className="text-[10px] font-semibold">{children}</span>

function CompanySwitcher() {
  const [id, setId] = useState('torun-avm')
  const current = companies.find((company) => company.id === id)!
  return (
    <SidebarSwitcher
      icon={<Initials>{current.initials}</Initials>}
      label={current.name}
      description={current.role}
      value={id}
      onValueChange={setId}
    >
      <DropdownMenuLabel>Companies</DropdownMenuLabel>
      {companies.map((company) => (
        <SidebarSwitcherItem key={company.id} value={company.id} icon={<Initials>{company.initials}</Initials>}>
          {company.name}
        </SidebarSwitcherItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <PlusIcon />
        Add company
      </DropdownMenuItem>
    </SidebarSwitcher>
  )
}

/** The links go nowhere in the story; `page` stands in for the router's current path. */
function Navigation({
  defaultCollapsed = false,
  switcher = false,
  shell = false,
}: {
  defaultCollapsed?: boolean
  switcher?: boolean
  /** The trigger in the page's top bar instead of the sidebar header. */
  shell?: boolean
}) {
  const [page, setPage] = useState('people')
  const link = (id: string) => ({
    href: `#${id}`,
    active: page === id,
    onClick: (event: React.MouseEvent) => {
      event.preventDefault()
      setPage(id)
    },
  })
  const sidebar = (
    <Sidebar defaultCollapsed={defaultCollapsed}>
        <SidebarHeader>
          {switcher ? (
            <CompanySwitcher />
          ) : (
            <>
              <span className="bg-primary text-primary-foreground grid size-8 shrink-0 place-items-center rounded-md">
                <BuildingIcon className="size-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">Torun HR</span>
            </>
          )}
          {!shell && <SidebarTrigger />}
        </SidebarHeader>
        <SidebarContent aria-label="Main" defaultOpenItems={['time-off', 'time-off-policies']}>
          <SidebarSection>
            <SidebarItem icon={<HomeIcon />} {...link('home')}>
              Home
            </SidebarItem>
          </SidebarSection>
          <SidebarSection title="Workforce">
            <SidebarItem icon={<UsersIcon />} count={64} {...link('people')}>
              People
            </SidebarItem>
            <SidebarCategory value="time-off" icon={<CalendarIcon />} label="Time off" active={page.startsWith('time-off')}>
              <SidebarItem
                count={
                  <Badge tone="warning" variant="solid">
                    8
                  </Badge>
                }
                {...link('time-off-requests')}
              >
                Requests
              </SidebarItem>
              <SidebarItem {...link('time-off-calendar')}>
                Team calendar
              </SidebarItem>
              <SidebarCategory value="time-off-policies" label="Policies" active={page.startsWith('time-off-policy')}>
                <SidebarItem {...link('time-off-policy-annual')}>
                  Annual leave
                </SidebarItem>
                <SidebarItem {...link('time-off-policy-sick')}>
                  Sick leave
                </SidebarItem>
                <SidebarCategory value="time-off-policies-archive" label="Archive (2025)">
                  <SidebarItem {...link('time-off-policy-2025')}>
                    Leave policy 2025
                  </SidebarItem>
                </SidebarCategory>
              </SidebarCategory>
            </SidebarCategory>
            <SidebarCategory value="recruiting" icon={<BriefcaseIcon />} label="Recruiting" active={page.startsWith('recruiting')}>
              <SidebarItem {...link('recruiting-jobs')}>
                Open positions
              </SidebarItem>
              <SidebarItem {...link('recruiting-candidates')}>
                Candidates
              </SidebarItem>
            </SidebarCategory>
            <SidebarItem icon={<FolderUserIcon />} {...link('documents')}>
              Documents
            </SidebarItem>
          </SidebarSection>
          <SidebarSeparator />
          <SidebarSection title="Company">
            <SidebarItem icon={<WalletIcon />} disabled href="#payroll">
              Payroll
            </SidebarItem>
            <SidebarItem icon={<SettingsIcon />} {...link('settings')}>
              Settings
            </SidebarItem>
          </SidebarSection>
        </SidebarContent>
        <SidebarFooter>
          <Footer />
        </SidebarFooter>
      </Sidebar>
  )
  if (!shell) return <div className="h-[36rem] overflow-hidden rounded-lg border border-border">{sidebar}</div>
  return (
    <SidebarProvider defaultCollapsed={defaultCollapsed}>
      <div className="flex h-[36rem] overflow-hidden rounded-lg border border-border">
        {sidebar}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ms-2" />
            <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>Workforce</BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>People</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex-1 p-4">
            <div className="bg-muted h-full rounded-lg" />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

/** Sections, a folding category with sub-pages, a disabled item and a footer. Collapse it with the button at the top. */
export const Default: Story = {
  render: () => <Navigation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const people = canvas.getByRole('treeitem', { name: /People/ })
    await expect(people).toHaveAttribute('aria-current', 'page')
    // Tab visits every visible row, as in any menu; the arrows move too, → / ← fold a category.
    people.focus()
    await userEvent.tab()
    const timeOff = canvas.getByRole('treeitem', { name: 'Time off' })
    await expect(timeOff).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect(people).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(timeOff).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect(timeOff).toHaveAttribute('aria-expanded', 'false')
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await expect(canvas.getByRole('treeitem', { name: /Requests/ })).toHaveFocus()
    await userEvent.click(canvas.getByRole('treeitem', { name: 'Team calendar' }))
    await expect(canvas.getByRole('treeitem', { name: 'Team calendar' })).toHaveAttribute('aria-current', 'page')
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse sidebar' }))
    // On the rail, the category shows as current while its sub-page is.
    await expect(canvas.getByRole('treeitem', { name: 'Time off' })).toHaveAttribute('data-active')
  },
}

/** The icon rail: labels move into tooltips. Clicking a category expands the sidebar again. */
export const Collapsed: Story = { render: () => <Navigation defaultCollapsed /> }

/** A SidebarSwitcher in the header picks the company the app is looking at; on the rail it keeps only the logo. */
export const WithSwitcher: Story = {
  render: () => <Navigation switcher />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: /Torun AVM/ }))
    await expect(await body.findByRole('menuitemradio', { name: 'Torun AVM' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(body.getByRole('menuitemradio', { name: 'Torun GYO' }))
    await expect(canvas.getByRole('button', { name: /Torun GYO/ })).toBeVisible()
  },
}

/** An app shell: SidebarProvider holds the state, so the trigger sits in the page's top bar beside the breadcrumb. */
export const InAppShell: Story = {
  render: () => <Navigation switcher shell />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse sidebar' }))
    await expect(canvas.getByRole('complementary')).toHaveAttribute('data-collapsed')
    await userEvent.click(canvas.getByRole('button', { name: 'Expand sidebar' }))
    await expect(canvas.getByRole('complementary')).not.toHaveAttribute('data-collapsed')
  },
}
