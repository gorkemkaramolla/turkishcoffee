import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { Button } from '../button/button'
import { Input } from '../input/input'
import { Form, FormControl, FormErrorSummary, FormField, FormItem, FormLabel, FormMessage } from './form'
import {
  FormTabs,
  FormTabsActions,
  type FormTabsLabels,
  FormTabsContent,
  FormTabsList,
  FormTabsNext,
  FormTabsPrevious,
  FormTabsTrigger,
  useFormTabs,
} from './form-tabs'

const meta = { title: 'Components/FormTabs' } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const turkishLabels: FormTabsLabels = {
  next: 'Devam et', previous: 'Geri', validating: 'Doğrulanıyor…', complete: 'Tamamlandı',
  errors: (count) => `${count} alanı düzeltin`,
  position: (current, total) => `Adım ${current} / ${total}`,
}

type Values = { firstName: string; lastName: string; nationalId: string; startDate: string; email: string }

function Field({ name, label, required, slow }: { name: keyof Values; label: string; required?: boolean; slow?: boolean }) {
  return (
    <FormField<Values, keyof Values>
      name={name}
      rules={{ required: required ? `${label} is required` : false, validate: slow ? () => new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 1500)) : undefined }}
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
function Actions({ turkish }: { turkish?: boolean }) {
  const { isLast } = useFormTabs()
  return (
    <FormTabsActions>
      <FormTabsPrevious />
      <FormTabsNext />
      {isLast && <Button type="submit">{turkish ? 'Kaydet' : 'Create'}</Button>}
    </FormTabsActions>
  )
}

function Example({ linear, turkish, many, errors, slow }: { linear?: boolean; turkish?: boolean; many?: boolean; errors?: boolean; slow?: boolean }) {
  const form = useForm<Values>({
    defaultValues: { firstName: '', lastName: '', nationalId: '', startDate: '', email: '' },
  })
  useEffect(() => {
    if (errors) {
      form.setError('firstName', { message: 'Adınızı girin' })
      form.setError('nationalId', { message: 'Kimlik numaranızı kontrol edin' })
    }
  }, [errors, form])
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => alert(JSON.stringify(v, null, 2)))}
        className="flex w-full min-w-0 max-w-3xl flex-col gap-4"
      >
        {!linear && <FormErrorSummary />}
        <FormTabs defaultValue="employee" linear={linear} labels={turkish ? turkishLabels : undefined}>
          <FormTabsList aria-label={turkish ? 'Form bölümleri' : 'Form sections'}>
            <FormTabsTrigger value="employee">{turkish ? 'Çalışan kişisel bilgileri' : 'Employee'}</FormTabsTrigger>
            <FormTabsTrigger value="personnel">{turkish ? 'Özlük ve işe giriş bilgileri' : 'Personnel file'}</FormTabsTrigger>
            <FormTabsTrigger value="contact">{turkish ? 'İletişim ve adres bilgileri' : 'Contact'}</FormTabsTrigger>
            {many && <FormTabsTrigger value="preferences">Bildirim tercihleri</FormTabsTrigger>}
            {many && <FormTabsTrigger value="notes">Ek bilgiler ve açıklamalar</FormTabsTrigger>}
          </FormTabsList>
          <FormTabsContent value="employee">
            <div className="flex flex-col gap-3">
              <Field name="firstName" label={turkish ? 'Ad' : 'First name'} required slow={slow} />
              <Field name="lastName" label={turkish ? 'Soyad' : 'Last name'} required />
            </div>
          </FormTabsContent>
          <FormTabsContent value="personnel">
            <div className="flex flex-col gap-3">
              <Field name="nationalId" label={turkish ? 'Kimlik numarası' : 'National ID'} required />
              <Field name="startDate" label={turkish ? 'İşe giriş tarihi' : 'Start date'} required />
            </div>
          </FormTabsContent>
          <FormTabsContent value="contact">
            <div className="flex flex-col gap-3">
              <Field name="email" label={turkish ? 'E-posta' : 'Email'} required />
            </div>
          </FormTabsContent>
          {many && <FormTabsContent value="preferences"><p className="text-sm text-muted-foreground">Bildirim tercihleri isteğe bağlıdır.</p></FormTabsContent>}
          {many && <FormTabsContent value="notes"><p className="text-sm text-muted-foreground">Ek bilgi bulunmuyor. Formu kaydedebilirsiniz.</p></FormTabsContent>}
          {linear ? <Actions turkish={turkish} /> : <FormTabsActions><Button type="submit">{turkish ? 'Kaydet' : 'Create'}</Button></FormTabsActions>}
        </FormTabs>
      </form>
    </Form>
  )
}

/**
 * Free tabs: switch any time. A failed submit opens the first tab with an error,
 * marks every tab that has one, and FormErrorSummary links to each field.
 */
export const Tabs: Story = { render: () => <Example /> }

/** Stepper: Next validates the current step before moving on; done steps get a check. */
export const Linear: Story = { render: () => <Example linear /> }


/** Long labels stay readable in the horizontally scrolling step strip. */
export const TurkishSteps: Story = { render: () => <Example linear turkish many /> }
export const TurkishTabs: Story = { render: () => <Example turkish many /> }
/** Errors are also visible on the active step. */
export const Errors: Story = { render: () => <Example linear turkish errors /> }
/** Fill the first two fields and continue to see the validation lock and spinner. */
export const AsyncValidation: Story = { render: () => <Example linear slow /> }
