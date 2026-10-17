import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  SearchField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SplitButton,
  SplitButtonAction,
  SplitButtonMenu,
  Tabs,
  TabsList,
  TabsTrigger,
  toast,
} from '../../src'
import { DataTable, type DataTableColumn } from '../../src/components/data-table'
import { DownloadIcon, EllipsisIcon, MailIcon, TrashIcon, UserIcon, UsersIcon } from '../../src/lib/icons'
import { AddEmployeeSheet } from './add-employee-sheet'
import {
  departments,
  employeeById,
  employees,
  initials,
  longDate,
  statusLabel,
  statusTone,
  type Employee,
  type Status,
} from './data'
import { MapPinIcon, PhoneIcon } from '../../src/lib/icons'
import { PageHeader, StatCard } from './shell'

const statusFilters: Array<{ value: 'all' | Status; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'on-leave', label: 'On leave' },
  { value: 'probation', label: 'Probation' },
  { value: 'passive', label: 'Passive' },
]

const departmentItems = { all: 'All departments', ...Object.fromEntries(departments.map((d) => [d, d])) }

function PersonCell({ employee, onOpen }: { employee: Employee; onOpen: () => void }) {
  const manager = employee.managerId ? employeeById(employee.managerId) : undefined
  return (
    <HoverCard>
      <HoverCardTrigger
        href="#"
        onClick={(event) => {
          event.preventDefault()
          onOpen()
        }}
        className="flex min-w-0 items-center gap-2.5 hover:underline"
      >
        <Avatar className="size-7">
          <AvatarFallback className="text-[11px]">{initials(employee.name)}</AvatarFallback>
        </Avatar>
        <span className="truncate font-medium">{employee.name}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex gap-3">
          <Avatar className="size-11">
            <AvatarFallback>{initials(employee.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="font-semibold">{employee.name}</p>
            <p className="text-muted-foreground text-sm">
              {employee.title} · {employee.department}
            </p>
          </div>
        </div>
        <dl className="text-muted-foreground mt-3 grid gap-1.5 text-sm [&_svg]:size-4 [&>div]:flex [&>div]:items-center [&>div]:gap-2">
          <div>
            <MailIcon />
            <dd className="text-foreground truncate">{employee.email}</dd>
          </div>
          <div>
            <PhoneIcon />
            <dd className="text-foreground">{employee.phone}</dd>
          </div>
          <div>
            <MapPinIcon />
            <dd className="text-foreground">{employee.location}</dd>
          </div>
          {manager && (
            <div>
              <UserIcon />
              <dd>
                Reports to <span className="text-foreground">{manager.name}</span>
              </dd>
            </div>
          )}
        </dl>
      </HoverCardContent>
    </HoverCard>
  )
}

export function PeoplePage({ onOpenProfile }: { onOpenProfile: (id: string) => void }) {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'all' | Status>('all')
  const [department, setDepartment] = useState('all')
  const [search, setSearch] = useState('')
  const [offboarding, setOffboarding] = useState<Employee | null>(null)

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 800)
    return () => window.clearTimeout(id)
  }, [])

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: employees.length }
    for (const e of employees) result[e.status] = (result[e.status] ?? 0) + 1
    return result
  }, [])

  const rows = useMemo(() => {
    const needle = search.toLocaleLowerCase('tr-TR')
    return employees.filter(
      (e) =>
        (status === 'all' || e.status === status) &&
        (department === 'all' || e.department === department) &&
        (!needle || `${e.name} ${e.title} ${e.email}`.toLocaleLowerCase('tr-TR').includes(needle)),
    )
  }, [status, department, search])

  const columns = useMemo<Array<DataTableColumn<Employee>>>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 240,
        cell: ({ row }) => <PersonCell employee={row.original} onOpen={() => onOpenProfile(row.original.id)} />,
      },
      { accessorKey: 'title', header: 'Job title', size: 200 },
      { accessorKey: 'department', header: 'Department', size: 170 },
      { accessorKey: 'location', header: 'Location', size: 130 },
      {
        accessorKey: 'startDate',
        header: 'Started',
        size: 130,
        cell: (info) => longDate.format(info.getValue<Date>()),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        cell: (info) => <Badge tone={statusTone[info.getValue<Status>()]}>{statusLabel[info.getValue<Status>()]}</Badge>,
        meta: { exportValue: (row: Employee) => statusLabel[row.status] },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 56,
        enableSorting: false,
        enableResizing: false,
        enableHiding: false,
        meta: { label: 'Actions', reorderable: false, align: 'end' },
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" aria-label={`Actions for ${row.original.name}`} />}
            >
              <EllipsisIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onOpenProfile(row.original.id)}>
                <UserIcon />
                Open profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast('Message drafted', { description: row.original.email })}>
                <MailIcon />
                Send message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem tone="danger" onClick={() => setOffboarding(row.original)}>
                <TrashIcon />
                Offboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onOpenProfile],
  )

  const filtersActive = status !== 'all' || department !== 'all' || search !== ''

  return (
    <>
      <PageHeader
        title="People"
        description="Everyone at Torun Yazılım, across six departments and three offices."
        actions={
          <>
            <SplitButton variant="secondary">
              <SplitButtonAction onClick={() => toast.success('Headcount report exported', { description: 'headcount-2026-10.xlsx' })}>
                <DownloadIcon />
                Export report
              </SplitButtonAction>
              <SplitButtonMenu label="More report formats">
                <DropdownMenuItem onClick={() => toast('Exported as CSV')}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast('Exported as PDF')}>Export as PDF</DropdownMenuItem>
              </SplitButtonMenu>
            </SplitButton>
            <AddEmployeeSheet />
          </>
        }
      />

      <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={loading} label="Headcount" value="64" change="+3" trend="up" good footnote="since September" />
        <StatCard loading={loading} label="Attrition, 12 months" value="4.2%" change="0.8 pt" trend="down" good footnote="vs. last year" />
        <StatCard loading={loading} label="Open positions" value="9" change="+2" trend="up" good={false} footnote="2 close this week" />
        <StatCard loading={loading} label="Average tenure" value="3.6 yrs" change="0.3 yrs" trend="up" good footnote="vs. last year" />
      </section>

      <Alert tone="warning">
        <AlertTitle>3 probation reviews are overdue</AlertTitle>
        <AlertDescription>
          Reviews for Öykü Aydın, Mert Kılıç and Elif Koç were due last week. Probation ends automatically if nobody
          signs off.
        </AlertDescription>
      </Alert>

      <section aria-label="Directory" className="flex flex-col gap-4">
        <Tabs value={status} onValueChange={(value) => setStatus(value as typeof status)}>
          <TabsList>
            {statusFilters.map((f) => (
              <TabsTrigger key={f.value} value={f.value} className="px-3">
                {f.label}
                <span className="text-xs tabular-nums opacity-70">{counts[f.value] ?? 0}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {rows.length === 0 ? (
          <div className="rounded-lg border">
            <EmptyState
              icon={<UsersIcon />}
              title="Nobody matches these filters"
              description="Try another department or status, or clear the search."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStatus('all')
                    setDepartment('all')
                    setSearch('')
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <DataTable
            aria-label="Employees"
            locale="tr-TR"
            columns={columns}
            data={rows}
            getRowId={(row) => row.id}
            loading={loading}
            sortable
            resizable
            reorderable
            hideable
            selectable="hover"
            exportable
            pageSize={10}
            toolbar={
              <div className="flex flex-wrap items-center gap-2">
                <SearchField
                  value={search}
                  onSearch={setSearch}
                  label="Search people"
                  hideLabel
                  size="sm"
                  placeholder="Search name, title or email"
                  className="w-64"
                  debounceMs={150}
                />
                <Select items={departmentItems} value={department} onValueChange={(v) => v && setDepartment(v)}>
                  <SelectTrigger size="sm" className="w-48" aria-label="Department">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(departmentItems).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filtersActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStatus('all')
                      setDepartment('all')
                      setSearch('')
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>
            }
          />
        )}
      </section>

      <AlertDialog open={offboarding !== null} onOpenChange={(open) => !open && setOffboarding(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Offboard {offboarding?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They lose access today. Their record, leave history and documents are archived for ten years, as Turkish
              labour law requires.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => toast.success(`${offboarding?.name} offboarded`)}>
              Offboard {offboarding?.name.split(' ')[0]}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
