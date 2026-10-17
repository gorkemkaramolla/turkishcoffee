import '../../styles/storybook.css'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Skeleton } from './skeleton'

afterEach(cleanup)

describe('Skeleton motion', () => {
  it('runs the brewing glint, pinned to the viewport so skeletons share one light', () => {
    const { container } = render(<Skeleton className="h-4 w-40" />)
    const style = getComputedStyle(container.querySelector('[data-slot=skeleton]')!)
    expect(style.animationName).toBe('tc-skeleton-brew')
    expect(style.backgroundAttachment).toBe('fixed')
    expect(style.backgroundImage).toContain('linear-gradient')
  })

  it('lets a background utility override the fill', () => {
    const { container } = render(<Skeleton className="bg-danger h-4 w-40" />)
    const skeleton = container.querySelector<HTMLElement>('[data-slot=skeleton]')!
    const probe = document.createElement('div')
    probe.className = 'bg-danger'
    document.body.append(probe)
    expect(getComputedStyle(skeleton).backgroundColor).toBe(getComputedStyle(probe).backgroundColor)
    probe.remove()
  })
})
