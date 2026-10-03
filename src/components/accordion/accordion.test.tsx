import { describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'

function Faq(props: { multiple?: boolean }) {
  return (
    <Accordion {...props}>
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent>Ships in 2–3 days.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionContent>Within 14 days.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

const isOpen = (name: string) =>
  screen.getByRole('button', { name }).getAttribute('aria-expanded') === 'true'

describe('Accordion', () => {
  it('keeps one section open by default', () => {
    render(<Faq />)
    act(() => screen.getByRole('button', { name: 'Shipping' }).click())
    act(() => screen.getByRole('button', { name: 'Returns' }).click())
    expect(isOpen('Shipping')).toBe(false)
    expect(isOpen('Returns')).toBe(true)
  })

  it('lets several sections stay open with multiple', () => {
    render(<Faq multiple />)
    act(() => screen.getByRole('button', { name: 'Shipping' }).click())
    act(() => screen.getByRole('button', { name: 'Returns' }).click())
    expect(isOpen('Shipping')).toBe(true)
    expect(isOpen('Returns')).toBe(true)
  })
})
