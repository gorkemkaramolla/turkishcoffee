import type { Meta, StoryObj } from '@storybook/react-vite'
import { HrApp } from './hr-app'

/**
 * Torun HR — a people-operations app built only from the library's
 * components, to see them working together on real screens. Every screen is
 * live: the sidebar switches between them, and sorting, filtering, approving,
 * the add-employee form and the settings form all work. Flip the theme in the
 * toolbar to check dark mode.
 */
const meta = {
  title: 'Showcase/Torun HR',
  component: HrApp,
  parameters: { fullBleed: true, docs: { source: { type: 'code' } } },
} satisfies Meta<typeof HrApp>
export default meta
type Story = StoryObj<typeof meta>

/** The directory: KPIs, a warning, status tabs and the data grid. Click a name to open the profile. */
export const People: Story = { args: { initialPage: 'people' } }

/** Approval queue with bulk approve, a leave calendar, who's out and the policy. */
export const TimeOff: Story = { args: { initialPage: 'time-off' } }

/** One employee: header, employment details, leave balance, documents and an activity timeline. */
export const EmployeeProfile: Story = { args: { initialPage: 'profile', initialEmployee: 'emp_1' } }

/** A folder Tree beside the selected folder's files, with search and drag-and-drop upload. Name a file "fail…" to see a failed upload. */
export const Documents: Story = { args: { initialPage: 'documents' } }

/** A validated settings form with a sticky save bar. Change something to see it. */
export const Settings: Story = { args: { initialPage: 'settings' } }

/** An empty state for a module that isn't set up. */
export const Payroll: Story = { args: { initialPage: 'payroll' } }
