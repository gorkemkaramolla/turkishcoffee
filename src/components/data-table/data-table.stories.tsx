import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable, type DataTableColumn, type DataTableProps } from './data-table'
import { Badge } from '../badge/badge'

type Payment = { id: string; status: 'success' | 'pending' | 'failed'; email: string; amount: number }

const data: Payment[] = Array.from({ length: 14 }, (_, i) => ({
  id: `pay_${i + 1}`,
  status: (['success', 'pending', 'failed'] as const)[i % 3]!,
  email: `user${i + 1}@example.com`,
  amount: (i + 1) * 37,
}))

const columns: Array<DataTableColumn<Payment>> = [
  { accessorKey: 'id', header: 'ID' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => {
      const status = info.getValue<Payment['status']>()
      return (
        <Badge variant={status === 'success' ? 'success' : status === 'pending' ? 'warning' : 'destructive'}>
          {status}
        </Badge>
      )
    },
  },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: (info) => `$${info.getValue<number>().toFixed(2)}`,
  },
]

// Typed on the props rather than `typeof DataTable`: the generic would
// otherwise widen to RowData and reject Payment columns.
const meta: Meta<DataTableProps<Payment>> = {
  title: 'Components/DataTable',
  component: DataTable,
}
export default meta
type Story = StoryObj<DataTableProps<Payment>>

export const SortableAndPaginated: Story = {
  args: { columns, data, pageSize: 5, className: 'w-3xl' },
}

export const Empty: Story = {
  args: { columns, data: [], className: 'w-3xl' },
}
