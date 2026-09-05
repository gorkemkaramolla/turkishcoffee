import type { Meta, StoryObj } from '@storybook/react-vite'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from '../button/button'
import { Input } from '../input/input'
import { Label } from '../label/label'

const meta = { title: 'Components/Popover', component: Popover } satisfies Meta<typeof Popover>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Dimensions</Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="w">Width</Label>
          <Input id="w" defaultValue="100%" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="h">Height</Label>
          <Input id="h" defaultValue="25px" />
        </div>
      </PopoverContent>
    </Popover>
  ),
}
