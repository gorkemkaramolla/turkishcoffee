import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { PasswordInput } from './password-input'
import { Label } from '../label'

const meta = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  render: (args) => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="password">Password</Label>
      <PasswordInput id="password" autoComplete="current-password" {...args} />
    </div>
  ),
} satisfies Meta<typeof PasswordInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The eye shows what was typed; pressed again, it hides it. */
export const Revealed: Story = {
  args: { defaultValue: 'correct horse battery staple' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('Password') as HTMLInputElement
    await userEvent.click(canvas.getByRole('button', { pressed: false }))
    await expect(input.type).toBe('text')
  },
}

export const Invalid: Story = { args: { 'aria-invalid': true, defaultValue: 'short' } }

export const Disabled: Story = { args: { disabled: true, defaultValue: 'secret' } }
