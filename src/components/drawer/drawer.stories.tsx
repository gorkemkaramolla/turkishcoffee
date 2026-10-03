import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './index'
import { Button } from '../button/button'

const meta = { title: 'Components/Drawer', component: Drawer } satisfies Meta<typeof Drawer>
export default meta
type Story = StoryObj<typeof meta>

/** Always a bottom drawer. For a dialog that becomes one on mobile, use `Dialog`. */
export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>Open drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Move goal</DrawerTitle>
          <DrawerDescription>Drag down or tap outside to dismiss.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}
