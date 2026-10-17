import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Label,
  NativeSelect,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Spinner,
  Switch,
  toast,
} from '../../src'
import {
  Form,
  FormControl,
  FormDescription,
  FormErrorSummary,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../src/components/form'
import { PageHeader } from './shell'

type Settings = {
  company: string
  subdomain: string
  timezone: string
  weekStart: string
  approval: string
  annualDays: string
  carryOver: boolean
  notifyRequests: boolean
  notifyDigest: boolean
  notifyBirthdays: boolean
}

const defaults: Settings = {
  company: 'Torun Yazılım A.Ş.',
  subdomain: 'torun',
  timezone: 'Europe/Istanbul',
  weekStart: 'monday',
  approval: 'manager-then-hr',
  annualDays: '14',
  carryOver: true,
  notifyRequests: true,
  notifyDigest: true,
  notifyBirthdays: false,
}

/** A settings card: what it controls on the left, the controls on the right. */
function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card className="gap-0 py-0 md:grid md:grid-cols-[18rem_minmax(0,1fr)]">
      <CardHeader className="py-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pb-6 md:py-6">{children}</CardContent>
    </Card>
  )
}

function SwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex flex-col gap-1">
        <Label htmlFor={id}>{label}</Label>
        <p id={`${id}-description`} className="text-muted-foreground text-sm">
          {description}
        </p>
      </div>
      <Switch id={id} aria-describedby={`${id}-description`} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

const approvalOptions = [
  { value: 'manager', label: 'Line manager', hint: 'Fastest. HR sees approved requests only.' },
  { value: 'manager-then-hr', label: 'Manager, then HR', hint: 'Recommended. HR checks balances before the final yes.' },
  { value: 'hr', label: 'HR only', hint: 'For small teams without line managers.' },
]

export function SettingsPage() {
  const form = useForm<Settings>({ defaultValues: defaults })
  const [saving, setSaving] = useState(false)
  const dirty = form.formState.isDirty

  const onSubmit = (values: Settings) => {
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      form.reset(values)
      toast.success('Settings saved')
    }, 700)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <PageHeader title="Settings" description="Company-wide defaults. Changes apply to everyone." />
        <FormErrorSummary />

        <Section title="Company" description="How Torun HR names and finds your company.">
          <FormField<Settings, 'company'>
            name="company"
            rules={{ required: 'Enter the company name' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legal name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>Printed on payslips and contracts.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField<Settings, 'subdomain'>
            name="subdomain"
            rules={{
              required: 'Choose an address',
              pattern: { value: /^[a-z0-9-]{3,}$/, message: 'Use 3 or more lowercase letters, digits or dashes' },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel info="Changing it breaks bookmarks people already have.">Workspace address</FormLabel>
                <InputGroup>
                  <InputGroupAddon className="text-muted-foreground">https://</InputGroupAddon>
                  <FormControl>
                    <InputGroupInput {...field} />
                  </FormControl>
                  <InputGroupAddon align="end" className="text-muted-foreground">
                    .torunhr.com
                  </InputGroupAddon>
                </InputGroup>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField<Settings, 'timezone'>
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time zone</FormLabel>
                  <FormControl>
                    <NativeSelect {...field}>
                      <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                      <option value="Europe/Berlin">Berlin (GMT+2)</option>
                      <option value="Europe/London">London (GMT+1)</option>
                    </NativeSelect>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField<Settings, 'weekStart'>
              name="weekStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Week starts on</FormLabel>
                  <FormControl>
                    <NativeSelect {...field}>
                      <option value="monday">Monday</option>
                      <option value="sunday">Sunday</option>
                    </NativeSelect>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Section>

        <Section title="Time off" description="Who approves leave, and how many days people get.">
          <FormField<Settings, 'approval'>
            name="approval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Approval</FormLabel>
                <RadioGroup value={field.value} onValueChange={field.onChange} className="gap-2">
                  {approvalOptions.map((o) => (
                    <Label
                      key={o.value}
                      htmlFor={`approval-${o.value}`}
                      className="has-data-checked:border-primary has-data-checked:bg-primary-soft flex items-start gap-3 rounded-md border p-3 font-normal"
                    >
                      <RadioGroupItem value={o.value} id={`approval-${o.value}`} className="mt-0.5" />
                      <span className="flex flex-col gap-0.5">
                        <span className="font-medium">{o.label}</span>
                        <span className="text-muted-foreground text-sm">{o.hint}</span>
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </FormItem>
            )}
          />
          <FormField<Settings, 'annualDays'>
            name="annualDays"
            rules={{
              required: 'Enter a number of days',
              validate: (v) => Number(v) >= 14 || 'The legal minimum is 14 days',
            }}
            render={({ field }) => (
              <FormItem className="max-w-56">
                <FormLabel>Annual leave, first year</FormLabel>
                <InputGroup>
                  <FormControl>
                    <InputGroupInput type="number" inputMode="numeric" min={14} {...field} />
                  </FormControl>
                  <InputGroupAddon align="end" className="text-muted-foreground">
                    days
                  </InputGroupAddon>
                </InputGroup>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField<Settings, 'carryOver'>
            name="carryOver"
            render={({ field }) => (
              <FormItem className="flex-row items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Let people carry up to 5 unused days into next year</FormLabel>
              </FormItem>
            )}
          />
        </Section>

        <Section title="Notifications" description="Email sent to HR administrators.">
          <FormField<Settings, 'notifyRequests'>
            name="notifyRequests"
            render={({ field }) => (
              <SwitchRow
                id="notify-requests"
                label="New leave requests"
                description="An email for each request that needs your decision."
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Separator />
          <FormField<Settings, 'notifyDigest'>
            name="notifyDigest"
            render={({ field }) => (
              <SwitchRow
                id="notify-digest"
                label="Monday digest"
                description="Who is out this week, open reviews and contract renewals."
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Separator />
          <FormField<Settings, 'notifyBirthdays'>
            name="notifyBirthdays"
            render={({ field }) => (
              <SwitchRow
                id="notify-birthdays"
                label="Birthdays and work anniversaries"
                description="A reminder the day before."
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </Section>

        <Section title="Danger zone" description="Actions that cannot be undone.">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Reset leave balances</p>
              <p className="text-muted-foreground text-sm">Sets everyone back to their yearly allowance.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="secondary" />}>Reset balances</AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all leave balances?</AlertDialogTitle>
                  <AlertDialogDescription>
                    64 people go back to their full 2026 allowance. Days already taken this year are forgotten. This
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => toast.success('Leave balances reset')}>Reset balances</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Section>

        <div className="bg-background/90 sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {dirty && <span className="text-muted-foreground me-auto text-sm">You have unsaved changes.</span>}
          <Button type="button" variant="secondary" disabled={!dirty || saving} onClick={() => form.reset()}>
            Discard
          </Button>
          <Button type="submit" disabled={!dirty || saving}>
            {saving && <Spinner label={null} />}
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
