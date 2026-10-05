import type { Meta, StoryObj } from '@storybook/react-vite'
import type * as React from 'react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  NativeSelect,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../index'

const meta = { title: 'Foundations/Design language' } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
      {children}
    </section>
  )
}

/** The tokens every component is built from: radius, density, elevation, selection. */
export const Tokens: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8 p-2">
      <Section title="Radius" note="sm 2px · md 4px · lg 6px · xl 8px · full for pills only">
        <div className="flex items-end gap-4">
          {(['rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full'] as const).map((r) => (
            <div key={r} className="flex flex-col items-center gap-1.5">
              <div className={`size-14 border border-border bg-muted ${r}`} />
              <code className="text-xs text-muted-foreground">{r}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Density" note="h-control-sm 28px · h-control 32px · h-control-lg 36px; one row, one height">
        <div className="flex items-center gap-2">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Input className="w-40" placeholder="Input" />
          <NativeSelect className="w-32" defaultValue="eur">
            <option value="eur">EUR</option>
            <option value="usd">USD</option>
          </NativeSelect>
        </div>
      </Section>

      <Section title="Elevation" note="Resting surfaces are flat with hairline borders; only floating layers get shadow-float">
        <div className="flex gap-4">
          <div className="flex h-20 w-40 items-center justify-center rounded-lg border border-border text-xs">
            Resting · border
          </div>
          <div className="flex h-20 w-40 items-center justify-center rounded-lg border border-border bg-popover text-xs shadow-float">
            Floating · shadow-float
          </div>
        </div>
      </Section>

      <Section title="Selection" note="Highlighted and selected states use the neutral --selection grey">
        <div className="flex flex-col gap-1 w-64 rounded-md border border-border p-1 text-sm">
          <div className="rounded-sm px-2 py-1">Resting item</div>
          <div className="rounded-sm bg-selection px-2 py-1">Highlighted item</div>
          <div className="bg-selection px-2 py-1">Selected row</div>
        </div>
      </Section>
    </div>
  ),
}

const invoices = [
  { id: 'INV-1042', customer: 'Anatolia Freight', amount: '€12,480.00', status: 'Paid' },
  { id: 'INV-1043', customer: 'Bosphorus Textiles', amount: '€3,215.50', status: 'Overdue' },
  { id: 'INV-1044', customer: 'Kapadokya Tours', amount: '€860.00', status: 'Draft' },
]

/** A typical business screen, to judge the overall feel in light and dark. */
export const BusinessScreen: Story = {
  render: () => (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>Q3 receivables across all customers.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Tabs defaultValue="open">
          <TabsList>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <TabsContent value="open" className="flex flex-col gap-4 pt-2">
            <div className="flex items-end gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="search">Customer</Label>
                <Input id="search" className="w-56" placeholder="Search customers" />
              </div>
              <NativeSelect className="w-36" defaultValue="q3">
                <option value="q3">Q3 2026</option>
                <option value="q2">Q2 2026</option>
              </NativeSelect>
              <Button variant="outline">Export</Button>
              <Button>New invoice</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv, i) => (
                  <TableRow key={inv.id} data-state={i === 1 ? 'selected' : undefined}>
                    <TableCell>
                      <Checkbox aria-label={`Select ${inv.id}`} defaultChecked={i === 1} />
                    </TableCell>
                    <TableCell className="font-medium">{inv.id}</TableCell>
                    <TableCell>{inv.customer}</TableCell>
                    <TableCell className="text-right tabular-nums">{inv.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'destructive' : 'secondary'
                        }
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center gap-2">
              <Switch id="reminders" defaultChecked />
              <Label htmlFor="reminders">Send overdue reminders automatically</Label>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  ),
}
