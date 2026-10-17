import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert, AlertTitle, AlertDescription } from './alert'

const meta = {
  title: 'Components/Alert',
  component: Alert,
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Tones: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-3">
      {(['neutral', 'info', 'success', 'warning', 'danger'] as const).map((tone) => (
        <Alert key={tone} tone={tone}>
          <AlertTitle>Payment {tone}</AlertTitle>
          <AlertDescription>The card issuer returned a message about this charge.</AlertDescription>
        </Alert>
      ))}
    </div>
  ),
}

export const Info: Story = {
  render: () => (
    <Alert tone="info" className="w-96">
      <AlertTitle>Leave requests close on Friday</AlertTitle>
      <AlertDescription>Anything submitted after that waits for next month.</AlertDescription>
    </Alert>
  ),
}
