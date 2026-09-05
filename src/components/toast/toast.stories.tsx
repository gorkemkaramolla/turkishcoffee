import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toaster, toast } from './index'
import { Button } from '../button/button'

const meta = { title: 'Components/Toast', component: Toaster } satisfies Meta<typeof Toaster>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => toast({ title: 'Scheduled', description: 'Friday at 10:00.' })}>
        Default
      </Button>
      <Button variant="success" onClick={() => toast.success({ title: 'Saved' })}>
        Success
      </Button>
      <Button
        variant="destructive"
        onClick={() => toast.error({ title: 'Failed', description: 'Could not reach the server.' })}
      >
        Error
      </Button>
      {/* Mount <Toaster /> once near your app root. */}
      <Toaster />
    </div>
  ),
}
