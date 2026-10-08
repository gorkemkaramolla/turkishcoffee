import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { Input } from '../input/input'
import { Form, FormControl, FormField, FormItem, FormLabel } from './form'

function Field({ info }: { info?: string }) {
  const form = useForm({ defaultValues: { iban: '' } })
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="iban"
        render={({ field }) => (
          <FormItem>
            <FormLabel info={info}>IBAN</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </Form>
  )
}

describe('FormLabel', () => {
  it('renders a plain label without info', () => {
    render(<Field />)
    expect(screen.getByRole('textbox', { name: 'IBAN' })).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('adds an info button and keeps the control labelled', () => {
    render(<Field info="Salaries are paid here." />)
    expect(screen.getByRole('textbox', { name: 'IBAN' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'More information IBAN' })).toBeTruthy()
    expect(screen.getByText('IBAN').closest('label')?.dataset.slot).toBe('form-label')
  })
})
