import type { Meta, StoryObj } from '@storybook/react-vite'
import { NativeSelect } from './native-select'

const meta = {
  title: 'Components/NativeSelect',
  component: NativeSelect,
} satisfies Meta<typeof NativeSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <NativeSelect defaultValue="tr" aria-label="Country">
        <option value="tr">Türkiye</option>
        <option value="de">Germany</option>
        <option value="nl">Netherlands</option>
      </NativeSelect>
      <NativeSelect size="sm" defaultValue="tr" aria-label="Country, small">
        <option value="tr">Türkiye</option>
        <option value="de">Germany</option>
      </NativeSelect>
      <NativeSelect disabled defaultValue="tr" aria-label="Country, disabled">
        <option value="tr">Türkiye</option>
      </NativeSelect>
    </div>
  ),
}
