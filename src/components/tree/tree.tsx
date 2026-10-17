'use client'

import * as React from 'react'
import { useRender } from '@base-ui/react/use-render'
import { cn } from '../../lib/cn'
import { CheckIcon, ChevronRightIcon } from '../../lib/icons'

type SelectionMode = 'none' | 'single' | 'multiple'

type TreeContextValue = {
  size: 'sm' | 'md'
  selectionMode: SelectionMode
  isOpen: (value: string) => boolean
  toggleOpen: (value: string, open?: boolean) => void
  isSelected: (value: string) => boolean
  select: (value: string) => void
  activate: (value: string) => void
  active: string | null
  setActive: (value: string) => void
  tabStops: 'one' | 'every'
}

const TreeContext = React.createContext<TreeContextValue | null>(null)

type ItemContextValue = {
  value: string
  level: number
  branch: boolean
  open: boolean
  groupId: string
}
const ItemContext = React.createContext<ItemContextValue | null>(null)
/** The level the next TreeItem sits at: 1 at the root, parent + 1 inside a TreeGroup. */
const LevelContext = React.createContext(1)

function useTree(part: string) {
  const context = React.useContext(TreeContext)
  if (!context) throw new Error(`${part} must be used inside Tree`)
  return context
}

function useItem(part: string) {
  const context = React.useContext(ItemContext)
  if (!context) throw new Error(`${part} must be used inside TreeItem`)
  return context
}

/** A controlled-or-not string set, the shape of open and selected items. */
function useValueSet(controlled: string[] | undefined, initial: string[] | undefined, onChange?: (next: string[]) => void) {
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(initial ?? [])
  const current = controlled ?? uncontrolled
  const set = React.useMemo(() => new Set(current), [current])
  const update = React.useCallback(
    (next: string[]) => {
      if (controlled === undefined) setUncontrolled(next)
      onChange?.(next)
    },
    [controlled, onChange],
  )
  return [set, current, update] as const
}

const isTrue = (value: unknown) => value === true || value === 'true'
const rows = (tree: HTMLElement) => [...tree.querySelectorAll<HTMLElement>('[role=treeitem]')]
const rowByValue = (tree: HTMLElement, value: string) => rows(tree).find((row) => row.dataset.value === value)

export type TreeProps = Omit<React.ComponentProps<'ul'>, 'onSelect'> & {
  /** Row height: `sm` 24px or `md` 32px (default). */
  size?: 'sm' | 'md'
  /** `none` (default) · `single` · `multiple` (with checkboxes). Selection never cascades to children. */
  selectionMode?: SelectionMode
  /** Values of the open branches. */
  openItems?: string[]
  defaultOpenItems?: string[]
  onOpenItemsChange?: (openItems: string[]) => void
  /** Values of the selected items. */
  selectedItems?: string[]
  defaultSelectedItems?: string[]
  onSelectedItemsChange?: (selectedItems: string[]) => void
  /** Called when an item is clicked or activated with Enter: open a file, navigate to a page. */
  onAction?: (value: string) => void
  /**
   * `one` (default): the tree is one tab stop and arrow keys move inside it,
   * the ARIA tree pattern, right for a file tree with hundreds of rows.
   * `every`: each visible row is a tab stop too, as links in a navigation
   * menu are; the arrow keys still work. Rows of closed branches are not
   * rendered, so Tab never lands in them.
   */
  tabStops?: 'one' | 'every'
}

/**
 * A hierarchy people expand and collapse: folders and files, an org chart,
 * nested categories, an app's navigation (Sidebar is built on it). Build it
 * from TreeItems; a branch holds its children in a TreeGroup. One tab stop
 * (or one per row with `tabStops="every"`): ↑ ↓ move, → opens a branch or enters it, ← closes it or goes to the parent,
 * Home / End jump, `*` opens every sibling, and typing a letter jumps to the
 * next item starting with it. Branches open on click and Enter; `onAction`
 * fires for every item. Rows are TreeItemLayout, TreeItemPersonaLayout or your
 * own built on TreeItemRow. Name the tree with `aria-label`.
 *
 * @example
 * <Tree aria-label="Files" defaultOpenItems={['docs']} selectionMode="single">
 *   <TreeItem value="docs" itemType="branch">
 *     <TreeItemLayout iconBefore={<FolderIcon />} aside={<Badge>2</Badge>}>Documents</TreeItemLayout>
 *     <TreeGroup>
 *       <TreeItem value="contract">
 *         <TreeItemLayout iconBefore={<FileIcon />}>Contract.pdf</TreeItemLayout>
 *       </TreeItem>
 *     </TreeGroup>
 *   </TreeItem>
 * </Tree>
 */
export function Tree({
  size = 'md',
  selectionMode = 'none',
  openItems,
  defaultOpenItems,
  onOpenItemsChange,
  selectedItems,
  defaultSelectedItems,
  onSelectedItemsChange,
  onAction,
  tabStops = 'one',
  className,
  onKeyDown,
  children,
  ...props
}: TreeProps) {
  const ref = React.useRef<HTMLUListElement>(null)
  const [open, openList, setOpen] = useValueSet(openItems, defaultOpenItems, onOpenItemsChange)
  const [selected, selectedList, setSelected] = useValueSet(selectedItems, defaultSelectedItems, onSelectedItemsChange)
  const [active, setActive] = React.useState<string | null>(null)
  const typeahead = React.useRef({ text: '', timer: 0 })

  // The tab stop must land on a real row: the active one, else the current
  // page or first selected one, else the first.
  React.useLayoutEffect(() => {
    const tree = ref.current
    if (!tree) return
    const all = rows(tree)
    if (active !== null && all.some((row) => row.dataset.value === active)) return
    const first =
      all.find((row) => row.getAttribute('aria-current') === 'page') ??
      all.find((row) => selected.has(row.dataset.value!)) ??
      all[0]
    if (first) setActive(first.dataset.value!)
  }, [active, selected, open, children])

  const context = React.useMemo<TreeContextValue>(
    () => ({
      size,
      selectionMode,
      isOpen: (value) => open.has(value),
      toggleOpen: (value, next) => {
        const isOpen = open.has(value)
        if (next === isOpen) return
        setOpen(isOpen ? openList.filter((v) => v !== value) : [...openList, value])
      },
      isSelected: (value) => selected.has(value),
      select: (value) => {
        if (selectionMode === 'single') setSelected([value])
        else if (selectionMode === 'multiple')
          setSelected(selected.has(value) ? selectedList.filter((v) => v !== value) : [...selectedList, value])
      },
      activate: (value) => onAction?.(value),
      active,
      setActive,
      tabStops,
    }),
    [size, selectionMode, open, openList, setOpen, selected, selectedList, setSelected, onAction, active, tabStops],
  )

  const focus = (row: HTMLElement | null | undefined) => {
    if (!row) return
    setActive(row.dataset.value!)
    row.focus()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(event)
    const tree = ref.current
    const row = (event.target as HTMLElement).closest<HTMLElement>('[role=treeitem]')
    // Keys typed into an action button or input inside a row are theirs.
    if (event.defaultPrevented || !tree || !row || event.target !== row) return
    const all = rows(tree)
    const index = all.indexOf(row)
    const value = row.dataset.value!
    const branch = row.dataset.branch !== undefined
    const isOpen = row.getAttribute('aria-expanded') === 'true'
    const rtl = getComputedStyle(tree).direction === 'rtl'
    const key = rtl && event.key === 'ArrowRight' ? 'ArrowLeft' : rtl && event.key === 'ArrowLeft' ? 'ArrowRight' : event.key

    const handled = () => event.preventDefault()
    switch (key) {
      case 'ArrowDown':
        handled()
        focus(all[index + 1])
        break
      case 'ArrowUp':
        handled()
        focus(all[index - 1])
        break
      case 'Home':
        handled()
        focus(all[0])
        break
      case 'End':
        handled()
        focus(all.at(-1))
        break
      case 'ArrowRight':
        handled()
        if (branch && !isOpen) context.toggleOpen(value, true)
        else if (branch) focus(document.getElementById(row.dataset.group!)?.querySelector<HTMLElement>('[role=treeitem]'))
        break
      case 'ArrowLeft': {
        handled()
        if (branch && isOpen) {
          context.toggleOpen(value, false)
          break
        }
        const owner = row.closest<HTMLElement>('[role=group][data-owner]')?.dataset.owner
        if (owner !== undefined) focus(rowByValue(tree, owner))
        break
      }
      case 'Enter':
        // A link row follows its link: the browser turns Enter into a click.
        if (row instanceof HTMLAnchorElement && row.href) break
        handled()
        if (branch) context.toggleOpen(value)
        if (selectionMode === 'single') context.select(value)
        context.activate(value)
        break
      case ' ':
        handled()
        if (selectionMode !== 'none') context.select(value)
        else if (branch) context.toggleOpen(value)
        break
      case '*': {
        handled()
        const siblings = [...(row.closest('li')?.parentElement?.children ?? [])]
          .map((li) => li.querySelector<HTMLElement>(':scope > [role=treeitem][data-branch]'))
          .filter((el): el is HTMLElement => el !== null)
        setOpen([...new Set([...openList, ...siblings.map((el) => el.dataset.value!)])])
        break
      }
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const state = typeahead.current
          window.clearTimeout(state.timer)
          state.text += event.key.toLocaleLowerCase()
          state.timer = window.setTimeout(() => (state.text = ''), 500)
          const ordered = [...all.slice(index + (state.text.length === 1 ? 1 : 0)), ...all.slice(0, index + 1)]
          const match = ordered.find((el) => (el.textContent ?? '').trim().toLocaleLowerCase().startsWith(state.text))
          if (match) {
            handled()
            focus(match)
          }
        }
    }
  }

  return (
    <TreeContext.Provider value={context}>
      <LevelContext.Provider value={1}>
        <ul
          ref={ref}
          role="tree"
          aria-multiselectable={selectionMode === 'multiple' || undefined}
          data-slot="tree"
          data-size={size}
          className={cn('flex flex-col text-sm outline-none', className)}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {children}
        </ul>
      </LevelContext.Provider>
    </TreeContext.Provider>
  )
}

export type TreeItemProps = Omit<React.ComponentProps<'li'>, 'value' | 'itemType'> & {
  /** Unique within the Tree; what openItems, selectedItems and onAction speak in. */
  value: string
  /** `branch` holds a TreeGroup and opens; `leaf` (default) does not. */
  itemType?: 'branch' | 'leaf'
}

/**
 * One node. Put a row in it (TreeItemLayout, TreeItemPersonaLayout or your own
 * TreeItemRow) and, for a branch, a TreeGroup after it.
 */
export function TreeItem({ value, itemType = 'leaf', className, children, ...props }: TreeItemProps) {
  const tree = useTree('TreeItem')
  const level = React.useContext(LevelContext)
  const groupId = React.useId()
  const branch = itemType === 'branch'
  const open = branch && tree.isOpen(value)
  const context = React.useMemo(() => ({ value, level, branch, open, groupId }), [value, level, branch, open, groupId])

  return (
    <ItemContext.Provider value={context}>
      <li role="none" data-slot="tree-item" className={cn('flex flex-col', className)} {...props}>
        {children}
      </li>
    </ItemContext.Provider>
  )
}

/** A branch's children. Rendered only while the branch is open. */
export function TreeGroup({ className, ...props }: React.ComponentProps<'ul'>) {
  const item = useItem('TreeGroup')
  if (!item.open) return null
  return (
    <LevelContext.Provider value={item.level + 1}>
      <ul
        role="group"
        id={item.groupId}
        data-owner={item.value}
        data-slot="tree-group"
        className={cn('flex flex-col', className)}
        {...props}
      />
    </LevelContext.Provider>
  )
}

/**
 * The state of the TreeItem around you, for building your own row: its level,
 * whether it is a branch and open, whether it is selected, and setters.
 */
export function useTreeItem() {
  const tree = useTree('useTreeItem')
  const item = useItem('useTreeItem')
  return {
    value: item.value,
    level: item.level,
    branch: item.branch,
    open: item.open,
    selected: tree.isSelected(item.value),
    size: tree.size,
    selectionMode: tree.selectionMode,
    setOpen: (open: boolean) => tree.toggleOpen(item.value, open),
  }
}

export type TreeItemRowProps = useRender.ComponentProps<'div'>

/**
 * The focusable row of a TreeItem — the element that is the `treeitem`. It
 * carries the tree's roles, focus and click behaviour and nothing visual: build
 * your own row on it, or render it as a link with `render={<a href="…" />}`.
 * Clicking it opens a branch, selects, and fires `onAction`; call
 * `event.preventDefault()` in your `onClick` to skip that.
 */
export function TreeItemRow({ render, className, onClick, onFocus, ref, ...props }: TreeItemRowProps) {
  const tree = useTree('TreeItemRow')
  const item = useItem('TreeItemRow')
  const selected = tree.isSelected(item.value)

  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      role: 'treeitem',
      'data-slot': 'tree-item-row',
      'data-value': item.value,
      'data-branch': item.branch || undefined,
      'data-group': item.branch ? item.groupId : undefined,
      'data-selected': selected || undefined,
      'aria-level': item.level,
      'aria-expanded': item.branch ? item.open : undefined,
      'aria-selected': tree.selectionMode === 'none' ? undefined : selected,
      // Every row a tab stop, except a disabled one: arrows still reach it.
      tabIndex:
        (tree.tabStops === 'every' && !isTrue(props['aria-disabled'])) || tree.active === item.value ? 0 : -1,
      className,
      onFocus: (event: React.FocusEvent<HTMLDivElement>) => {
        onFocus?.(event)
        if (event.target === event.currentTarget) tree.setActive(item.value)
      },
      onClick: (event: React.MouseEvent<HTMLDivElement>) => {
        // Clicks on a row's own buttons and fields (its actions) are theirs.
        const target = event.target as HTMLElement
        if (target !== event.currentTarget && target.closest('button, input, select, textarea, [role=menuitem]')) return
        onClick?.(event)
        if (event.defaultPrevented) return
        if (item.branch) tree.toggleOpen(item.value)
        if (tree.selectionMode !== 'none') tree.select(item.value)
        tree.activate(item.value)
        tree.setActive(item.value)
        event.currentTarget.focus()
      },
      ...props,
    },
  })
}

const rowBase = [
  'group/row flex w-full cursor-default items-center gap-2 rounded-sm pe-1 outline-none select-none',
  'ps-[calc(var(--tree-level)*1.25rem+0.25rem)]',
  'hover:bg-accent hover:text-accent-foreground data-selected:bg-selection data-selected:font-medium',
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
  '[&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0',
]

/** Chevron (or its space) and, in a multiple-selection tree, the checkbox. */
function RowStart() {
  const { branch, open, selected, selectionMode } = useTreeItem()
  return (
    <>
      <span
        data-slot="tree-item-chevron"
        className="text-muted-foreground flex size-4 shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        {branch && (
          <ChevronRightIcon
            className={cn('size-3.5 transition-transform duration-100 rtl:-scale-x-100', open && 'rotate-90 rtl:-rotate-90')}
          />
        )}
      </span>
      {selectionMode === 'multiple' && (
        <span
          aria-hidden="true"
          className={cn(
            'flex size-4 shrink-0 items-center justify-center rounded-sm border border-field',
            selected && 'border-primary bg-primary text-primary-foreground',
          )}
        >
          {selected && <CheckIcon className="size-3" />}
        </span>
      )}
    </>
  )
}

/**
 * The end of a row: `aside` at rest, `actions` on hover and focus. Both sit in
 * one grid cell and only their visibility changes, so hovering never moves or
 * resizes anything; actions stay up while a menu they opened is open.
 */
function RowEnd({ aside, actions }: { aside?: React.ReactNode; actions?: React.ReactNode }) {
  const { size } = useTreeItem()
  if (!aside && !actions) return null
  return (
    <span data-slot="tree-item-end" className="grid shrink-0 items-center justify-items-end *:[grid-area:1/1]">
      {aside && (
        <span
          className={cn(
            'text-muted-foreground flex items-center gap-1 text-xs',
            actions &&
              'group-hover/row:invisible group-focus-within/row:invisible group-has-[[data-popup-open]]/row:invisible',
          )}
        >
          {aside}
        </span>
      )}
      {actions && (
        <span
          className={cn(
            'invisible flex items-center gap-0.5',
            'group-hover/row:visible group-focus-within/row:visible group-has-[[data-popup-open]]/row:visible',
            size === 'sm' ? '[&_[data-slot=button]]:size-5' : '[&_[data-slot=button]]:size-6',
          )}
        >
          {actions}
        </span>
      )}
    </span>
  )
}

export type TreeItemLayoutProps = TreeItemRowProps & {
  /** Icon before the text, e.g. a folder. */
  iconBefore?: React.ReactNode
  /** Icon after the text, e.g. a lock. */
  iconAfter?: React.ReactNode
  /** Quiet content at the end of the row: a count, a Badge, a date. Hidden while `actions` show. */
  aside?: React.ReactNode
  /** Buttons shown on hover and focus, e.g. a "More" menu: ghost `size="icon"` Buttons (sized to the row). */
  actions?: React.ReactNode
}

/**
 * The standard row: chevron, optional icon, text, then `aside` (quiet) or
 * `actions` (on hover and focus). Indents itself by level; fixed height.
 */
export function TreeItemLayout({ iconBefore, iconAfter, aside, actions, children, className, style, ...props }: TreeItemLayoutProps) {
  const { level, size } = useTreeItem()
  return (
    <TreeItemRow
      data-slot="tree-item-layout"
      style={{ '--tree-level': level - 1, ...style } as React.CSSProperties}
      className={cn(rowBase, size === 'sm' ? 'h-6' : 'h-control-sm', className)}
      {...props}
    >
      <RowStart />
      {iconBefore && (
        <span data-slot="tree-item-icon" className="text-muted-foreground flex shrink-0 items-center">
          {iconBefore}
        </span>
      )}
      <span data-slot="tree-item-text" className="min-w-0 flex-1 truncate">
        {children}
      </span>
      {iconAfter && <span className="text-muted-foreground flex shrink-0 items-center">{iconAfter}</span>}
      <RowEnd aside={aside} actions={actions} />
    </TreeItemRow>
  )
}

export type TreeItemPersonaLayoutProps = Omit<TreeItemLayoutProps, 'iconBefore' | 'iconAfter'> & {
  /** An Avatar (sized `size-8`, or `size-6` in a `sm` tree). */
  media: React.ReactNode
  /** The second line: a title, an email, a status. */
  description?: React.ReactNode
}

/** A person row: avatar, name and a second line. For org charts and team pickers. */
export function TreeItemPersonaLayout({
  media,
  description,
  aside,
  actions,
  children,
  className,
  style,
  ...props
}: TreeItemPersonaLayoutProps) {
  const { level, size } = useTreeItem()
  return (
    <TreeItemRow
      data-slot="tree-item-layout"
      style={{ '--tree-level': level - 1, ...style } as React.CSSProperties}
      className={cn(rowBase, size === 'sm' ? 'h-9' : 'h-12', className)}
      {...props}
    >
      <RowStart />
      <span className="flex shrink-0 items-center">{media}</span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate">{children}</span>
        {description && <span className="text-muted-foreground truncate text-xs font-normal">{description}</span>}
      </span>
      <RowEnd aside={aside} actions={actions} />
    </TreeItemRow>
  )
}
