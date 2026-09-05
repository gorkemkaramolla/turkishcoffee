import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

const meta = { title: 'Components/Avatar', component: Avatar } satisfies Meta<typeof Avatar>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
        <AvatarFallback>SC</AvatarFallback>
      </Avatar>
      <Avatar className="size-12">
        <AvatarImage src="/broken-path.png" alt="Fallback" />
        <AvatarFallback>GK</AvatarFallback>
      </Avatar>
    </div>
  ),
}
