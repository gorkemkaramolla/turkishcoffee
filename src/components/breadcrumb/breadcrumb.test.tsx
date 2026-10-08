import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BreadcrumbButton, BreadcrumbEllipsis, BreadcrumbLink, BreadcrumbPage } from './breadcrumb'

describe('Breadcrumb', () => {
  it('names a link with an icon by its text', () => {
    render(
      <BreadcrumbLink href="/employees">
        <svg aria-hidden="true" />
        Employees
      </BreadcrumbLink>,
    )
    expect(screen.getByRole('link', { name: 'Employees' }).getAttribute('href')).toBe('/employees')
  })

  it('marks the current page and keeps it out of the tab order', () => {
    render(<BreadcrumbPage>Billing</BreadcrumbPage>)
    const page = screen.getByRole('link', { name: 'Billing' })
    expect(page.getAttribute('aria-current')).toBe('page')
    expect(page.tabIndex).toBe(-1)
  })

  it('wraps the text so it can truncate, keeping the full accessible name', () => {
    const long = 'Quarterly performance reviews for the engineering department'
    render(<BreadcrumbLink href="#">{long}</BreadcrumbLink>)
    const link = screen.getByRole('link', { name: long })
    expect(link.querySelector('[data-slot="breadcrumb-text"]')?.className).toContain('truncate')
    expect(link.dataset.truncated).toBeUndefined()
  })

  describe('when the text is cut off', () => {
    beforeEach(() => {
      vi.stubGlobal(
        'ResizeObserver',
        class {
          constructor(private cb: ResizeObserverCallback) {}
          observe(target: Element) {
            this.cb([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver)
          }
          unobserve() {}
          disconnect() {}
        },
      )
      vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(400)
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200)
    })
    afterEach(() => {
      vi.unstubAllGlobals()
      vi.restoreAllMocks()
    })

    it('marks the step, which turns its full-text tooltip on', () => {
      render(
        <>
          <BreadcrumbLink href="#">Quarterly performance reviews</BreadcrumbLink>
          <BreadcrumbPage>Engineering department</BreadcrumbPage>
        </>,
      )
      expect(screen.getByRole('link', { name: 'Quarterly performance reviews' }).dataset.truncated).toBe('')
      expect(screen.getByRole('link', { name: 'Engineering department' }).dataset.truncated).toBe('')
    })
  })

  it('BreadcrumbButton never submits a surrounding form', () => {
    render(
      <BreadcrumbButton aria-label="Show 3 more">
        <BreadcrumbEllipsis />
      </BreadcrumbButton>,
    )
    expect(screen.getByRole('button', { name: 'Show 3 more' }).getAttribute('type')).toBe('button')
  })
})
