import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  // The theme's custom tokens must merge like Tailwind's own scales, so a
  // consumer's className replaces the built-in one instead of fighting it.
  it('lets className replace control-size classes', () => {
    expect(cn('size-control', 'size-6')).toBe('size-6')
    expect(cn('h-control', 'h-8')).toBe('h-8')
    expect(cn('h-8', 'h-control-sm')).toBe('h-control-sm')
    expect(cn('px-3 h-control-lg', 'h-control')).toBe('px-3 h-control')
    expect(cn('min-h-control', 'min-h-6')).toBe('min-h-6')
  })

  it('lets className replace the float shadow', () => {
    expect(cn('shadow-float', 'shadow-none')).toBe('shadow-none')
  })
})
