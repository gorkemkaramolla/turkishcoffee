import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { Button } from '../button/button'
import { Input } from '../input/input'
import { TabsList } from '../tabs/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form'
import {
  FormTabs,
  FormTabsContent,
  FormTabsNext,
  FormTabsPrevious,
  FormTabsTrigger,
  useFormTabs,
} from './form-tabs'

const meta = { title: 'Components/FormTabs' } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

type Values = { firstName: string; lastName: string; nationalId: string; startDate: string }

function Field({ name, label, required }: { name: keyof Values; label: string; required?: boolean }) {
  return (
    <FormField<Values, keyof Values>
      name={name}
      rules={required ? { required: `${label} is required` } : undefined}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

/** Submit only on the last step; Next/Back elsewhere. */
function Actions() {
  const { isLast } = useFormTabs()
  return (
    <div className="flex gap-2">
      <FormTabsPrevious />
      <FormTabsNext />
      {isLast && <Button type="submit">Create</Button>}
    </div>
  )
}

function Example({ linear }: { linear?: boolean }) {
  const form = useForm<Values>({
    defaultValues: { firstName: '', lastName: '', nationalId: '', startDate: '' },
  })
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => alert(JSON.stringify(v, null, 2)))}
        className="flex max-w-xl flex-col gap-4"
      >
        <FormTabs defaultValue="employee" linear={linear} className="gap-4">
          <TabsList>
            <FormTabsTrigger value="employee">Employee</FormTabsTrigger>
            <FormTabsTrigger value="personnel">Personnel file</FormTabsTrigger>
          </TabsList>
          <FormTabsContent value="employee">
            <div className="flex flex-col gap-3">
              <Field name="firstName" label="First name" required />
              <Field name="lastName" label="Last name" required />
            </div>
          </FormTabsContent>
          <FormTabsContent value="personnel">
            <div className="flex flex-col gap-3">
              <Field name="nationalId" label="National ID" required />
              <Field name="startDate" label="Start date" />
            </div>
          </FormTabsContent>
          {linear ? <Actions /> : <Button type="submit" className="self-start">Create</Button>}
        </FormTabs>
      </form>
    </Form>
  )
}

/** Free tabs: switch any time; a failed submit opens the tab with the error. */
export const Tabs: Story = { render: () => <Example /> }

/** Stepper: Next validates the current step before moving on. */
export const Linear: Story = { render: () => <Example linear /> }
