import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion'

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { type: 'single', collapsible: true },
  render: (args) => (
    <Accordion {...args} className="w-96">
      <AccordionItem value="shipping">
        <AccordionTrigger>How long does shipping take?</AccordionTrigger>
        <AccordionContent>Two to four working days across the country.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Can I return an order?</AccordionTrigger>
        <AccordionContent>Within 14 days, unopened, with the receipt.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
