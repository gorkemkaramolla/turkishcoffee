import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Avatar,
  AvatarFallback,
  Button,
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  DatePicker,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Spinner,
  Switch,
  Textarea,
  toast,
} from '../../src'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormTabs,
  FormTabsContent,
  FormTabsList,
  FormTabsNext,
  FormTabsPrevious,
  FormTabsTrigger,
  useFormTabs,
} from '../../src/components/form'
import { PlusIcon } from '../../src/lib/icons'
import { departments, employees, initials, type Employee } from './data'

type NewEmployee = {
  firstName: string
  lastName: string
  email: string
  department: string
  title: string
  manager: Employee | null
  skills: string[]
  startDate: Date | undefined
  contract: string
  notes: string
  invite: boolean
}

const departmentItems = Object.fromEntries(departments.map((d) => [d, d]))
const managers = employees.filter((e) => e.title.toLowerCase().includes('manager') || e.managerId === null)
const skillOptions = ['Accounting', 'Excel', 'Figma', 'German', 'Leadership', 'Negotiation', 'Python', 'React', 'SAP', 'SQL', 'Turkish payroll law']

function Footer({ submitting }: { submitting: boolean }) {
  const { isLast } = useFormTabs()
  return (
    <SheetFooter className="mt-auto flex-row justify-between border-t">
      <FormTabsPrevious />
      <span className="flex-1" />
      <FormTabsNext />
      {isLast && (
        <Button type="submit" disabled={submitting}>
          {submitting && <Spinner label={null} />}
          {submitting ? 'Adding…' : 'Add employee'}
        </Button>
      )}
    </SheetFooter>
  )
}

/** "Add employee": a three-step form that validates each step before moving on. */
export function AddEmployeeSheet() {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<NewEmployee>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      title: '',
      manager: null,
      skills: [],
      startDate: undefined,
      contract: 'permanent',
      notes: '',
      invite: true,
    },
  })

  const onSubmit = (values: NewEmployee) => {
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setOpen(false)
      form.reset()
      toast.success(`${values.firstName} ${values.lastName} added`, {
        description: values.invite ? `An invitation went to ${values.email}.` : 'No invitation sent yet.',
      })
    }, 800)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button />}>
        <PlusIcon />
        Add employee
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Add employee</SheetTitle>
          <SheetDescription>Nothing is saved until the last step.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col" noValidate>
            <FormTabs defaultValue="person" linear className="min-h-0 flex-1 gap-0">
              <div className="border-b px-4 py-3">
                <FormTabsList>
                  <FormTabsTrigger value="person">Person</FormTabsTrigger>
                  <FormTabsTrigger value="role">Role</FormTabsTrigger>
                  <FormTabsTrigger value="welcome">Welcome</FormTabsTrigger>
                </FormTabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <FormTabsContent value="person" className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField<NewEmployee, 'firstName'>
                      name="firstName"
                      rules={{ required: 'Enter a first name' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input autoComplete="off" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField<NewEmployee, 'lastName'>
                      name="lastName"
                      rules={{ required: 'Enter a last name' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input autoComplete="off" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField<NewEmployee, 'email'>
                    name="email"
                    rules={{
                      required: 'Enter a work email',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter an email like ayse@torun.example' },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel info="Their sign-in, and where payslips are sent.">Work email</FormLabel>
                        <FormControl>
                          <Input type="email" autoComplete="off" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormTabsContent>

                <FormTabsContent value="role" className="flex flex-col gap-4">
                  <FormField<NewEmployee, 'department'>
                    name="department"
                    rules={{ required: 'Choose a department' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select items={departmentItems} value={field.value || null} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choose a department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField<NewEmployee, 'title'>
                    name="title"
                    rules={{ required: 'Enter a job title' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Software engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField<NewEmployee, 'manager'>
                    name="manager"
                    rules={{ required: 'Choose a manager' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manager</FormLabel>
                        <Combobox
                          items={managers}
                          itemToStringLabel={(e: Employee) => e.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <ComboboxInput placeholder="Search managers" />
                          </FormControl>
                          <ComboboxContent>
                            <ComboboxEmpty>No manager matches.</ComboboxEmpty>
                            <ComboboxList>
                              {(e: Employee) => (
                                <ComboboxItem key={e.id} value={e}>
                                  <Avatar className="size-6">
                                    <AvatarFallback className="text-[10px]">{initials(e.name)}</AvatarFallback>
                                  </Avatar>
                                  <span className="flex min-w-0 flex-col leading-tight">
                                    <span className="truncate">{e.name}</span>
                                    <span className="text-muted-foreground truncate text-xs">{e.title}</span>
                                  </span>
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField<NewEmployee, 'skills'>
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills</FormLabel>
                        <Combobox multiple items={skillOptions} value={field.value} onValueChange={field.onChange}>
                          <ComboboxChips>
                            <ComboboxValue>
                              {(values: string[]) => values.map((skill) => <ComboboxChip key={skill}>{skill}</ComboboxChip>)}
                            </ComboboxValue>
                            <FormControl>
                              <ComboboxChipsInput placeholder={field.value.length ? '' : 'Add skills'} />
                            </FormControl>
                          </ComboboxChips>
                          <ComboboxContent>
                            <ComboboxEmpty>No skill matches.</ComboboxEmpty>
                            <ComboboxList>
                              {(skill: string) => (
                                <ComboboxItem key={skill} value={skill}>
                                  {skill}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                        <FormDescription>Used to suggest training and mentors.</FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField<NewEmployee, 'startDate'>
                    name="startDate"
                    rules={{ required: 'Pick a start date' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start date</FormLabel>
                        <FormControl>
                          <DatePicker value={field.value} onChange={field.onChange} placeholder="Pick a date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField<NewEmployee, 'contract'>
                    name="contract"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract</FormLabel>
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="grid-cols-2">
                          {[
                            ['permanent', 'Permanent'],
                            ['fixed', 'Fixed term'],
                          ].map(([value, label]) => (
                            <Label
                              key={value}
                              htmlFor={`contract-${value}`}
                              className="has-data-checked:border-primary has-data-checked:bg-primary-soft flex items-center gap-2 rounded-md border px-3 py-2.5 font-normal"
                            >
                              <RadioGroupItem value={value!} id={`contract-${value}`} />
                              {label}
                            </Label>
                          ))}
                        </RadioGroup>
                      </FormItem>
                    )}
                  />
                </FormTabsContent>

                <FormTabsContent value="welcome" className="flex flex-col gap-4">
                  <FormField<NewEmployee, 'notes'>
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note for the manager</FormLabel>
                        <FormControl>
                          <Textarea rows={4} placeholder="Laptop, building access, first-week buddy…" {...field} />
                        </FormControl>
                        <FormDescription>Shown on their first-day checklist.</FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField<NewEmployee, 'invite'>
                    name="invite"
                    render={({ field }) => (
                      <FormItem className="flex-row items-start justify-between gap-4 rounded-md border p-3">
                        <div className="flex flex-col gap-1">
                          <FormLabel>Send the invitation now</FormLabel>
                          <FormDescription>They can sign in and fill in their personal details.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </FormTabsContent>
              </div>

              <Footer submitting={submitting} />
            </FormTabs>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
