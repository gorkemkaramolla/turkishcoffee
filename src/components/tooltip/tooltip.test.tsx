import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

describe('Tooltip', () => {
  it('renders the hint on the inverse surface', async () => {
    render(
      <Tooltip open>
        <TooltipTrigger>Copy</TooltipTrigger>
        <TooltipContent>Copy to clipboard</TooltipContent>
      </Tooltip>,
    )
    const hint = await screen.findByText('Copy to clipboard')
    expect(hint.getAttribute('data-slot')).toBe('tooltip-content')
    expect(hint.className).toContain('bg-inverse')
  })
})
