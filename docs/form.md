# Form

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

Needs the optional peer `react-hook-form`. It is **not** exported from the root `turkishcoffee` entry.

```tsx
import { Form, FormField, useFormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormErrorSummary, FormTabs, FormTabsList, FormTabsTrigger, FormTabsContent, FormTabsNext, FormTabsPrevious, useFormTabs, type FormStepState } from 'turkishcoffee/form'
```

react-hook-form's FormProvider. Imported from `turkishcoffee/form`, not the
root: `react-hook-form` is an OPTIONAL peer, so this lives behind its own entry
point and never loads for projects that only import the root barrel.

## Example

```tsx
const form = useForm<Values>({ defaultValues: { email: '' } })

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
    <FormField
      control={form.control}
      name="email"
      rules={{ required: 'Email is required' }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl><Input type="email" {...field} /></FormControl>
          <FormDescription>We never share it.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Save</Button>
  </form>
</Form>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

### `FormErrorSummary`

- `title?: (count: number) => React.ReactNode` — The heading, from the number of errors.

### `FormTabsContextValue`

- `reached: number` — The furthest step index reached through validation.

### `FormTabs`

- `linear?: boolean` — A stepper: only move forwards once the steps before the target validate.

## Parts

- `FormField` — Connects one field to the form: a react-hook-form Controller plus the context the Form* parts read.
- `useFormField` — Ids and error state for the current field. Must be called inside FormField and FormItem.
- `FormItem` — Wraps one field's label, control, description and message; generates their shared id.
- `FormLabel` — Label wired to the field's control; turns red on error. Pass `info` to put an InfoLabel's info button beside it.
- `FormControl` — Wraps your input and wires up id + aria-describedby + aria-invalid. Use with any control that forwards props: <FormControl><Input /></FormControl>
- `FormDescription` — Helper text under the control.
- `FormMessage` — Renders the field's validation error, or `children` when there is none.
- `FormErrorSummary` — A danger Alert that lists every validation error after a failed submit, each a link that focuses its field — opening the FormTabs tab it sits in first. Hidden until the first submit and once every error is fixed. Put it above the fields (or the tabs), where it is seen first; worth it on long or tabbed forms, noise on a short one. Errors set on `root` are listed as text.

  ```tsx
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormErrorSummary />
    <FormTabs>…</FormTabs>
  </form>
  ```

- `type FormStepState` — Where a step stands in a linear form.
- `FormTabs` — Splits one react-hook-form form across tabs or steps without losing input. Every step stays mounted while hidden, so values survive switching. Each FormField inside a FormTabsContent belongs to that step: a tab with errors shows an error icon and their count, and a failed submit jumps to the first such tab and focuses the field. Add FormErrorSummary to list every error with a link that opens its tab. With `linear` it is a stepper: FormTabsList draws numbered steps instead of tabs, a step can only be left forwards once its fields (and every earlier step's) validate, done steps show a check and a step left with errors says how many. Steps are ordered as they mount. Must be inside `<Form>`; put it inside the `<form>` so the submit button works.

  ```tsx
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormTabs defaultValue="employee" linear>
        <FormTabsList>
          <FormTabsTrigger value="employee">Employee</FormTabsTrigger>
          <FormTabsTrigger value="personnel">Personnel file</FormTabsTrigger>
        </FormTabsList>
        <FormTabsContent value="employee">…FormFields…</FormTabsContent>
        <FormTabsContent value="personnel">…FormFields…</FormTabsContent>
        <FormTabsPrevious />
        <FormTabsNext />
      </FormTabs>
      <Button type="submit">Save</Button>
    </form>
  </Form>
  ```

- `FormTabsList` — The row of tabs, or with `linear` the row of steps. Use it in place of TabsList inside FormTabs so a stepper gets its own layout.
- `FormTabsTrigger` — One tab, or with `linear` one step. A tab with errors shows an error icon and how many fields to fix. A step shows its number, a check once done, or an error icon and "N fields to fix" when left with errors; steps further than the next one can't be picked until the ones before them are done.
- `FormTabsContent` — One step's panel. Stays mounted while hidden, so its fields keep their values.
- `FormTabsNext` — Goes to the next step (validating first when `linear`). Renders nothing on the last step.
- `FormTabsPrevious` — Goes to the previous step. Renders nothing on the first step.
- `useFormTabs` — The current step and navigation, for custom controls (e.g. show the submit button only when `isLast`). Must be called inside FormTabs.
