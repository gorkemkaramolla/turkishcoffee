import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select'

const meta = { title: 'Components/Select', component: Select } satisfies Meta<typeof Select>
export default meta
type Story = StoryObj<typeof meta>

// Passed to Select so SelectValue shows "Next.js", not "next".
const frameworks = { next: 'Next.js', remix: 'Remix', astro: 'Astro', nuxt: 'Nuxt' }

export const Default: Story = {
  render: () => (
    <Select items={frameworks}>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Pick a framework" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>React</SelectLabel>
          <SelectItem value="next">Next.js</SelectItem>
          <SelectItem value="remix">Remix</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Other</SelectLabel>
          <SelectItem value="astro">Astro</SelectItem>
          <SelectItem value="nuxt" disabled>Nuxt (disabled)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}
