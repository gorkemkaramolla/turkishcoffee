import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchField } from './search-field'

const meta = {
  title: 'Components/SearchField',
  component: SearchField,
  args: { value: '', onSearch: () => {}, placeholder: 'Name, email…' },
} satisfies Meta<typeof SearchField>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function SearchExample(args) {
    const [value, setValue] = useState(args.value)
    return <SearchField {...args} value={value} onSearch={setValue} />
  },
}
export const Loading: Story = { args: { value: 'Görkem', loading: true } }
export const Turkish: Story = {
  ...Default,
  args: { label: 'Ara', clearLabel: 'Temizle', loadingLabel: 'Aranıyor', placeholder: 'Ad, soyad, e-posta, personel no' },
}

/** In a toolbar: the label is for screen readers only and the field is 32px tall. */
export const Toolbar: Story = {
  ...Default,
  args: { hideLabel: true, size: 'sm', label: 'Search people', placeholder: 'Search people' },
}
