import { useState, type ReactNode } from 'react'
import {
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
  AvatarGroup,
  AvatarGroupItem,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Label,
  Progress,
  Separator,
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
  toast,
} from '../../src'
import { CalendarIcon, ChevronDownIcon, DownloadIcon, EllipsisIcon, MailIcon, TrashIcon } from '../../src/lib/icons'
import {
  activity,
  dateSpan,
  dateTime,
  documents,
  employees,
  employeeById,
  initials,
  leaveLabel,
  leaves,
  leaveTone,
  longDate,
  money,
  statusLabel,
  statusTone,
} from './data'
import { BriefcaseIcon, FileIcon, MapPinIcon, PencilIcon, PhoneIcon, UploadIcon } from '../../src/lib/icons'

/** A label/value pair in a definition list. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

function Meta({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm [&_svg]:size-4">
      {icon}
      {children}
    </span>
  )
}

export function ProfilePage({ employeeId }: { employeeId: string }) {
  const person = employeeById(employeeId) ?? employees[0]!
  const manager = person.managerId ? employeeById(person.managerId) : employeeById('emp_2')
  const team = employees.filter((e) => e.department === person.department && e.id !== person.id).slice(0, 7)
  const history = leaves.filter((l) => l.employeeId === person.id)
  const [showSalary, setShowSalary] = useState(false)
  const [offboard, setOffboard] = useState(false)

  return (
    <>
      <Card className="py-0">
        <div className="flex flex-wrap items-start gap-5 p-6">
          <Avatar className="size-16 text-xl">
            <AvatarFallback>{initials(person.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{person.name}</h1>
              <Badge tone={statusTone[person.status]}>{statusLabel[person.status]}</Badge>
              <Badge>{person.contract}</Badge>
            </div>
            <p className="text-muted-foreground">
              {person.title} · {person.department}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              <Meta icon={<MailIcon />}>{person.email}</Meta>
              <Meta icon={<PhoneIcon />}>{person.phone}</Meta>
              <Meta icon={<MapPinIcon />}>{person.location}</Meta>
              <Meta icon={<CalendarIcon />}>Joined {longDate.format(person.startDate)}</Meta>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => toast('Message drafted', { description: person.email })}>
              <MailIcon />
              Message
            </Button>
            <Button onClick={() => toast('Editing is not part of this demo')}>
              <PencilIcon />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="More actions" />}>
                <EllipsisIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => toast.success('Profile exported', { description: 'PDF, 2 pages' })}>
                  <DownloadIcon />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BriefcaseIcon />
                  Change role
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem tone="danger" onClick={() => setOffboard(true)}>
                  <TrashIcon />
                  Offboard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="gap-6">
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="overview" className="px-4">
            Overview
          </TabsTrigger>
          <TabsTrigger value="time-off" className="px-4">
            Time off
          </TabsTrigger>
          <TabsTrigger value="documents" className="px-4">
            Documents
          </TabsTrigger>
          <TabsTrigger value="activity" className="px-4">
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Employment</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-3">
                    <Field label="Employee ID">{person.id.replace('emp_', 'TR-')}</Field>
                    <Field label="Department">{person.department}</Field>
                    <Field label="Job title">{person.title}</Field>
                    <Field label="Contract">{person.contract}</Field>
                    <Field label="Start date">{longDate.format(person.startDate)}</Field>
                    <Field label="Work location">{person.location}</Field>
                    <Field label="Manager">
                      {manager ? (
                        <HoverCard>
                          <HoverCardTrigger href="#" onClick={(e) => e.preventDefault()} className="text-primary-text hover:underline">
                            {manager.name}
                          </HoverCardTrigger>
                          <HoverCardContent className="w-64">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-10">
                                <AvatarFallback>{initials(manager.name)}</AvatarFallback>
                              </Avatar>
                              <div className="leading-tight">
                                <p className="font-medium">{manager.name}</p>
                                <p className="text-muted-foreground text-sm">{manager.title}</p>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ) : (
                        '—'
                      )}
                    </Field>
                    <Field label="Working pattern">Full time, hybrid</Field>
                    <Field label="Probation">Completed</Field>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-start justify-between">
                  <div className="flex flex-col gap-1.5">
                    <CardTitle>Compensation</CardTitle>
                    <CardDescription>Visible to HR and the line manager only.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="show-salary" className="text-muted-foreground font-normal whitespace-nowrap">
                      Show amounts
                    </Label>
                    <Switch id="show-salary" checked={showSalary} onCheckedChange={setShowSalary} />
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-3">
                    <Field label="Gross monthly">
                      <span className={cn('tabular-nums', !showSalary && 'blur-sm select-none')}>
                        {money.format(person.salary / 12)}
                      </span>
                    </Field>
                    <Field label="Gross yearly">
                      <span className={cn('tabular-nums', !showSalary && 'blur-sm select-none')}>
                        {money.format(person.salary)}
                      </span>
                    </Field>
                    <Field label="Last change">+12% on 1 Jul 2026</Field>
                  </dl>
                </CardContent>
              </Card>

              <Collapsible className="rounded-lg border">
                <CollapsibleTrigger className="group flex w-full items-center justify-between px-6 py-4 text-start text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Emergency contact
                  <ChevronDownIcon className="text-muted-foreground size-4 transition-transform group-data-panel-open:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Separator />
                  <dl className="grid gap-x-6 gap-y-5 px-6 py-4 sm:grid-cols-3">
                    <Field label="Name">Hasan {person.name.split(' ')[1]}</Field>
                    <Field label="Relationship">Spouse</Field>
                    <Field label="Phone">+90 532 418 22 90</Field>
                  </dl>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leave balance</CardTitle>
                  <CardDescription>2026 allowance</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {[
                    { label: 'Annual leave', used: 5, total: 14 },
                    { label: 'Sick leave', used: 2, total: 10 },
                    { label: 'Carried over', used: 3, total: 5 },
                  ].map((b) => (
                    <div key={b.label} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-sm">
                        <span>{b.label}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {b.total - b.used} of {b.total} days left
                        </span>
                      </div>
                      <Progress value={(b.used / b.total) * 100} aria-label={`${b.label} used`} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team</CardTitle>
                  <CardDescription>
                    {team.length} colleagues in {person.department}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AvatarGroup aria-label={`${person.department} team`} max={5} size="lg">
                    {team.map((member) => (
                      <AvatarGroupItem key={member.id} name={member.name} />
                    ))}
                  </AvatarGroup>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="h-auto px-0">
                    View org chart
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="time-off">
          <Card className="gap-0 overflow-hidden py-0">
            {history.length === 0 ? (
              <EmptyState icon={<CalendarIcon />} title="No time off this year" description="Requests show up here once they are sent." />
            ) : (
              <Table aria-label="Time off history">
                <TableHeader>
                  <TableRow>
                    <TableHead className="ps-6">Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-end">Days</TableHead>
                    <TableHead className="pe-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="ps-6">{l.type}</TableCell>
                      <TableCell>{dateSpan(l.from, l.to)}</TableCell>
                      <TableCell className="text-end tabular-nums">{l.days}</TableCell>
                      <TableCell className="pe-6">
                        <Badge tone={leaveTone[l.status]}>{leaveLabel[l.status]}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="flex flex-col gap-6">
          <Card className="gap-0 overflow-hidden py-0">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <p className="font-semibold">Personnel file</p>
                <p className="text-muted-foreground text-sm">{documents.length} documents</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => toast('Pick files to upload')}>
                <UploadIcon />
                Upload
              </Button>
            </div>
            <Table aria-label="Documents">
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-6">Name</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Signature</TableHead>
                  <TableHead className="pe-6 text-end">
                    <span className="sr-only">Download</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="ps-6">
                      <span className="flex items-center gap-2.5">
                        <FileIcon className="text-muted-foreground size-4" />
                        <span className="font-medium">{d.name}</span>
                        <span className="text-muted-foreground text-xs">{d.size}</span>
                      </span>
                    </TableCell>
                    <TableCell>{d.kind}</TableCell>
                    <TableCell>{longDate.format(d.uploaded)}</TableCell>
                    <TableCell>
                      {d.signed ? <Badge tone="success">Signed</Badge> : <Badge tone="warning">Awaiting signature</Badge>}
                    </TableCell>
                    <TableCell className="pe-6 text-end">
                      <Button variant="ghost" size="icon" aria-label={`Download ${d.name}`}>
                        <DownloadIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<FileIcon />}
                title="No certificates yet"
                description="Training and safety certificates you upload will be tracked for expiry."
                action={
                  <Button variant="secondary" size="sm">
                    <UploadIcon />
                    Upload certificate
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent>
              <ol className="relative flex flex-col gap-6 before:absolute before:inset-y-1 before:start-[0.6875rem] before:w-px before:bg-border">
                {activity.map((a) => (
                  <li key={a.id} className="relative flex gap-4">
                    <span
                      className={cn(
                        'ring-background z-[1] mt-0.5 size-[1.375rem] shrink-0 rounded-full border-4 ring-4',
                        a.tone === 'success' && 'bg-success border-success-soft',
                        a.tone === 'warning' && 'bg-warning border-warning-soft',
                        a.tone === 'info' && 'bg-primary border-primary-soft',
                        !a.tone && 'bg-muted-foreground border-muted',
                      )}
                    />
                    <div className="text-sm">
                      <p>
                        <span className="font-medium">{a.actor}</span> {a.text}
                      </p>
                      <p className="text-muted-foreground text-xs">{dateTime.format(a.when)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={offboard} onOpenChange={setOffboard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Offboard {person.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They lose access today. Their record and documents are archived for ten years.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => toast.success(`${person.name} offboarded`)}>
              Offboard {person.name.split(' ')[0]}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
