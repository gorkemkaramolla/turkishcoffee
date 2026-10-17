import { Fragment, useState, type ReactNode } from 'react'
import {
  Avatar,
  AvatarFallback,
  Badge,
  BellIcon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BuildingIcon,
  Button,
  CalendarIcon,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  FolderUserIcon,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  LogoutIcon,
  MenuIcon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  SearchIcon,
  Separator,
  SettingsIcon,
  Sheet,
  SheetContent,
  SheetTitle,
  Sidebar,
  SidebarCategory,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  SidebarTrigger,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  UserIcon,
  UsersIcon,
  useSidebar,
  WalletIcon,
} from '../../src'
import { ArrowDownIcon, ArrowUpIcon } from '../../src/lib/icons'

export type Page = 'people' | 'time-off' | 'documents' | 'payroll' | 'settings' | 'profile'

function Brand() {
  return (
    <>
      <span className="bg-primary text-primary-foreground grid size-8 shrink-0 place-items-center rounded-md">
        <BuildingIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-sm font-semibold">Torun HR</p>
        <p className="text-muted-foreground truncate text-xs">Torun Yazılım A.Ş.</p>
      </div>
    </>
  )
}

/** The app's navigation, shared by the desktop sidebar and the mobile sheet. */
function Navigation({
  page,
  onNavigate,
  collapsible,
  collapsed,
  onCollapsedChange,
}: {
  page: Page
  onNavigate: (page: Page) => void
  collapsible?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}) {
  // A real app passes render={<Link href="/people" />}; the showcase has no router.
  const link = (target: Page) => ({
    href: `#${target}`,
    active: page === target || (target === 'people' && page === 'profile'),
    onClick: (event: React.MouseEvent) => {
      event.preventDefault()
      onNavigate(target)
    },
  })
  return (
    <Sidebar collapsed={collapsed} onCollapsedChange={onCollapsedChange} className="w-full border-e-0">
      <SidebarHeader>
        <Brand />
        {collapsible && <SidebarTrigger />}
      </SidebarHeader>
      <SidebarContent aria-label="Main" defaultOpenItems={['finance']}>
        <SidebarSection title="Workforce">
          <SidebarItem icon={<UsersIcon />} count={64} {...link('people')}>
            People
          </SidebarItem>
          <SidebarItem
            icon={<CalendarIcon />}
            count={
              <Badge tone="warning" variant="solid">
                8
              </Badge>
            }
            {...link('time-off')}
          >
            Time off
          </SidebarItem>
          <SidebarItem icon={<FolderUserIcon />} {...link('documents')}>
            Documents
          </SidebarItem>
        </SidebarSection>
        <SidebarSection title="Company">
          <SidebarCategory value="finance" icon={<WalletIcon />} label="Finance" active={page === 'payroll'}>
            <SidebarItem {...link('payroll')}>
              Payroll
            </SidebarItem>
            <SidebarItem href="#expenses" disabled>
              Expenses
            </SidebarItem>
          </SidebarCategory>
          <SidebarItem icon={<SettingsIcon />} {...link('settings')}>
            Settings
          </SidebarItem>
        </SidebarSection>
      </SidebarContent>
      <AccountFooter />
    </Sidebar>
  )
}

function AccountFooter() {
  const { collapsed } = useSidebar()
  return (
    <SidebarFooter>
      {!collapsed && (
        <Card className="gap-2 py-3 shadow-none">
          <CardHeader className="px-3">
            <CardTitle className="text-sm">Q4 reviews</CardTitle>
            <CardDescription className="text-xs">41 of 64 submitted · due 31 Oct</CardDescription>
          </CardHeader>
          <CardContent className="px-3">
            <Progress value={64} aria-label="Q4 reviews submitted" />
          </CardContent>
        </Card>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className={cn('h-auto w-full justify-start gap-2.5 px-2 py-1.5 text-start', collapsed && 'justify-center px-0')}
            />
          }
        >
          <Avatar aria-hidden="true">
            <AvatarFallback>GK</AvatarFallback>
          </Avatar>
          {collapsed ? (
            <span className="sr-only">Görkem Karamolla</span>
          ) : (
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-medium">Görkem Karamolla</span>
              <span className="text-muted-foreground block truncate text-xs font-normal">HR administrator</span>
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-56">
          <DropdownMenuLabel>destek@torun.example</DropdownMenuLabel>
          <DropdownMenuItem>
            <UserIcon />
            My profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <ThemeSubmenu />
          <DropdownMenuSeparator />
          <DropdownMenuItem tone="danger">
            <LogoutIcon />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  )
}

function ThemeSubmenu() {
  const [theme, setTheme] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Appearance</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value: string) => {
            setTheme(value)
            document.documentElement.classList.toggle('dark', value === 'dark')
          }}
        >
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}

const notifications = [
  { who: 'Ayşe Yılmaz', what: 'requested 5 days of annual leave', when: '2 h ago', unread: true },
  { who: 'Zeynep Çelik', what: 'requested 8 days of annual leave', when: 'Yesterday', unread: true },
  { who: 'Payroll', what: 'October payroll draft is ready to review', when: 'Mon', unread: false },
]

function Notifications() {
  const unread = notifications.filter((n) => n.unread).length
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={<Button variant="ghost" size="icon" aria-label={`Notifications, ${unread} unread`} className="relative" />}
            />
          }
        >
          <BellIcon />
          <span className="bg-danger ring-background absolute end-2 top-2 size-2 rounded-full ring-2" />
        </TooltipTrigger>
        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <Badge tone="danger" variant="solid">
            {unread} new
          </Badge>
        </div>
        <Separator />
        <ul className="flex flex-col py-1">
          {notifications.map((n) => (
            <li key={n.what} className="flex gap-3 px-4 py-2.5">
              <Avatar className="size-7">
                <AvatarFallback className="text-[10px]">{n.who.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-sm">
                <p>
                  <span className="font-medium">{n.who}</span> {n.what}
                </p>
                <p className="text-muted-foreground text-xs">{n.when}</p>
              </div>
              {n.unread && <span className="bg-primary mt-1.5 size-2 shrink-0 rounded-full" aria-label="Unread" />}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

export type Crumb = { label: string; onClick?: () => void }

export function AppShell({
  page,
  onNavigate,
  crumbs,
  children,
}: {
  page: Page
  onNavigate: (page: Page) => void
  crumbs: Crumb[]
  children: ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const go = (next: Page) => {
    setMenuOpen(false)
    onNavigate(next)
  }

  return (
    <div className="bg-background text-foreground flex min-h-dvh w-full">
      <div
        className={cn(
          'sticky top-0 hidden h-dvh shrink-0 border-e transition-[width] duration-100 lg:block',
          collapsed ? 'w-14' : 'w-64',
        )}
      >
        <Navigation page={page} onNavigate={go} collapsible collapsed={collapsed} onCollapsedChange={setCollapsed} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/90 sticky top-0 z-10 flex h-14 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
              <MenuIcon />
            </Button>
            <SheetContent side="left" className="w-72 gap-0 p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Navigation page={page} onNavigate={go} />
            </SheetContent>
          </Sheet>

          <Breadcrumb className="min-w-0">
            <BreadcrumbList>
              {crumbs.map((crumb, i) => (
                <Fragment key={crumb.label}>
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.onClick ? (
                      <BreadcrumbLink
                        href="#"
                        onClick={(event) => {
                          event.preventDefault()
                          crumb.onClick?.()
                        }}
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ms-auto flex items-center gap-1">
            <InputGroup className="me-2 hidden w-72 md:flex">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search people, requests…" aria-label="Search everything" />
              <InputGroupAddon align="end">
                <kbd className="text-muted-foreground bg-muted rounded border px-1.5 font-sans text-[11px]">⌘K</kbd>
              </InputGroupAddon>
            </InputGroup>
            <Notifications />
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

/** Title, one line of context and the page's actions. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/** A KPI: label, big number, change against last period. */
export function StatCard({
  label,
  value,
  change,
  trend,
  good,
  footnote,
  loading,
}: {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  /** Whether this direction is good news, which picks the colour. */
  good: boolean
  footnote: string
  loading?: boolean
}) {
  return (
    <Card className="gap-2 py-5">
      <CardHeader className="px-5">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 px-5">
        {loading ? (
          <>
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-4 w-36" />
          </>
        ) : (
          <>
            <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-medium [&_svg]:size-3.5',
                  good ? 'text-success-text' : 'text-danger-text',
                )}
              >
                {trend === 'up' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {change}
              </span>
              {footnote}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
