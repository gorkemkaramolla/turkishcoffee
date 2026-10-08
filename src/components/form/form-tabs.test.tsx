import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { Input } from '../input/input'
import { Form, FormControl, FormErrorSummary, FormField, FormItem, FormLabel } from './form'
import { FormTabs, FormTabsContent, FormTabsList, FormTabsNext, FormTabsPrevious, FormTabsTrigger } from './form-tabs'

type Values = { name: string; nationalId: string }

function Wizard({
  linear,
  summary,
  onSubmit = () => {},
}: {
  linear?: boolean
  summary?: boolean
  onSubmit?: (v: Values) => void
}) {
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
        {summary && <FormErrorSummary />}
        <FormTabs defaultValue="one" linear={linear}>
          <FormTabsList>
            <FormTabsTrigger value="one">One</FormTabsTrigger>
            <FormTabsTrigger value="two">Two</FormTabsTrigger>
          </FormTabsList>
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

  it('names the number of errors on a tab', async () => {
    render(<Wizard />)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(tab('Two').textContent).toContain('1 field to fix'))
  })

  it('in linear mode, marks a passed step done and the current one', async () => {
    render(<Wizard linear />)
    expect(tab('One').getAttribute('aria-current')).toBe('step')
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ayşe' } })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(tab('One').getAttribute('data-state')).toBe('complete'))
    expect(tab('Two').getAttribute('aria-current')).toBe('step')
  })

  it('lists errors in FormErrorSummary and opens the tab of the one picked', async () => {
    render(<Wizard summary />)
    expect(screen.queryByRole('alert')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('2 fields need attention'))

    fireEvent.click(screen.getByRole('button', { name: 'National ID is required' }))
    await waitFor(() => expect(panel('National ID').hasAttribute('hidden')).toBe(false))
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('National ID')))
  })
})
