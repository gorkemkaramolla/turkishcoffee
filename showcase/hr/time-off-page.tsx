import { useMemo, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  DateRangePicker,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  NativeSelect,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableCheckbox,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
  Textarea,
  toast,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  type DateRange,
  type TablePageSize,
} from '../../src'
import { CheckIcon, PlusIcon, XIcon } from '../../src/lib/icons'
import {
  dateSpan,
  employeeById,
  initials,
  leaveLabel,
  leaves as seed,
  leaveTone,
  longDate,
  type Leave,
  type LeaveStatus,
} from './data'
import { PageHeader } from './shell'

function RequestDialog() {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>()
  const [sending, setSending] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Request time off
      </DialogTrigger>
      <DialogContent>
        <form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault()
            setSending(true)
            window.setTimeout(() => {
              setSending(false)
              setOpen(false)
              toast.success('Request sent', { description: 'Your manager has been notified.' })
            }, 700)
          }}
        >
          <DialogHeader>
            <DialogTitle>Request time off</DialogTitle>
            <DialogDescription>You have 9 days of annual leave left this year.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="leave-type">Type</Label>
              <NativeSelect id="leave-type" defaultValue="annual">
                <option value="annual">Annual leave</option>
                <option value="sick">Sick leave</option>
                <option value="unpaid">Unpaid leave</option>
                <option value="marriage">Marriage leave</option>
              </NativeSelect>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="leave-dates">Dates</Label>
              <DateRangePicker id="leave-dates" value={range} onChange={setRange} placeholder="First and last day" className="w-full" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="leave-note">Note for your manager</Label>
              <Textarea id="leave-note" rows={3} placeholder="Optional" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="leave-cover" defaultChecked />
              <Label htmlFor="leave-cover" className="font-normal">
                Tell my team on the shared calendar
              </Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
            <Button type="submit" disabled={!range?.from || sending}>
              {sending && <Spinner label={null} />}
              Send request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function TimeOffPage() {
  const [leaves, setLeaves] = useState(seed)
  const [view, setView] = useState<'pending' | 'all'>('pending')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<TablePageSize>(10)
  const [declining, setDeclining] = useState<Leave | null>(null)
  const [period, setPeriod] = useState<DateRange | undefined>()

  const pending = leaves.filter((l) => l.status === 'pending')
  const list = view === 'pending' ? pending : leaves
  const size = pageSize === 'all' ? Math.max(list.length, 1) : pageSize
  const visible = list.slice((page - 1) * size, page * size)
  const selectable = visible.filter((l) => l.status === 'pending')
  const allSelected = selectable.length > 0 && selectable.every((l) => selected.has(l.id))
  const someSelected = selectable.some((l) => selected.has(l.id))

  const decide = (ids: string[], status: LeaveStatus) => {
    setLeaves((current) => current.map((l) => (ids.includes(l.id) ? { ...l, status } : l)))
    setSelected((current) => new Set([...current].filter((id) => !ids.includes(id))))
  }

  const approved = leaves.filter((l) => l.status === 'approved')
  const leaveDays = useMemo(
    () =>
      approved.flatMap((l) =>
        Array.from({ length: l.days }, (_, i) => new Date(l.from.getFullYear(), l.from.getMonth(), l.from.getDate() + i)),
      ),
    [approved],
  )
  const [day, setDay] = useState<Date | undefined>(new Date(2026, 9, 13))
  const outOnDay = day ? approved.filter((l) => l.from <= day && l.to >= day) : []

  return (
    <>
      <PageHeader
        title="Time off"
        description={`${pending.length} requests are waiting for you. October requests close on Friday.`}
        actions={
          <>
            <DateRangePicker value={period} onChange={setPeriod} placeholder="Any period" className="w-60" />
            <RequestDialog />
          </>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="gap-0 overflow-hidden py-0">
          <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
            <Tabs
              value={view}
              onValueChange={(value) => {
                setView(value as typeof view)
                setPage(1)
              }}
            >
              <TabsList>
                <TabsTrigger value="pending" className="px-3">
                  Waiting
                  <span className="text-xs tabular-nums opacity-70">{pending.length}</span>
                </TabsTrigger>
                <TabsTrigger value="all" className="px-3">
                  All requests
                  <span className="text-xs tabular-nums opacity-70">{leaves.length}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="ms-auto flex min-h-8 items-center gap-2" aria-live="polite">
              {selected.size > 0 && (
                <>
                  <span className="text-muted-foreground text-sm">{selected.size} selected</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      toast.success(`${selected.size} requests approved`)
                      decide([...selected], 'approved')
                    }}
                  >
                    <CheckIcon />
                    Approve selected
                  </Button>
                </>
              )}
            </div>
          </div>

          <Table aria-label="Leave requests">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 ps-4">
                  <TableCheckbox
                    checked={allSelected}
                    indeterminate={!allSelected && someSelected}
                    disabled={selectable.length === 0}
                    aria-label="Select every waiting request on this page"
                    onCheckedChange={() =>
                      setSelected((current) => {
                        const next = new Set(current)
                        selectable.forEach((l) => (allSelected ? next.delete(l.id) : next.add(l.id)))
                        return next
                      })
                    }
                  />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-end">Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pe-4 text-end">
                  <span className="sr-only">Decision</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((leave) => {
                const person = employeeById(leave.employeeId)!
                return (
                  <TableRow key={leave.id} data-state={selected.has(leave.id) ? 'selected' : undefined}>
                    <TableCell className="ps-4">
                      <TableCheckbox
                        checked={selected.has(leave.id)}
                        disabled={leave.status !== 'pending'}
                        aria-label={`Select ${person.name}'s request`}
                        onCheckedChange={() =>
                          setSelected((current) => {
                            const next = new Set(current)
                            if (!next.delete(leave.id)) next.add(leave.id)
                            return next
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7">
                          <AvatarFallback className="text-[11px]">{initials(person.name)}</AvatarFallback>
                        </Avatar>
                        <div className="leading-tight">
                          <p className="font-medium">{person.name}</p>
                          <p className="text-muted-foreground text-xs">{person.department}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {leave.reason ? (
                        <Tooltip>
                          <TooltipTrigger render={<span className="underline decoration-dotted underline-offset-4" />}>
                            {leave.type}
                          </TooltipTrigger>
                          <TooltipContent>“{leave.reason}”</TooltipContent>
                        </Tooltip>
                      ) : (
                        leave.type
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums">{dateSpan(leave.from, leave.to)}</TableCell>
                    <TableCell className="text-end tabular-nums">{leave.days}</TableCell>
                    <TableCell>
                      <Badge tone={leaveTone[leave.status]}>{leaveLabel[leave.status]}</Badge>
                    </TableCell>
                    <TableCell className="pe-4">
                      {leave.status === 'pending' && (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              decide([leave.id], 'approved')
                              toast.success('Leave approved', {
                                description: `${person.name} · ${dateSpan(leave.from, leave.to)}`,
                                action: { label: 'Undo', onClick: () => decide([leave.id], 'pending') },
                              })
                            }}
                          >
                            Approve
                          </Button>
                          <Tooltip>
                            <TooltipTrigger
                              render={<Button size="icon" variant="ghost" aria-label={`Decline ${person.name}'s request`} />}
                              onClick={() => setDeclining(leave)}
                            >
                              <XIcon />
                            </TooltipTrigger>
                            <TooltipContent>Decline</TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground h-32 text-center">
                    You're all caught up — nothing is waiting for a decision.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="border-t px-2">
            <TablePagination
              page={page}
              pageSize={pageSize}
              total={list.length}
              pageSizeOptions={[5, 10, 'all']}
              onPageChange={setPage}
              onPageSizeChange={(next) => {
                setPageSize(next)
                setPage(1)
              }}
            />
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="gap-0 overflow-hidden py-0">
            <CardHeader className="pt-5">
              <CardTitle>Who's out</CardTitle>
              <CardDescription>Shaded days have approved leave. Pick a day.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center px-2">
              <Calendar
                mode="single"
                selected={day}
                onSelect={setDay}
                weekStartsOn={1}
                defaultMonth={new Date(2026, 9, 1)}
                modifiers={{ leave: leaveDays }}
                modifiersClassNames={{ leave: '[&>button]:bg-primary-soft [&>button]:text-primary-text' }}
                className="bg-transparent"
              />
            </CardContent>
            <div className="bg-muted/50 border-t px-6 py-4">
              <p className="mb-3 text-sm font-medium">{day ? longDate.format(day) : 'No day picked'}</p>
              {outOnDay.length === 0 && <p className="text-muted-foreground text-sm">Everyone is in.</p>}
              <ul className="flex flex-col gap-3">
                {outOnDay.map((l) => {
                  const person = employeeById(l.employeeId)!
                  return (
                    <li key={l.id} className="flex items-center gap-3 text-sm">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">{initials(person.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="truncate font-medium">{person.name}</p>
                        <p className="text-muted-foreground text-xs">{l.type}</p>
                      </div>
                      <span className="text-muted-foreground text-xs tabular-nums">{dateSpan(l.from, l.to)}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Card>

          <Card className="gap-1">
            <CardHeader>
              <CardTitle>Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion>
                <AccordionItem value="annual">
                  <AccordionTrigger>Annual leave allowance</AccordionTrigger>
                  <AccordionContent>
                    14 working days for the first five years, 20 days from year six, 26 days from year fifteen.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="sick">
                  <AccordionTrigger>Sick leave</AccordionTrigger>
                  <AccordionContent>A doctor's report is needed from the third day. Upload it to the request.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="carry">
                  <AccordionTrigger>Carrying days over</AccordionTrigger>
                  <AccordionContent>Up to 5 unused days move into the next year and expire on 31 March.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={declining !== null} onOpenChange={(open) => !open && setDeclining(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline this request?</AlertDialogTitle>
            <AlertDialogDescription>
              {declining && employeeById(declining.employeeId)?.name} asked for {declining?.days} days of{' '}
              {declining?.type.toLowerCase()} ({declining && dateSpan(declining.from, declining.to)}). They are told
              straight away and can send a new request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep waiting</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (declining) decide([declining.id], 'declined')
                toast('Request declined')
              }}
            >
              Decline request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
