import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { tr } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import { DatePicker, DateRangePicker } from './index'
import { Button } from '../button/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../form/form'

function DefaultDemo() {
  const [date, setDate] = React.useState<Date>()
  return <DatePicker value={date} onChange={setDate} />
}

function RangeDemo() {
  const [range, setRange] = React.useState<DateRange>()
  return <DateRangePicker value={range} onChange={setRange} />
}

function TurkishLocaleDemo() {
  const [date, setDate] = React.useState<Date>()
  return <DatePicker value={date} onChange={setDate} locale={tr} placeholder="Tarih seçin" />
}

function InFormDemo() {
  const form = useForm<{ birthday?: Date }>()
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => alert(values.birthday?.toDateString()))}
      >
        <FormField
          control={form.control}
          name="birthday"
          rules={{ required: 'Pick your birthday.' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birthday</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  calendarProps={{ disabled: { after: new Date() } }}
                />
              </FormControl>
              <FormDescription>Future dates are disabled.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="self-start">
          Submit
        </Button>
      </form>
    </Form>
  )
}

const meta = { title: 'Components/DatePicker', component: DatePicker } satisfies Meta<
  typeof DatePicker
>
export default meta
type Story = StoryObj<typeof meta>

/** Popover on `sm` and up; switch Storybook to a mobile viewport to see the drawer. */
export const Default: Story = {
  render: () => <DefaultDemo />,
}

export const Range: Story = {
  render: () => <RangeDemo />,
}

export const TurkishLocale: Story = {
  render: () => <TurkishLocaleDemo />,
}

export const InForm: Story = {
  render: () => <InFormDemo />,
}
