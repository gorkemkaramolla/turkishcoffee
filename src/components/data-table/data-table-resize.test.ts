import { describe, expect, it } from 'vitest'
import { lockedEdgeIds, resizeWithin, type FitColumn } from './internal/autofit'
import { windowSlots } from './internal/column-slots'

const col = (id: string, width: number, extra: Partial<FitColumn> = {}): FitColumn => ({
  id,
  width,
  min: 50,
  max: 1000,
  resizable: true,
  ...extra,
})
// Four columns filling a 1000px frame, the last one fixed (an actions column).
const row = [col('a', 300), col('b', 300), col('c', 300), col('actions', 100, { resizable: false })]
const sum = (widths: Record<string, number>) => Object.values(widths).reduce((total, width) => total + width, 0)

describe('resizeWithin: columns that fit keep the row at the frame width', () => {
  it('wider: the neighbours on the right give way, nearest first, down to their minimum', () => {
    expect(resizeWithin(row, 'a', 400, 1000)).toEqual({ a: 400, b: 200, c: 300, actions: 100 })
    expect(resizeWithin(row, 'a', 700, 1000)).toEqual({ a: 700, b: 50, c: 150, actions: 100 })
  })

  it("the neighbours stop at their content width: another column's drag never truncates them", () => {
    const fitted = [col('a', 300), col('b', 300, { floor: 180 }), col('c', 300, { floor: 120 }), row[3]!]
    expect(resizeWithin(fitted, 'a', 5000, 1000)).toEqual({ a: 600, b: 180, c: 120, actions: 100 })
  })

  it('stops at the frame: nothing left to take, the column grows no further', () => {
    const widths = resizeWithin(row, 'a', 5000, 1000)
    expect(widths).toEqual({ a: 800, b: 50, c: 50, actions: 100 })
    expect(sum(widths)).toBe(1000)
    // The last resizable column has nobody on its right.
    expect(resizeWithin(row, 'c', 600, 1000)).toEqual({ a: 300, b: 300, c: 300, actions: 100 })
  })

  it('narrower: the right neighbour takes the space; the last one gives it to its left', () => {
    expect(resizeWithin(row, 'a', 200, 1000)).toEqual({ a: 200, b: 400, c: 300, actions: 100 })
    expect(resizeWithin(row, 'c', 200, 1000)).toEqual({ a: 300, b: 400, c: 200, actions: 100 })
  })

  it('fitting a column to its content (a double-click) leaves no gap', () => {
    const widths = resizeWithin(row, 'b', 120, 1000)
    expect(widths.b).toBe(120)
    expect(sum(widths)).toBe(1000)
  })

  it('a drag is measured from where it started: back and forth ends where it began', () => {
    expect(resizeWithin(row, 'a', 300, 1000)).toEqual({ a: 300, b: 300, c: 300, actions: 100 })
  })

  it('min and max still hold', () => {
    expect(resizeWithin(row, 'a', 10, 1000).a).toBe(50)
    expect(resizeWithin([col('a', 300, { max: 350 }), col('b', 700)], 'a', 600, 1000)).toEqual({ a: 350, b: 650 })
  })
})

describe('resizeWithin: columns that overflow the frame (the table scrolls)', () => {
  const wide = [col('a', 600), col('b', 600)]
  it('grow freely', () => {
    expect(resizeWithin(wide, 'a', 900, 1000)).toEqual({ a: 900, b: 600 })
  })
  it('shrinking past the frame width fills the gap instead of leaving one', () => {
    expect(resizeWithin(wide, 'a', 100, 1000)).toEqual({ a: 100, b: 900 })
  })
})

describe('lockedEdgeIds', () => {
  it('while the columns fit, only an edge with a resizable column to its right moves', () => {
    expect(lockedEdgeIds(row, 1000)).toEqual(['c', 'actions'])
  })
  it('once they overflow, every edge moves', () => {
    expect(lockedEdgeIds(row, 800)).toEqual([])
  })
})

describe('windowSlots', () => {
  it('renders the window and spaces the rest', () => {
    expect(windowSlots(10, { start: 3, end: 5 })).toEqual({ indices: [3, 4, 5], gaps: [[0, 3], [6, 10]] })
  })
  it('keeps retained columns outside the window, with a gap on each side', () => {
    expect(windowSlots(10, { start: 3, end: 4, retained: [0, 8] })).toEqual({
      indices: [0, 3, 4, 8],
      gaps: [[1, 3], [5, 8], [9, 10]],
    })
  })
  it('ignores retained columns inside the window or out of range, and leaves no empty gap', () => {
    expect(windowSlots(4, { start: 0, end: 3, retained: [2, 9, -1] })).toEqual({ indices: [0, 1, 2, 3], gaps: [] })
  })
})
