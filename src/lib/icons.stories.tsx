import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Input } from '../components/input/input'
import * as icons from './icons'

const meta = { title: 'Foundations/Icons' } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/** Every export of `src/lib/icons.tsx`, so a new icon shows up here on its own. */
const all = Object.entries(icons).sort(([a], [b]) => a.localeCompare(b))

function IconList() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const shown = all.filter(([name]) => name.toLowerCase().includes(q))

  return (
    <div className="flex max-w-4xl flex-col gap-4 p-2">
      <Input
        className="max-w-xs"
        placeholder={`Search ${all.length} icons…`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {shown.map(([name, Icon]) => (
          <div key={name} className="flex w-36 flex-col items-center gap-2 rounded-md border border-border p-4">
            <Icon className="size-6" />
            <code className="text-xs">{name}</code>
          </div>
        ))}
      </div>
      {shown.length === 0 && <p className="text-sm text-muted-foreground">No icon matches “{query}”.</p>}
    </div>
  )
}

export const All: Story = { render: () => <IconList /> }
