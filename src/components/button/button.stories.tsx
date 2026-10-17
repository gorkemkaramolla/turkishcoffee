import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'link'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
  },
  args: { children: 'Button' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const RenderAsLink: Story = {
  name: 'render (renders an anchor)',
  render: () => (
    <Button render={<a href="https://example.com" />} variant="secondary">
      I am an anchor
    </Button>
  ),
}

export const ClassNameOverride: Story = {
  name: 'className wins over defaults',
  render: () => (
    <div className="flex items-center gap-3">
      <Button>Default padding</Button>
      <Button className="rounded-full bg-fuchsia-600 px-10 hover:bg-fuchsia-700">
        Overridden
      </Button>
    </div>
  ),
}
