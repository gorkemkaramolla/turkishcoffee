import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta = { title: 'Components/Tabs', component: Tabs } satisfies Meta<typeof Tabs>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-96">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="team" disabled>Team</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="text-muted-foreground py-4 text-sm">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="password" className="text-muted-foreground py-4 text-sm">
        Change your password here.
      </TabsContent>
    </Tabs>
  ),
}
