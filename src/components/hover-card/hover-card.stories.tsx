import type { Meta, StoryObj } from '@storybook/react-vite'
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card'
import { Button } from '../button'

const meta = {
  title: 'Components/HoverCard',
  component: HoverCard,
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@gorkemkaramolla</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="text-sm font-medium">Görkem Karamolla</p>
        <p className="mt-1 text-sm text-muted-foreground">Builds the design system this page runs on.</p>
      </HoverCardContent>
    </HoverCard>
  ),
}
