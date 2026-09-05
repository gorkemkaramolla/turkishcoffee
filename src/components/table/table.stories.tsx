import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '../badge/badge'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './table'

const meta = { title: 'Components/Table', component: Table } satisfies Meta<typeof Table>
export default meta
type Story = StoryObj<typeof meta>

const invoices = [
  { id: 'INV001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
  { id: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
  { id: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
]

export const Default: Story = {
  render: () => (
    <Table className="w-3xl">
      <TableCaption>A list of recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((i) => (
          <TableRow key={i.id}>
            <TableCell className="font-medium">{i.id}</TableCell>
            <TableCell>
              <Badge variant={i.status === 'Paid' ? 'success' : i.status === 'Pending' ? 'warning' : 'destructive'}>
                {i.status}
              </Badge>
            </TableCell>
            <TableCell>{i.method}</TableCell>
            <TableCell className="text-right">{i.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}
