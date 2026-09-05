import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyState } from './empty-state'
import { Button } from '../button/button'

const meta = { title: 'Components/EmptyState', component: EmptyState } satisfies Meta<typeof EmptyState>
export default meta
type Story = StoryObj<typeof meta>

const InboxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
)

export const Default: Story = {
  args: {
    icon: <InboxIcon />,
    title: 'No messages yet',
    description: 'When someone sends you a message it will show up here.',
    action: <Button size="sm">Compose</Button>,
    className: 'w-2xl',
  },
}

export const Minimal: Story = {
  args: { title: 'Nothing to see here', className: 'w-2xl' },
}
