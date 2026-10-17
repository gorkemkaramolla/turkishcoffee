'use client'

import * as React from 'react'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { cn, cnState } from '../../lib/cn'
import { inLanguage } from '../../lib/i18n'
import { MESSAGES } from '../../lib/messages'
import { useLocale } from '../locale-provider/locale-provider'
import { CheckIcon, ChevronsUpDownIcon, SidebarIcon } from '../../lib/icons'
import { highlightedItem } from '../../lib/states'
import { Button } from '../button/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../dropdown-menu/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip/tooltip'
import { Tree, TreeGroup, TreeItem, TreeItemLayout, useTreeItem, type TreeProps } from '../tree/tree'

type SidebarContextValue = {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  /** Set by SidebarProvider and Sidebar; false only for the default value. */
  provided: boolean
}

const SidebarContext = React.createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
  provided: false,
})

/** Whether the surrounding Sidebar (or SidebarProvider) is collapsed to its icon rail, and a setter. */
export const useSidebar = () => React.useContext(SidebarContext)

type CollapsedState = {
  /** Icon rail: icons only, labels in tooltips. */
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

function useCollapsedState({ collapsed: collapsedProp, defaultCollapsed = false, onCollapsedChange }: CollapsedState) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultCollapsed)
  const collapsed = collapsedProp ?? uncontrolled
  return React.useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      setCollapsed: (next) => {
        if (collapsedProp === undefined) setUncontrolled(next)
        onCollapsedChange?.(next)
      },
      provided: true,
    }),
    [collapsed, collapsedProp, onCollapsedChange],
  )
}

export type SidebarProviderProps = CollapsedState & { children?: React.ReactNode }

/**
 * Holds the Sidebar's collapsed state above it, so a SidebarTrigger can sit
 * outside the sidebar — in the page's top bar, beside the breadcrumb.
 * Renders no element of its own. A Sidebar inside it follows it; give that
 * Sidebar its own `collapsed` (e.g. `collapsed={false}` for the copy in a
 * mobile Sheet) to opt out.
 *
 * @example
 * <SidebarProvider defaultCollapsed={cookie === '1'} onCollapsedChange={saveCookie}>
 *   <div className="flex min-h-dvh">
 *     <Sidebar>…</Sidebar>
 *     <div className="flex-1">
 *       <header className="flex h-14 items-center gap-2 px-4">
 *         <SidebarTrigger className="-ms-2" />
 *         <Breadcrumb>…</Breadcrumb>
 *       </header>
 *       <main>…</main>
 *     </div>
 *   </div>
 * </SidebarProvider>
 */
export function SidebarProvider({ children, ...state }: SidebarProviderProps) {
  return <SidebarContext.Provider value={useCollapsedState(state)}>{children}</SidebarContext.Provider>
}

export type SidebarProps = React.ComponentProps<'aside'> & CollapsedState

/**
 * The app's side navigation: a header, the navigation itself (SidebarContent)
 * and a footer. The navigation is a Tree, and looks like one: folders
 * (SidebarCategory) with the chevron on the left fold their pages
 * (SidebarItem) in and out, to any depth, one indent step per level. Tab
 * visits every visible row, as it does the links of any menu; ↑ ↓ move too,
 * → / ← open and close a folder, Enter follows a link or folds a folder,
 * typing a letter jumps. Items are real links — pass `href`, or `render={<Link href="…" />}`
 * for your router — and `active` marks the current page. `collapsed` shrinks
 * it to an icon rail with the labels in tooltips; SidebarTrigger toggles that,
 * from the SidebarHeader or, under a SidebarProvider, from anywhere on the page.
 * On small screens render the same content inside a Sheet (`side="left"`).
 *
 * @example
 * <Sidebar>
 *   <SidebarHeader>
 *     <span className="font-semibold">Torun HR</span>
 *     <SidebarTrigger />
 *   </SidebarHeader>
 *   <SidebarContent aria-label="Main" defaultOpenItems={['time-off']}>
 *     <SidebarSection title="Workforce">
 *       <SidebarItem icon={<UsersIcon />} active count={64} render={<Link href="/people" />}>People</SidebarItem>
 *       <SidebarCategory value="time-off" icon={<CalendarIcon />} label="Time off">
 *         <SidebarItem render={<Link href="/time-off/requests" />}>Requests</SidebarItem>
 *         <SidebarCategory value="policies" label="Policies">
 *           <SidebarItem render={<Link href="/time-off/policies/annual" />}>Annual leave</SidebarItem>
 *         </SidebarCategory>
 *       </SidebarCategory>
 *     </SidebarSection>
 *   </SidebarContent>
 *   <SidebarFooter>…</SidebarFooter>
 * </Sidebar>
 */
export function Sidebar({ collapsed: collapsedProp, defaultCollapsed, onCollapsedChange, className, ...props }: SidebarProps) {
  const outer = React.useContext(SidebarContext)
  const own = useCollapsedState({ collapsed: collapsedProp, defaultCollapsed, onCollapsedChange })
  const context = outer.provided && collapsedProp === undefined ? outer : own
  const { collapsed } = context
  return (
    <SidebarContext.Provider value={context}>
      <aside
        data-slot="sidebar"
        data-collapsed={collapsed || undefined}
        className={cn(
          // Its grey sets it apart from the page, with no edge. On that grey the
          // page's hover and muted fills would vanish, so inside it they take --selection.
          'bg-sidebar text-foreground flex h-full w-64 shrink-0 flex-col transition-[width] duration-100 ease-out',
          '[--accent:var(--selection)] [--muted:var(--selection)]',
          'data-collapsed:w-14',
          className,
        )}
        {...props}
      />
    </SidebarContext.Provider>
  )
}

/**
 * Top row: the product name or logo, or a SidebarSwitcher, and usually
 * SidebarTrigger. On the rail only the switcher's mark and the trigger show.
 */
export function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  const { collapsed } = useSidebar()
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        'flex min-h-14 items-center gap-2 px-3 py-2 [&>[data-slot=sidebar-trigger]]:ms-auto',
        collapsed &&
          'flex-col justify-center px-2 [&>:not([data-slot=sidebar-trigger]):not([data-slot=sidebar-switcher])]:hidden [&>[data-slot=sidebar-trigger]]:ms-0',
        className,
      )}
      {...props}
    />
  )
}

/** The square a switcher's logo or icon sits in: an image fills it, an icon centres in it. */
const mark =
  "grid shrink-0 place-items-center overflow-hidden border border-border bg-background text-foreground [&>img]:size-full [&>img]:object-cover [&_svg:not([class*='size-'])]:size-4"

export type SidebarSwitcherProps = Omit<React.ComponentProps<'div'>, 'defaultValue'> & {
  /** The current choice's logo or icon; decorative, `label` names it. Shown alone on the rail. */
  icon?: React.ReactNode
  /** The current choice's name. */
  label: React.ReactNode
  /** A quieter second line under the name: a plan, your role there. */
  description?: React.ReactNode
  /** The `value` of the current SidebarSwitcherItem; it gets the check. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string, eventDetails: MenuPrimitive.RadioGroup.ChangeEventDetails) => void
}

/**
 * Switches what the whole app is looking at — a company, a branch, a
 * workspace — from the top of the sidebar: the current one's logo, name and
 * a second line, opening a menu of the others. Put it in SidebarHeader;
 * on the rail it shrinks to the logo. Children are the menu: SidebarSwitcherItems,
 * plus any DropdownMenu parts (a DropdownMenuLabel, a separator, an
 * "Add company" DropdownMenuItem). The app owns what switching means: change
 * `value` (and `label`, `icon`) in `onValueChange`.
 *
 * @example
 * <SidebarHeader>
 *   <SidebarSwitcher icon={<img src={org.logo} alt="" />} label={org.name} description="Owner" value={org.id} onValueChange={switchOrg}>
 *     <DropdownMenuLabel>Companies</DropdownMenuLabel>
 *     {orgs.map((o) => (
 *       <SidebarSwitcherItem key={o.id} value={o.id} icon={<img src={o.logo} alt="" />}>{o.name}</SidebarSwitcherItem>
 *     ))}
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem onClick={addOrg}><PlusIcon />Add company</DropdownMenuItem>
 *   </SidebarSwitcher>
 *   <SidebarTrigger />
 * </SidebarHeader>
 */
export function SidebarSwitcher({
  icon,
  label,
  description,
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: SidebarSwitcherProps) {
  const { collapsed } = useSidebar()
  return (
    <div data-slot="sidebar-switcher" className={cn('min-w-0', collapsed ? 'w-full' : 'flex-1', className)} {...props}>
      <DropdownMenu>
        {/* The menu trigger renders the tooltip's, not the other way round: wrapped in a TooltipTrigger, the menu never opens. */}
        <Tooltip disabled={!collapsed}>
          <DropdownMenuTrigger
            render={<TooltipTrigger />}
            className={cn(
              'flex w-full min-w-0 items-center gap-2 rounded-md p-1 text-start outline-none transition-colors',
              'hover:bg-accent data-popup-open:bg-selection focus-visible:ring-2 focus-visible:ring-ring',
              collapsed && 'justify-center',
            )}
          >
            {icon && (
              <span aria-hidden="true" className={cn(mark, 'size-8 rounded-md')}>
                {icon}
              </span>
            )}
            <span className={cn('min-w-0 flex-1 leading-tight', collapsed && 'sr-only')}>
              <span className="block truncate text-sm font-semibold">{label}</span>
              {description && <span className="text-muted-foreground block truncate text-xs">{description}</span>}
            </span>
            {!collapsed && <ChevronsUpDownIcon className="text-muted-foreground size-4 shrink-0" />}
          </DropdownMenuTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          side={collapsed ? 'right' : 'bottom'}
          align="start"
          className={cn('min-w-56', !collapsed && 'w-(--anchor-width)')}
        >
          <MenuPrimitive.RadioGroup value={value} defaultValue={defaultValue} onValueChange={onValueChange}>
            {children}
          </MenuPrimitive.RadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export type SidebarSwitcherItemProps = MenuPrimitive.RadioItem.Props & {
  /** Its logo or icon, in a small square before the name. */
  icon?: React.ReactNode
}

/** One choice in a SidebarSwitcher's menu: its logo, its name, and a check on the current one. Picking it closes the menu. */
export function SidebarSwitcherItem({ icon, className, children, ...props }: SidebarSwitcherItemProps) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="sidebar-switcher-item"
      closeOnClick
      className={cnState(
        'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none',
        highlightedItem,
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {icon && (
        <span aria-hidden="true" className={cn(mark, 'size-6 rounded-sm')}>
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <MenuPrimitive.RadioItemIndicator className="ms-auto flex">
        <CheckIcon className="size-4" />
      </MenuPrimitive.RadioItemIndicator>
    </MenuPrimitive.RadioItem>
  )
}

export type SidebarContentProps = Pick<TreeProps, 'openItems' | 'defaultOpenItems' | 'onOpenItemsChange' | 'onKeyDown'> &
  Omit<React.ComponentProps<'nav'>, 'onKeyDown'> & {
    /** Names the navigation landmark and its tree. Defaults to "Main". */
    'aria-label'?: string
  }

/**
 * The navigation: a `<nav>` landmark around a Tree of SidebarSections,
 * SidebarItems and SidebarCategories. Scrolls when it is taller than the
 * sidebar. Which categories are open is Tree state: `defaultOpenItems` or
 * `openItems` + `onOpenItemsChange`, by category `value`.
 */
export function SidebarContent({
  'aria-label': labelProp,
  openItems,
  defaultOpenItems,
  onOpenItemsChange,
  onKeyDown,
  className,
  children,
  ...props
}: SidebarContentProps) {
  const locale = useLocale()
  const label = labelProp ?? inLanguage(MESSAGES.mainNavigation, locale)
  return (
    <nav
      aria-label={label}
      data-slot="sidebar-content"
      className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-2', className)}
      {...props}
    >
      <Tree
        aria-label={label}
        openItems={openItems}
        defaultOpenItems={defaultOpenItems}
        onOpenItemsChange={onOpenItemsChange}
        onKeyDown={onKeyDown}
        // A navigation menu: Tab reaches every link and folder, not only one.
        tabStops="every"
        className="gap-4"
      >
        {children}
      </Tree>
    </nav>
  )
}

/** Bottom row: the signed-in user, a help link. Not part of the navigation tree. */
export function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sidebar-footer" className={cn('flex flex-col gap-2 p-2', className)} {...props} />
}

/** A group of items under an optional small heading. The heading hides on the rail but still names the group. */
export function SidebarSection({
  title,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'ul'>, 'title'> & { title?: React.ReactNode }) {
  const { collapsed } = useSidebar()
  const id = React.useId()
  return (
    <li role="none" data-slot="sidebar-section" className="flex flex-col">
      {title && (
        <div id={id} className={cn('text-muted-foreground px-3 pt-1 pb-1.5 text-xs font-medium', collapsed && 'sr-only')}>
          {title}
        </div>
      )}
      <ul role="group" aria-labelledby={title ? id : undefined} className={cn('flex flex-col gap-0.5', className)} {...props}>
        {children}
      </ul>
    </li>
  )
}

/** Hairline between sections. */
export function SidebarSeparator({ className, ...props }: React.ComponentProps<'hr'>) {
  return (
    <li role="none" aria-hidden="true">
      <hr data-slot="sidebar-separator" className={cn('mx-1 border-border', className)} {...props} />
    </li>
  )
}

/**
 * Sidebar rows are Tree rows (TreeItemLayout): chevron on the left, an icon,
 * the label, a count at the end, indented one step per level. These classes
 * add the current page and the icon rail on top.
 */
const rowClasses = (collapsed: boolean) =>
  cn(
    'text-muted-foreground',
    // The current page is the one place in the menu that takes the brand: a
    // soft brand fill with brand text and icon, like a quieter primary button.
    // A closed category (or a rail icon) holding it reads the same way.
    'aria-[current=page]:bg-primary-soft aria-[current=page]:text-primary-text aria-[current=page]:font-medium',
    'data-active:bg-primary-soft data-active:text-primary-text data-active:font-medium',
    'aria-[current=page]:[&_[data-slot=tree-item-icon]]:text-primary-text data-active:[&_[data-slot=tree-item-icon]]:text-primary-text',
    '[&_[data-slot=tree-item-icon]_svg:not([class*=size-])]:size-[1.125rem]',
    'aria-disabled:opacity-50 aria-disabled:hover:bg-transparent',
    // The rail: a centred icon, the label kept for screen readers, no chevron or count.
    collapsed &&
      'justify-center px-0 [&>[data-slot=tree-item-chevron]]:hidden [&>[data-slot=tree-item-end]]:hidden [&>[data-slot=tree-item-text]]:sr-only',
  )

/** On the rail, wraps a row in a tooltip with its label. */
function RailTooltip({ label, children }: { label: React.ReactNode; children: React.ReactElement }) {
  const { collapsed } = useSidebar()
  if (!collapsed) return children
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export type SidebarItemProps = Omit<React.ComponentProps<'a'>, 'value'> & {
  /** Unique within the sidebar. Defaults to `href`, else a generated id. */
  value?: string
  /** Optional. Shown before the label, and alone on the rail — so give top-level items one; deeper levels usually go without. */
  icon?: React.ReactNode
  /** The current page: a soft brand fill with brand text and icon, `aria-current="page"`. */
  active?: boolean
  /** A number or Badge at the end of the row; hidden on the rail. */
  count?: React.ReactNode
  disabled?: boolean
  /** Your router's link, e.g. `<Link href="/people" />`. */
  render?: React.ReactElement
}

/**
 * One page: a link row in the navigation tree. At any level — inside a
 * SidebarCategory it indents one step and lines up under the category's icon.
 */
export function SidebarItem({ value, icon, active, count, disabled, render, href, className, children, onClick, ...props }: SidebarItemProps) {
  const { collapsed } = useSidebar()
  const id = React.useId()
  return (
    <TreeItem value={value ?? href ?? id} data-slot="sidebar-item">
      <RailTooltip label={children}>
        <TreeItemLayout
          render={render ?? <a href={href} />}
          iconBefore={icon}
          aside={collapsed ? undefined : count}
          aria-current={active ? 'page' : undefined}
          aria-disabled={disabled || undefined}
          className={cn(rowClasses(collapsed), className)}
          onClick={(event) => {
            if (disabled) event.preventDefault()
            else onClick?.(event as unknown as React.MouseEvent<HTMLAnchorElement>)
          }}
          {...(props as React.ComponentProps<'div'>)}
        >
          {children}
        </TreeItemLayout>
      </RailTooltip>
    </TreeItem>
  )
}

export type SidebarCategoryProps = Omit<React.ComponentProps<'li'>, 'value' | 'itemType'> & {
  /** Unique within the sidebar; what SidebarContent's open items speak in. */
  value: string
  /** Optional. Shown after the chevron, and alone on the rail — so give top-level categories one. */
  icon?: React.ReactNode
  label: React.ReactNode
  /** One of its pages is current: the category reads as active while closed or on the rail. */
  active?: boolean
}

function CategoryRow({ icon, label, active }: Pick<SidebarCategoryProps, 'icon' | 'label' | 'active'>) {
  const { collapsed, setCollapsed } = useSidebar()
  const { open, setOpen } = useTreeItem()
  return (
    <RailTooltip label={label}>
      <TreeItemLayout
        iconBefore={icon}
        data-active={(active && (!open || collapsed)) || undefined}
        className={rowClasses(collapsed)}
        onClick={(event) => {
          // On the rail there is no room for its pages: expand, then show them.
          if (!collapsed) return
          event.preventDefault()
          setCollapsed(false)
          setOpen(true)
        }}
      >
        {label}
      </TreeItemLayout>
    </RailTooltip>
  )
}

/**
 * A folder of pages: a branch row with the chevron on the left that folds its
 * SidebarItems — and further SidebarCategories, to any depth — in and out.
 * On the rail, clicking it expands the sidebar and opens it.
 */
export function SidebarCategory({ value, icon, label, active, className, children, ...props }: SidebarCategoryProps) {
  const { collapsed } = useSidebar()
  return (
    <TreeItem value={value} itemType="branch" data-slot="sidebar-category" className={className} {...props}>
      <CategoryRow icon={icon} label={label} active={active} />
      {!collapsed && <TreeGroup className="gap-0.5 pt-0.5">{children}</TreeGroup>}
    </TreeItem>
  )
}

/**
 * Collapses the sidebar to its icon rail and back. Inside the SidebarHeader it
 * sits at the end; under a SidebarProvider it works anywhere, e.g. at the
 * start of the page's top bar.
 */
export function SidebarTrigger({
  className,
  onClick,
  'aria-label': ariaLabel,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { collapsed, setCollapsed } = useSidebar()
  const locale = useLocale()
  return (
    <Button
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      aria-label={ariaLabel ?? inLanguage(collapsed ? MESSAGES.expandSidebar : MESSAGES.collapseSidebar, locale)}
      aria-expanded={!collapsed}
      className={cn('shrink-0', className)}
      onClick={(event) => {
        onClick?.(event)
        setCollapsed(!collapsed)
      }}
      {...props}
    >
      <SidebarIcon />
    </Button>
  )
}
