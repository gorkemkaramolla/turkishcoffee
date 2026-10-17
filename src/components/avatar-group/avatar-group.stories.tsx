import type { Meta, StoryObj } from '@storybook/react-vite'
import { AvatarGroup, AvatarGroupItem } from './avatar-group'

const meta = { title: 'Components/AvatarGroup', component: AvatarGroup } satisfies Meta<typeof AvatarGroup>
export default meta
type Story = StoryObj<typeof meta>

const people = [
  { name: 'Mona Kane', src: 'https://i.pravatar.cc/96?img=47' },
  { name: 'Mehmet Polat' },
  { name: 'Kevin Sturgis', src: 'https://i.pravatar.cc/96?img=12' },
  { name: 'Elif Demir', src: 'https://i.pravatar.cc/96?img=45' },
  { name: 'Ayşe Yılmaz' },
  { name: 'Can Öztürk', src: 'https://i.pravatar.cc/96?img=15' },
  { name: 'Lydia Bauer' },
]

/** Hover the group, or Tab to the `+N` button, to spread it. */
export const Overflow: Story = {
  render: () => (
    <AvatarGroup aria-label="Reviewers">
      {people.map((p) => (
        <AvatarGroupItem key={p.name} {...p} />
      ))}
    </AvatarGroup>
  ),
}

/**
 * Each avatar links to a profile. Hover one: it grows above its neighbours and
 * shows the name. Hidden people are links in the `+N` list too.
 */
export const ProfileLinks: Story = {
  render: () => (
    <AvatarGroup aria-label="Reviewers">
      {people.map((p, i) => (
        <AvatarGroupItem key={p.name} {...p} render={<a href={`#/people/${i}`} />} />
      ))}
    </AvatarGroup>
  ),
}

export const FitsWithoutOverflow: Story = {
  render: () => (
    <AvatarGroup aria-label="Reviewers">
      {people.slice(0, 4).map((p) => (
        <AvatarGroupItem key={p.name} {...p} />
      ))}
    </AvatarGroup>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <AvatarGroup key={size} size={size} aria-label={`Reviewers, ${size}`}>
          {people.map((p) => (
            <AvatarGroupItem key={p.name} {...p} />
          ))}
        </AvatarGroup>
      ))}
    </div>
  ),
}
