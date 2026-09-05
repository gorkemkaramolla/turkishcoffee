import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert, AlertTitle, AlertDescription } from './alert'

const meta = {
  title: 'Components/Alert',
  component: Alert,
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-3">
      {(['default', 'destructive', 'success', 'warning'] as const).map((variant) => (
        <Alert key={variant} variant={variant}>
          <AlertTitle>Payment {variant}</AlertTitle>
          <AlertDescription>The card issuer returned a message about this charge.</AlertDescription>
        </Alert>
      ))}
    </div>
  ),
}
