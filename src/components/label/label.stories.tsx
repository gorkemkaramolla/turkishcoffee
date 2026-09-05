import type { Meta, StoryObj } from '@storybook/react-vite'
import { Label } from './label'
import { Input } from '../input/input'

const meta = { title: 'Components/Label', component: Label } satisfies Meta<typeof Label>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" placeholder="you@example.com" />
    </div>
  ),
}
