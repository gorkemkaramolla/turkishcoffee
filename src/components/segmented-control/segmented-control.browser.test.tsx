import '../../styles/storybook.css'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { SegmentedControl, SegmentedControlItem } from './segmented-control'

afterEach(cleanup)

function luminance(color: string) {
  const [r, g, b] = color.match(/[\d.]+/g)!.slice(0, 3).map((value) => {
    const c = Number(value) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}
function contrast(a: string, b: string) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (high! + 0.05) / (low! + 0.05)
}
/** The colour of an element's visible inset edge, if it has one. */
function insetEdge(element: Element) {
  return getComputedStyle(element)
    .boxShadow.split(/,(?![^(]*\))/)
    .map((shadow) => shadow.trim())
    .find((shadow) => shadow.endsWith('inset') && !shadow.startsWith('rgba(0, 0, 0, 0)'))
}

for (const dark of [false, true]) {
  describe(`SegmentedControl contrast (${dark ? 'dark' : 'light'})`, () => {
    it('the pressed segment is told apart at 3:1, the others by 4.5:1 text alone', () => {
      const { container } = render(
        <div className={dark ? 'dark' : ''}>
          <SegmentedControl aria-label="Status" defaultValue="all">
            <SegmentedControlItem value="all">All</SegmentedControlItem>
            <SegmentedControlItem value="active">Active</SegmentedControlItem>
          </SegmentedControl>
        </div>,
      )
      const track = getComputedStyle(container.querySelector('[data-slot="segmented-control"]')!).backgroundColor
      const pressed = screen.getByRole('button', { name: 'All' })
      const edge = insetEdge(pressed)
      expect(edge).toBeDefined()
      expect(contrast(edge!, track)).toBeGreaterThanOrEqual(3)
      expect(contrast(edge!, getComputedStyle(pressed).backgroundColor)).toBeGreaterThanOrEqual(3)

      const other = screen.getByRole('button', { name: 'Active' })
      expect(insetEdge(other)).toBeUndefined()
      expect(contrast(getComputedStyle(other).color, track)).toBeGreaterThanOrEqual(4.5)
    })
  })
}
