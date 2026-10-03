import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'

describe('HoverCard', () => {
  it('renders its trigger as a link and the card when open', async () => {
    render(
      <HoverCard open>
        <HoverCardTrigger href="/u/ada">@ada</HoverCardTrigger>
        <HoverCardContent>Ada Lovelace</HoverCardContent>
      </HoverCard>,
    )
    expect(screen.getByRole('link', { name: '@ada' }).getAttribute('href')).toBe('/u/ada')
    const card = await screen.findByText('Ada Lovelace')
    expect(card.getAttribute('data-slot')).toBe('hover-card-content')
  })
})
