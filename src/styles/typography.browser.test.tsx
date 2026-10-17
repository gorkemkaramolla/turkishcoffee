import './storybook.css'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

afterEach(cleanup)

const turkish = 'Pijamalı hasta yağız şoföre çabucak güvendi. İĞŞÇÖÜ ıi ₺'
const faces = () => [...document.fonts].filter((face) => face.family.replace(/"/g, '') === 'Inter')

describe('typeface', () => {
  it('sets every page in Inter, with the metric-matched fallback next', () => {
    const family = getComputedStyle(document.documentElement).fontFamily
    expect(family.split(',').slice(0, 2).map((name) => name.trim().replace(/"/g, ''))).toEqual(['Inter', 'Inter Fallback'])
    expect([...document.fonts].some((face) => face.family.replace(/"/g, '') === 'Inter Fallback')).toBe(true)
  })

  it('loads the shipped Inter for Turkish text, at every weight the library uses', async () => {
    render(<p lang="tr">{turkish}</p>)
    for (const weight of [400, 500, 600, 700]) await document.fonts.load(`${weight} 14px Inter`, turkish)
    const roman = faces().find((face) => face.style === 'normal')!
    expect(roman.status).toBe('loaded')
    // Every character of the sample falls inside the face's unicode-range, so none is drawn by a fallback.
    const ranges = roman.unicodeRange.split(',').map((range) => {
      const [first, last = first] = range.trim().replace(/^U\+/i, '').split('-')
      return [parseInt(first!, 16), parseInt(last!, 16)] as const
    })
    const uncovered = [...turkish].filter((char) => !ranges.some(([a, b]) => char.codePointAt(0)! >= a && char.codePointAt(0)! <= b))
    expect(uncovered).toEqual([])
  })

  it('keeps the italic lazy until something is set in italic', async () => {
    render(<p>{turkish}</p>)
    await document.fonts.load('400 14px Inter', turkish)
    expect(faces().find((face) => face.style === 'italic')?.status).toBe('unloaded')
    render(<em className="italic">{turkish}</em>)
    await document.fonts.load('italic 400 14px Inter', turkish)
    expect(faces().find((face) => face.style === 'italic')?.status).toBe('loaded')
  })
})
