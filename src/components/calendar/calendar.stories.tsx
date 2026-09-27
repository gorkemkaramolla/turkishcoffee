import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { DateRange } from 'react-day-picker'
import { tr } from 'react-day-picker/locale'
import { Calendar } from './index'

function SingleDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border border-border"
    />
  )
}

function RangeDemo() {
  const [range, setRange] = React.useState<DateRange | undefined>()
  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      selected={range}
      onSelect={setRange}
      className="rounded-md border border-border"
    />
  )
}

function TurkishDemo() {
  const [date, setDate] = React.useState<Date | undefined>()
  return (
    <Calendar
      mode="single"
      locale={tr}
      selected={date}
      onSelect={setDate}
      className="rounded-md border border-border"
    />
  )
}

const meta = { title: 'Components/Calendar', component: Calendar } satisfies Meta<typeof Calendar>
export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  render: () => <SingleDemo />,
}

export const Range: Story = {
  render: () => <RangeDemo />,
}

export const Turkish: Story = {
  render: () => <TurkishDemo />,
}
