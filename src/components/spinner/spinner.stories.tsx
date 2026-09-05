import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from './spinner'
import { Button } from '../button'

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="size-4" />
      <Spinner className="size-6" />
      <Spinner className="size-8 text-primary" />
      <Button disabled>
        <Spinner label={null} />
        Saving
      </Button>
    </div>
  ),
}
