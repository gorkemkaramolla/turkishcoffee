import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { Input } from '../input/input'
import { TabsList } from '../tabs/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel } from './form'
import { FormTabs, FormTabsContent, FormTabsNext, FormTabsPrevious, FormTabsTrigger } from './form-tabs'

type Values = { name: string; nationalId: string }

function Wizard({ linear, onSubmit = () => {} }: { linear?: boolean; onSubmit?: (v: Values) => void }) {
  const form = useForm<Values>({ defaultValues: { name: '', nationalId: '' } })
  const field = (name: keyof Values, label: string) => (
    <FormField
      control={form.control}
      name={name}
      rules={{ required: `${label} is required` }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  )
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormTabs defaultValue="one" linear={linear}>
          <TabsList>
            <FormTabsTrigger value="one">One</FormTabsTrigger>
            <FormTabsTrigger value="two">Two</FormTabsTrigger>
          </TabsList>
          <FormTabsContent value="one">{field('name', 'Name')}</FormTabsContent>
          <FormTabsContent value="two">{field('nationalId', 'National ID')}</FormTabsContent>
          <FormTabsPrevious />
          <FormTabsNext />
        </FormTabs>
        <button type="submit">Save</button>
      </form>
    </Form>
  )
}

const panel = (label: string) => screen.getByLabelText(label).closest('[data-slot="tabs-content"]')!
const tab = (name: string) => screen.getByRole('tab', { name: new RegExp(`^${name}`) })

describe('FormTabs', () => {
  afterEach(cleanup)

  it('keeps values while switching tabs', async () => {
    render(<Wizard />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ayşe' } })
    fireEvent.click(tab('Two'))
    await waitFor(() => expect(panel('Name').hasAttribute('hidden')).toBe(true))
    fireEvent.click(tab('One'))
    await waitFor(() => expect(panel('Name').hasAttribute('hidden')).toBe(false))
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Ayşe')
  })

  it('in linear mode, stays on a step until its fields validate', async () => {
    render(<Wizard linear />)
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(tab('One').hasAttribute('data-invalid')).toBe(true))
    expect(panel('National ID').hasAttribute('hidden')).toBe(true)

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ayşe' } })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(panel('National ID').hasAttribute('hidden')).toBe(false))
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy()
  })

  it('in linear mode, a tab click past an invalid step is refused', async () => {
    render(<Wizard linear />)
    fireEvent.click(tab('Two'))
    await waitFor(() => expect(tab('One').hasAttribute('data-invalid')).toBe(true))
    expect(panel('National ID').hasAttribute('hidden')).toBe(true)
  })

  it('opens the first step with an error on a failed submit', async () => {
    const onSubmit = vi.fn()
    render(<Wizard onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ayşe' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(panel('National ID').hasAttribute('hidden')).toBe(false))
    expect(tab('Two').hasAttribute('data-invalid')).toBe(true)
    expect(tab('One').hasAttribute('data-invalid')).toBe(false)
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
