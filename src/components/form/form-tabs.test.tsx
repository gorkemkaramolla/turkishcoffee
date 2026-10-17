import { useState, type ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { Input } from '../input/input'
import { Form, FormControl, FormErrorSummary, FormField, FormItem, FormLabel } from './form'
import { FormTabs, FormTabsContent, FormTabsList, FormTabsNext, FormTabsPrevious, FormTabsTrigger, useFormTabs } from './form-tabs'

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


function NavigationProbe() {
  const tabs = useFormTabs()
  return <>
    <button type="button" onClick={() => void tabs.goTo('missing')}>Unknown target</button>
    <button type="button" onClick={() => { void tabs.next(); void tabs.next() }}>Double next</button>
    <output data-testid="state">{tabs.steps.map((step) => `${step}:${tabs.getStepState(step)}`).join(',')}</output>
  </>
}

function AdvancedWizard({
  validate,
  nextProps,
  previousProps,
  labels,
  controlled = false,
}: {
  validate?: () => Promise<boolean | string>
  nextProps?: ComponentProps<typeof FormTabsNext>
  previousProps?: ComponentProps<typeof FormTabsPrevious>
  labels?: ComponentProps<typeof FormTabs>['labels']
  controlled?: boolean
}) {
  const form = useForm({ defaultValues: { first: '', second: '' }, shouldFocusError: !controlled })
  const [value, setValue] = useState('one')
  const [requested, setRequested] = useState('one')
  const [second, setSecond] = useState(true)
  return <Form {...form}>
    <form onSubmit={form.handleSubmit(() => {})}>
      <button type="button" onClick={() => setValue(requested)}>Accept selection</button>
      <output data-testid="requested">{requested}</output>
      <button type="button" onClick={() => setValue('three')}>External selection</button>
      <button type="button" onClick={() => setSecond(false)}>Remove second</button>
      <FormTabs linear labels={labels} value={controlled ? value : undefined} onValueChange={setRequested}>
        <FormTabsList aria-label="Sections">
          <FormTabsTrigger value="one">One</FormTabsTrigger>
          {second && <FormTabsTrigger value="two" disabled={false}>Two</FormTabsTrigger>}
          <FormTabsTrigger value="three">Three</FormTabsTrigger>
        </FormTabsList>
        <FormTabsContent value="one">
          <FormField name="first" rules={{ required: 'Required', validate }} render={({ field }) => <FormItem><FormLabel>First</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        </FormTabsContent>
        {second && <FormTabsContent value="two">
          <FormField name="second" rules={{ required: 'Required' }} render={({ field }) => <FormItem><FormLabel>Second</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
        </FormTabsContent>}
        <FormTabsContent value="three">Review</FormTabsContent>
        <FormTabsPrevious disabled={false} {...previousProps} />
        <FormTabsNext {...nextProps} />
        <NavigationProbe />
      </FormTabs>
      <button type="submit">Submit</button>
    </form>
  </Form>
}

function deferred() {
  let resolve!: (result: boolean | string) => void
  const promise = new Promise<boolean | string>((done) => { resolve = done })
  return { promise, resolve }
}

describe('FormTabs navigation safeguards', () => {
  afterEach(cleanup)

  it('focuses the first invalid field even when its step is already active', async () => {
    render(<AdvancedWizard />)
    screen.getByRole('button', { name: 'Next' }).focus()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('First')))
    expect(tab('One').textContent).toContain('1 field to fix')
  })

  it('clears completion for edited and subsequent steps while preserving data', async () => {
    render(<AdvancedWizard />)
    fireEvent.change(screen.getByLabelText('First'), { target: { value: 'A' } })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(tab('Two').getAttribute('aria-current')).toBe('step'))
    fireEvent.change(screen.getByLabelText('Second'), { target: { value: 'B' } })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(tab('Three').getAttribute('aria-current')).toBe('step'))
    expect(tab('Two').getAttribute('data-state')).toBe('complete')
    fireEvent.click(tab('One'))
    fireEvent.change(screen.getByLabelText('First'), { target: { value: '' } })
    expect(tab('Two').getAttribute('data-state')).toBe('upcoming')
    fireEvent.click(tab('Three'))
    await waitFor(() => expect(tab('One').hasAttribute('data-invalid')).toBe(true))
    expect(tab('One').getAttribute('aria-current')).toBe('step')
    expect((screen.getByLabelText('Second') as HTMLInputElement).value).toBe('B')
  })

  it('locks navigation and runs only one validation for simultaneous requests', async () => {
    const pending = deferred()
    const validate = vi.fn(() => pending.promise)
    render(<AdvancedWizard validate={validate} nextProps={{ disabled: false }} />)
    fireEvent.change(screen.getByLabelText('First'), { target: { value: 'A' } })
    fireEvent.click(screen.getByRole('button', { name: 'Double next' }))
    expect(validate).toHaveBeenCalledTimes(1)
    expect((screen.getByRole('button', { name: 'Validating…' }) as HTMLButtonElement).disabled).toBe(true)
    expect(tab('Two').hasAttribute('data-disabled')).toBe(true)
    await act(async () => pending.resolve(true))
    await waitFor(() => expect(tab('Two').getAttribute('aria-current')).toBe('step'))
  })

  it('discards validation after a value change and allows retry', async () => {
    const pending = deferred()
    render(<AdvancedWizard validate={() => pending.promise} />)
    fireEvent.change(screen.getByLabelText('First'), { target: { value: 'A' } })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.change(screen.getByLabelText('First'), { target: { value: 'B' } })
    await act(async () => pending.resolve(true))
    expect(tab('One').getAttribute('aria-current')).toBe('step')
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(tab('Two').getAttribute('aria-current')).toBe('step'))
  })

  it('does not overwrite an external selection with a stale result', async () => {
    const pending = deferred()
    render(<AdvancedWizard controlled validate={() => pending.promise} />)
    fireEvent.change(screen.getByLabelText('First'), { target: { value: 'A' } })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'External selection' }))
    await act(async () => pending.resolve(true))
    expect(tab('Three').getAttribute('aria-current')).toBe('step')
    expect(tab('One').getAttribute('data-state')).toBe('upcoming')
  })

  it('waits for a controlled panel to open before focusing its invalid field', async () => {
    render(<AdvancedWizard controlled />)
    fireEvent.change(screen.getByLabelText('First'), { target: { value: 'A' } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(tab('Two').hasAttribute('data-invalid')).toBe(true))
    expect(tab('One').getAttribute('aria-current')).toBe('step')
    expect(document.activeElement).not.toBe(screen.getByLabelText('Second'))
    await waitFor(() => expect(screen.getByTestId('requested').textContent).toBe('two'))
    fireEvent.click(screen.getByRole('button', { name: 'Accept selection' }))
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Second')))
  })

  it('ignores unknown targets and falls back when the active step is removed', async () => {
    render(<AdvancedWizard />)
    fireEvent.click(screen.getByRole('button', { name: 'Unknown target' }))
    expect(tab('One').getAttribute('aria-current')).toBe('step')
    fireEvent.change(screen.getByLabelText('First'), { target: { value: 'A' } })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(tab('Two').getAttribute('aria-current')).toBe('step'))
    fireEvent.click(screen.getByRole('button', { name: 'Remove second' }))
    await waitFor(() => expect(tab('One').getAttribute('aria-current')).toBe('step'))
  })

  it('does not navigate to a target removed during validation', async () => {
    const pending = deferred()
    render(<AdvancedWizard validate={() => pending.promise} />)
    fireEvent.change(screen.getByLabelText('First'), { target: { value: 'A' } })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove second' }))
    await act(async () => pending.resolve(true))
    expect(tab('One').getAttribute('aria-current')).toBe('step')
  })

  it('composes custom clicks and honors preventDefault', async () => {
    const onClick = vi.fn()
    const view = render(<AdvancedWizard nextProps={{ onClick }} />)
    fireEvent.change(screen.getByLabelText('First'), { target: { value: 'A' } })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(tab('Two').getAttribute('aria-current')).toBe('step'))
    expect(onClick).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    view.rerender(<AdvancedWizard nextProps={{ onClick: (event) => event.preventDefault() }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(tab('One').getAttribute('aria-current')).toBe('step')
  })
  it('localizes navigation and error counts while explicit children take priority', async () => {
    const view = render(<AdvancedWizard labels={{ next: 'Devam et', previous: 'Geri', errors: (count) => `${count} alanı düzeltin` }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Devam et' }))
    await waitFor(() => expect(tab('One').textContent).toContain('1 alanı düzeltin'))
    fireEvent.change(screen.getByLabelText('First'), { target: { value: 'A' } })
    fireEvent.click(screen.getByRole('button', { name: 'Devam et' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Geri' })).toBeTruthy())
    view.rerender(<AdvancedWizard labels={{ next: 'Devam et' }} nextProps={{ children: 'Continue here' }} />)
    expect(screen.getByRole('button', { name: 'Continue here' })).toBeTruthy()
  })

  it('allows a custom previous handler to cancel then navigate backwards', async () => {
    const view = render(<AdvancedWizard previousProps={{ onClick: (event) => event.preventDefault() }} />)
    fireEvent.change(screen.getByLabelText('First'), { target: { value: 'A' } })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(tab('Two').getAttribute('aria-current')).toBe('step'))
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(tab('Two').getAttribute('aria-current')).toBe('step')
    const onClick = vi.fn()
    view.rerender(<AdvancedWizard previousProps={{ onClick }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onClick).toHaveBeenCalledOnce()
    expect(tab('One').getAttribute('aria-current')).toBe('step')
  })

})
