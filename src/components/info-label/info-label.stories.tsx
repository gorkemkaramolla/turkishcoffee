import type { Meta, StoryObj } from '@storybook/react-vite'
import { InfoLabel } from './info-label'
import { Input } from '../input/input'

const meta = {
  title: 'Components/InfoLabel',
  component: InfoLabel,
  args: { info: 'Salaries are paid into this account.', children: 'IBAN' },
} satisfies Meta<typeof InfoLabel>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="flex w-72 flex-col gap-2">
      <InfoLabel {...args} htmlFor="iban" />
      <Input id="iban" placeholder="TR00 0000 0000 0000 0000 0000 00" />
    </div>
  ),
}

export const WithLink: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <InfoLabel
        htmlFor="tax"
        info={
          <>
            Shown on every invoice.{' '}
            <a href="#" className="underline underline-offset-2">
              Where do I find it?
            </a>
          </>
        }
      >
        Tax number
      </InfoLabel>
      <Input id="tax" />
    </div>
  ),
}
