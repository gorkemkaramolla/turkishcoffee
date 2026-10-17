import { describe, expect, it } from 'vitest'
import { fitWithin, lockedEdgeIds, resizeWithin, type FitColumn } from './internal/autofit'
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

describe('fitWithin: fitting one column shares the difference among the others', () => {
  const close = (widths: Record<string, number>) =>
    Object.fromEntries(Object.entries(widths).map(([id, width]) => [id, Math.round(width * 100) / 100]))

  it('narrower: the least stretched columns take the room first, and the row still fills the frame', () => {
    // b is stretched to twice its content, c to three times.
    const columns = [col('a', 300, { floor: 150 }), col('b', 300, { floor: 150 }), col('c', 300, { floor: 100 }), row[3]!]
    const widths = fitWithin(columns, 'a', 150, 1000)
    expect(close(widths)).toEqual({ a: 150, b: 450, c: 300, actions: 100 })
  })

  it('fitting columns one after another spreads the room instead of piling it into the last one', () => {
    let columns = [
      col('a', 200, { floor: 100 }),
      col('b', 300, { floor: 150 }),
      col('c', 240, { floor: 120 }),
      col('d', 160, { floor: 80 }),
      col('actions', 100, { resizable: false }),
    ]
    for (const id of ['a', 'b', 'c']) {
      const widths = fitWithin(columns, id, columns.find((column) => column.id === id)!.floor!, 1000)
      columns = columns.map((column) => ({ ...column, width: widths[column.id]! }))
    }
    const widths = close(Object.fromEntries(columns.map((column) => [column.id, column.width])))
    // resizeWithin would have handed d every freed pixel: 160 + 100 + 150 + 120 = 530.
    expect(widths).toEqual({ a: 250, b: 330, c: 120, d: 200, actions: 100 })
  })

  it('wider: the most stretched columns give way first, none below its content width', () => {
    const columns = [col('a', 200, { floor: 100 }), col('b', 200, { floor: 190 }), col('c', 500, { floor: 100 }), row[3]!]
    expect(close(fitWithin(columns, 'a', 400, 1000))).toEqual({ a: 400, b: 200, c: 300, actions: 100 })
  })

  it('wider than the others can make room for: the column still gets its content width, and the table scrolls', () => {
    const columns = [col('a', 300, { floor: 300 }), col('b', 300, { floor: 280 }), col('c', 300, { floor: 290 }), row[3]!]
    const widths = fitWithin(columns, 'a', 500, 1000)
    expect(close(widths)).toEqual({ a: 500, b: 280, c: 290, actions: 100 })
    expect(sum(widths)).toBeGreaterThan(1000)
  })

  it('an unmeasured neighbour is never squeezed', () => {
    const columns = [col('a', 300, { floor: 100 }), col('b', 600), row[3]!]
    expect(fitWithin(columns, 'a', 400, 1000)).toEqual({ a: 400, b: 600, actions: 100 })
  })

  it('columns that overflow the frame: only the column changes, and a gap it would leave is filled', () => {
    const wide = [col('a', 600, { floor: 100 }), col('b', 600, { floor: 300 })]
    expect(fitWithin(wide, 'a', 900, 1000)).toEqual({ a: 900, b: 600 })
    expect(close(fitWithin(wide, 'a', 100, 1000))).toEqual({ a: 100, b: 900 })
  })

  it('when no column can take the room, the column stops shrinking', () => {
    const columns = [col('a', 500, { floor: 100 }), col('b', 500, { max: 500 })]
    expect(fitWithin(columns, 'a', 100, 1000)).toEqual({ a: 500, b: 500 })
  })

  it('min and max still hold', () => {
    expect(fitWithin(row, 'a', 10, 1000).a).toBe(50)
    expect(fitWithin([col('a', 300, { max: 350 }), col('b', 700)], 'a', 600, 1000).a).toBe(350)
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
