import '../../styles/storybook.css'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Badge } from '../badge/badge'
import { Button } from '../button/button'
import { EllipsisIcon } from '../../lib/icons'
import { Tree, TreeGroup, TreeItem, TreeItemLayout } from './tree'

afterEach(cleanup)

const boxes = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>('[role=treeitem]')].map((row) => {
    const { top, height, width } = row.getBoundingClientRect()
    return [Math.round(top), Math.round(height), Math.round(width)]
  })

function Files({ size }: { size: 'sm' | 'md' }) {
  const more = (
    <Button variant="ghost" size="icon" aria-label="More">
      <EllipsisIcon />
    </Button>
  )
  return (
    <div className="w-72">
      <Tree aria-label="Files" size={size} defaultOpenItems={['docs']} selectionMode="multiple">
        <TreeItem value="docs" itemType="branch">
          <TreeItemLayout aside={<Badge>2</Badge>} actions={more}>
            Documents
          </TreeItemLayout>
          <TreeGroup>
            <TreeItem value="a">
              <TreeItemLayout aside="12 KB" actions={more}>
                Contract.pdf
              </TreeItemLayout>
            </TreeItem>
            <TreeItem value="b">
              <TreeItemLayout actions={more}>ID copy.pdf</TreeItemLayout>
            </TreeItem>
          </TreeGroup>
        </TreeItem>
        <TreeItem value="c">
          <TreeItemLayout aside={<Badge>New</Badge>}>Handbook.pdf</TreeItemLayout>
        </TreeItem>
      </Tree>
    </div>
  )
}

describe('Tree layout', () => {
  // Hover reveals actions in place of the aside; nothing may move or resize.
  for (const size of ['sm', 'md'] as const) {
    it(`keeps every row still while hovering (${size})`, async () => {
      const { container } = render(<Files size={size} />)
      const resting = boxes(container)
      expect(new Set(resting.map(([, height]) => height)).size).toBe(1)
      for (const row of container.querySelectorAll<HTMLElement>('[role=treeitem]')) {
        await page.elementLocator(row).hover()
        expect(boxes(container)).toEqual(resting)
      }
    })
  }
})
