import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
  })

  it('applies variant and size classes', () => {
    render(<Button variant="destructive" size="lg">Delete</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-destructive')
    expect(btn.className).toContain('h-10')
  })

  // The reason cn() exists: a consumer's className must beat the built-in default.
  it('lets a passed className override conflicting defaults', () => {
    render(<Button className="px-10">Wide</Button>)
    const cls = screen.getByRole('button').className
    expect(cls).toContain('px-10')
    expect(cls).not.toContain('px-4')
  })

  it('renders as the child element with asChild', () => {
    render(
      <Button asChild>
        <a href="/home">Home</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Home' })
    expect(link.tagName).toBe('A')
    expect(link.className).toContain('bg-primary')
  })
})
