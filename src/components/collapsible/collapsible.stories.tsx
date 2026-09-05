import type { Meta, StoryObj } from '@storybook/react-vite'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible'
import { Button } from '../button'

const meta = {
  title: 'Components/Collapsible',
  component: Collapsible,
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Collapsible className="w-80">
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm">
          Show advanced settings
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 flex flex-col gap-2 rounded-md border border-border p-3 text-sm">
          <span>Retry failed jobs automatically</span>
          <span>Keep raw request logs for 30 days</span>
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
}
