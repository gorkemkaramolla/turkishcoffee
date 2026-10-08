import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Badge' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

const tones = ['neutral', 'info', 'success', 'warning', 'danger'] as const

/** Every tone in both variants: `soft` (default) on top, `solid` below. */
export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(['soft', 'solid'] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-2">
          {tones.map((tone) => (
            <Badge key={tone} tone={tone} variant={variant}>
              {tone}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
}
