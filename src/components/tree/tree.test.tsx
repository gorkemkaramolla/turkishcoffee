import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { Tree, TreeGroup, TreeItem, TreeItemLayout, type TreeProps } from './tree'

function Files(props: Partial<TreeProps>) {
  return (
    <Tree aria-label="Files" {...props}>
      <TreeItem value="docs" itemType="branch">
        <TreeItemLayout>Documents</TreeItemLayout>
        <TreeGroup>
          <TreeItem value="contract">
            <TreeItemLayout>Contract.pdf</TreeItemLayout>
          </TreeItem>
          <TreeItem value="id">
            <TreeItemLayout>ID copy.pdf</TreeItemLayout>
          </TreeItem>
        </TreeGroup>
      </TreeItem>
      <TreeItem value="photos" itemType="branch">
        <TreeItemLayout>Photos</TreeItemLayout>
        <TreeGroup>
          <TreeItem value="team">
            <TreeItemLayout>Team.jpg</TreeItemLayout>
          </TreeItem>
        </TreeGroup>
      </TreeItem>
      <TreeItem value="handbook">
        <TreeItemLayout>Handbook.pdf</TreeItemLayout>
      </TreeItem>
    </Tree>
  )
}

const item = (name: RegExp | string) => screen.getByRole('treeitem', { name })
const press = (key: string) => act(() => fireEvent.keyDown(document.activeElement!, { key }))

describe('Tree', () => {
  it('is one tab stop on the first item, with levels and expanded state', () => {
    render(<Files defaultOpenItems={['docs']} />)
    const docs = item(/^Documents/)
    expect(docs.tabIndex).toBe(0)
    expect(item('Contract.pdf').tabIndex).toBe(-1)
    expect(docs.getAttribute('aria-expanded')).toBe('true')
    expect(item('Contract.pdf').getAttribute('aria-level')).toBe('2')
    expect(item(/^Photos/).getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('treeitem', { name: 'Team.jpg' })).toBeNull()
  })

  it('moves with arrows, opens with →, goes to the parent with ←', () => {
    render(<Files />)
    act(() => item(/^Documents/).focus())
    press('ArrowRight')
    expect(item(/^Documents/).getAttribute('aria-expanded')).toBe('true')
    press('ArrowRight')
    expect(document.activeElement).toBe(item('Contract.pdf'))
    press('ArrowDown')
    expect(document.activeElement).toBe(item('ID copy.pdf'))
    press('ArrowLeft')
    expect(document.activeElement).toBe(item(/^Documents/))
    press('ArrowLeft')
    expect(item(/^Documents/).getAttribute('aria-expanded')).toBe('false')
    press('End')
    expect(document.activeElement).toBe(item('Handbook.pdf'))
    expect(item('Handbook.pdf').tabIndex).toBe(0)
  })

  it('opens every sibling with * and jumps by typed letter', () => {
    render(<Files />)
    act(() => item(/^Documents/).focus())
    press('*')
    expect(item(/^Documents/).getAttribute('aria-expanded')).toBe('true')
    expect(item(/^Photos/).getAttribute('aria-expanded')).toBe('true')
    press('t')
    expect(document.activeElement).toBe(item('Team.jpg'))
  })

  it('selects one item, or toggles several with Space', () => {
    const onSelectedItemsChange = vi.fn()
    const { rerender } = render(<Files selectionMode="single" onSelectedItemsChange={onSelectedItemsChange} />)
    act(() => item('Handbook.pdf').focus())
    press('Enter')
    expect(onSelectedItemsChange).toHaveBeenLastCalledWith(['handbook'])
    expect(item('Handbook.pdf').getAttribute('aria-selected')).toBe('true')

    rerender(<Files selectionMode="multiple" defaultSelectedItems={['docs']} onSelectedItemsChange={onSelectedItemsChange} />)
    expect(screen.getByRole('tree').getAttribute('aria-multiselectable')).toBe('true')
  })

  it('calls onAction and toggles a branch on click', () => {
    const onAction = vi.fn()
    render(<Files onAction={onAction} />)
    act(() => fireEvent.click(screen.getByText('Photos')))
    expect(item(/^Photos/).getAttribute('aria-expanded')).toBe('true')
    expect(onAction).toHaveBeenCalledWith('photos')
    expect(document.activeElement).toBe(item(/^Photos/))
  })
})
