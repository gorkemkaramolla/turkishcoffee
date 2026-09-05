import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress } from './progress'

const meta = {
  title: 'Components/Progress',
  component: Progress,
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { value: 60 },
  render: (args) => <Progress {...args} className="w-80" />,
}

export const Steps: Story = {
  args: { value: 0 },
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      {[0, 25, 50, 100].map((value) => (
        <Progress key={value} value={value} />
      ))}
    </div>
  ),
}
