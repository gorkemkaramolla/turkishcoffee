import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Avatar, AvatarFallback } from '../avatar/avatar'
import { Badge } from '../badge/badge'
import { Button } from '../button/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../dropdown-menu/dropdown-menu'
import { EllipsisIcon, FileIcon, FolderIcon, FolderOpenIcon, PlusIcon } from '../../lib/icons'
import { Tree, TreeGroup, TreeItem, TreeItemLayout, TreeItemPersonaLayout } from './tree'

const meta = {
  title: 'Components/Tree',
  component: Tree,
  parameters: { a11y: { test: 'error' } },
} satisfies Meta<typeof Tree>
export default meta
type Story = StoryObj<typeof meta>

type Node = { id: string; name: string; children?: Node[]; count?: number }

const files: Node[] = [
  {
    id: 'personnel',
    name: 'Personnel files',
    count: 3,
    children: [
      {
        id: 'ayse',
        name: 'Ayşe Yılmaz',
        children: [
          { id: 'ayse-contract', name: 'Employment contract.pdf' },
          { id: 'ayse-id', name: 'ID card copy.pdf' },
        ],
      },
      { id: 'cagri', name: 'Çağrı Kaya', children: [{ id: 'cagri-contract', name: 'Employment contract.pdf' }] },
      { id: 'ilker', name: 'İlker Öztürk', children: [] },
    ],
  },
  {
    id: 'policies',
    name: 'Policies',
    count: 2,
    children: [
      { id: 'leave', name: 'Leave policy 2026.pdf' },
      { id: 'remote', name: 'Remote work.pdf' },
    ],
  },
  { id: 'handbook', name: 'Employee handbook.pdf' },
]

function FileNodes({ nodes, open }: { nodes: Node[]; open: string[] }) {
  return nodes.map((node) =>
    node.children ? (
      <TreeItem key={node.id} value={node.id} itemType="branch">
        <TreeItemLayout
          iconBefore={open.includes(node.id) ? <FolderOpenIcon /> : <FolderIcon />}
          aside={node.count !== undefined && <Badge>{node.count}</Badge>}
          actions={
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-6" aria-label={`More for ${node.name}`} />}>
                <EllipsisIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <PlusIcon />
                  New folder
                </DropdownMenuItem>
                <DropdownMenuItem>Rename</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        >
          {node.name}
        </TreeItemLayout>
        <TreeGroup>
          {node.children.length === 0 ? (
            <TreeItem value={`${node.id}-empty`}>
              <TreeItemLayout className="text-muted-foreground italic">No files yet</TreeItemLayout>
            </TreeItem>
          ) : (
            <FileNodes nodes={node.children} open={open} />
          )}
        </TreeGroup>
      </TreeItem>
    ) : (
      <TreeItem key={node.id} value={node.id}>
        <TreeItemLayout iconBefore={<FileIcon />}>{node.name}</TreeItemLayout>
      </TreeItem>
    ),
  )
}

/**
 * A file explorer: folders open on click, ← → or Enter; hover a folder for its
 * menu. The open folders are controlled, so the icon follows them.
 */
export const Default: Story = {
  render: function Example() {
    const [open, setOpen] = useState(['personnel', 'ayse'])
    const [selected, setSelected] = useState(['ayse-contract'])
    return (
      <div className="w-80 rounded-lg border border-border p-1">
        <Tree
          aria-label="Documents"
          selectionMode="single"
          openItems={open}
          onOpenItemsChange={setOpen}
          selectedItems={selected}
          onSelectedItemsChange={setSelected}
        >
          <FileNodes nodes={files} open={open} />
        </Tree>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tree = canvas.getByRole('tree', { name: 'Documents' })
    const selected = canvas.getByRole('treeitem', { name: /Employment contract\.pdf/, selected: true })
    selected.focus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect(canvas.getByRole('treeitem', { name: /^Ayşe Yılmaz/ })).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect(canvas.getByRole('treeitem', { name: /^Ayşe Yılmaz/ })).toHaveAttribute('aria-expanded', 'false')
    await userEvent.keyboard('{End}')
    await expect(canvas.getByRole('treeitem', { name: 'Employee handbook.pdf' })).toHaveFocus()
    await userEvent.keyboard('p')
    await expect(canvas.getByRole('treeitem', { name: /^Personnel files/ })).toHaveFocus()
    await expect(tree).toBeInTheDocument()
  },
}

/** `selectionMode="multiple"`: a checkbox per row; Space toggles. Selection does not cascade to children. */
export const MultipleSelection: Story = {
  render: function Example() {
    const [selected, setSelected] = useState<string[]>(['leave'])
    return (
      <div className="flex w-80 flex-col gap-2">
        <div className="rounded-lg border border-border p-1">
          <Tree
            aria-label="Documents to share"
            selectionMode="multiple"
            defaultOpenItems={['policies']}
            selectedItems={selected}
            onSelectedItemsChange={setSelected}
          >
            <FileNodes nodes={files} open={[]} />
          </Tree>
        </div>
        <p className="text-muted-foreground text-xs">{selected.length} selected</p>
      </div>
    )
  },
}

type Person = { id: string; name: string; title: string; reports?: Person[] }
const org: Person = {
  id: 'ceo',
  name: 'Ayşe Yılmaz',
  title: 'Chief executive',
  reports: [
    {
      id: 'cto',
      name: 'Can Demir',
      title: 'Engineering director',
      reports: [
        { id: 'e1', name: 'Gökhan Kılıç', title: 'Senior engineer' },
        { id: 'e2', name: 'Deniz Doğan', title: 'QA engineer' },
      ],
    },
    {
      id: 'cfo',
      name: 'Çağrı Kaya',
      title: 'Finance director',
      reports: [{ id: 'f1', name: 'Zeynep Çelik', title: 'Accountant' }],
    },
    { id: 'hr', name: 'Şule Şahin', title: 'People partner' },
  ],
}

const initials = (name: string) => name.split(' ').map((part) => part[0]).join('')

function OrgNode({ person }: { person: Person }) {
  const layout = (
    <TreeItemPersonaLayout
      media={
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">{initials(person.name)}</AvatarFallback>
        </Avatar>
      }
      description={person.title}
      aside={person.reports && <span>{person.reports.length === 1 ? '1 report' : `${person.reports.length} reports`}</span>}
    >
      {person.name}
    </TreeItemPersonaLayout>
  )
  return person.reports ? (
    <TreeItem value={person.id} itemType="branch">
      {layout}
      <TreeGroup>
        {person.reports.map((report) => (
          <OrgNode key={report.id} person={report} />
        ))}
      </TreeGroup>
    </TreeItem>
  ) : (
    <TreeItem value={person.id}>{layout}</TreeItem>
  )
}

/** TreeItemPersonaLayout for an org chart. */
export const OrgChart: Story = {
  render: () => (
    <div className="w-96 rounded-lg border border-border p-1">
      <Tree aria-label="Organisation" defaultOpenItems={['ceo', 'cto']} selectionMode="single">
        <OrgNode person={org} />
      </Tree>
    </div>
  ),
}

/** `size="sm"`: 24px rows for dense side panels. */
export const Small: Story = {
  render: () => (
    <div className="w-72 rounded-lg border border-border p-1">
      <Tree aria-label="Documents" size="sm" defaultOpenItems={['personnel', 'policies']}>
        <FileNodes nodes={files} open={['personnel', 'policies']} />
      </Tree>
    </div>
  ),
}
