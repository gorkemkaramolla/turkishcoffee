import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from './textarea'

const meta = { title: 'Components/Textarea', component: Textarea } satisfies Meta<typeof Textarea>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Textarea className="w-96" placeholder="Tell us what happened..." />,
}
