import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupButton,
} from './input-group'

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder="Search orders" />
        <InputGroupAddon align="end">
          <InputGroupButton>Search</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupTextarea rows={3} placeholder="Leave a note" />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>@</InputGroupAddon>
        <InputGroupInput aria-invalid placeholder="Invalid handle" />
      </InputGroup>
    </div>
  ),
}
