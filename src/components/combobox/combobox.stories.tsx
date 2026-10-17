import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Avatar, AvatarFallback } from '../avatar/avatar'
import { Label } from '../label/label'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
} from './combobox'

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  parameters: { a11y: { test: 'error' } },
} satisfies Meta<typeof Combobox>
export default meta
type Story = StoryObj<typeof meta>

type Person = { id: string; name: string; title: string }
const people: Person[] = [
  ['Ayşe Yılmaz', 'Engineering manager'],
  ['Çağrı Kaya', 'Finance manager'],
  ['Can Demir', 'Software engineer'],
  ['Şule Şahin', 'People partner'],
  ['Zeynep Çelik', 'Accountant'],
  ['İlker Öztürk', 'Sales manager'],
  ['Öykü Aydın', 'Legal counsel'],
  ['Mert Arslan', 'Office manager'],
  ['Ümit Doğan', 'Recruiter'],
  ['Gökhan Kılıç', 'QA engineer'],
].map(([name, title], i) => ({ id: String(i + 1), name: name!, title: title! }))

const initials = (name: string) => name.split(' ').map((part) => part[0]).join('')

/** Type to filter; Turkish letters match case-insensitively (`i` finds `İlker`). */
export const Default: Story = {
  render: function Example() {
    const [manager, setManager] = useState<Person | null>(null)
    return (
      <div className="flex w-72 flex-col gap-2">
        <Label htmlFor="manager">Manager</Label>
        <Combobox items={people} itemToStringLabel={(p: Person) => p.name} value={manager} onValueChange={setManager}>
          <ComboboxInput id="manager" placeholder="Search people" />
          <ComboboxContent>
            <ComboboxEmpty>No one matches.</ComboboxEmpty>
            <ComboboxList>
              {(person: Person) => (
                <ComboboxItem key={person.id} value={person}>
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px]">{initials(person.name)}</AvatarFallback>
                  </Avatar>
                  <span className="flex flex-col leading-tight">
                    <span>{person.name}</span>
                    <span className="text-muted-foreground text-xs">{person.title}</span>
                  </span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <p className="text-muted-foreground text-xs">Picked: {manager?.name ?? 'nobody'}</p>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox', { name: 'Manager' })
    await userEvent.type(input, 'ilk')
    const body = within(document.body)
    const option = await body.findByRole('option', { name: /İlker Öztürk/ })
    await userEvent.click(option)
    await expect(input).toHaveValue('İlker Öztürk')
    await expect(canvas.getByText('Picked: İlker Öztürk')).toBeInTheDocument()
  },
}

const skills = ['Accounting', 'Excel', 'Figma', 'German', 'Leadership', 'Negotiation', 'Python', 'React', 'SAP', 'SQL', 'Turkish payroll law']

/** `multiple`: picks become chips. Backspace in the empty input removes the last one. */
export const Multiple: Story = {
  render: function Example() {
    const [picked, setPicked] = useState<string[]>(['Excel', 'SQL'])
    return (
      <div className="flex w-96 flex-col gap-2">
        <Label htmlFor="skills">Skills</Label>
        <Combobox multiple items={skills} value={picked} onValueChange={setPicked}>
          <ComboboxChips>
            <ComboboxValue>
              {(values: string[]) => values.map((skill) => <ComboboxChip key={skill}>{skill}</ComboboxChip>)}
            </ComboboxValue>
            <ComboboxChipsInput id="skills" placeholder={picked.length ? '' : 'Add a skill'} />
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxEmpty>No skill matches.</ComboboxEmpty>
            <ComboboxList>
              {(skill: string) => (
                <ComboboxItem key={skill} value={skill}>
                  {skill}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    )
  },
}

const departments = [
  { value: 'Head office', items: ['Finance', 'Human Resources', 'Legal'] },
  { value: 'Field', items: ['Sales', 'Operations', 'Logistics'] },
]

/** Grouped items: pass `{ value, items }` groups and render them with ComboboxCollection. */
export const Grouped: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="department">Department</Label>
      <Combobox items={departments}>
        <ComboboxInput id="department" placeholder="Search departments" size="sm" />
        <ComboboxContent>
          <ComboboxEmpty>No department matches.</ComboboxEmpty>
          <ComboboxList>
            {(group: (typeof departments)[number], index: number) => (
              <ComboboxGroup key={group.value} items={group.items}>
                {index > 0 && <ComboboxSeparator />}
                <ComboboxGroupLabel>{group.value}</ComboboxGroupLabel>
                <ComboboxCollection>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  ),
}

/** Disabled and invalid states share the field edge with Input and Select. */
export const States: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <Combobox items={skills} disabled>
        <ComboboxInput aria-label="Disabled" placeholder="Disabled" />
      </Combobox>
      <Combobox items={skills}>
        <ComboboxInput aria-label="Invalid" aria-invalid placeholder="Invalid" />
      </Combobox>
    </div>
  ),
}
