# Form

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

Needs the optional peer `react-hook-form`. It is **not** exported from the root `turkishcoffee` entry.

```tsx
import { Form, FormField, useFormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormTabs, FormTabsTrigger, FormTabsContent, FormTabsNext, FormTabsPrevious, useFormTabs } from 'turkishcoffee/form'
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

- `linear?: boolean` — Only move forwards once the steps before the target validate.

## Parts

- `FormField` — Connects one field to the form: a react-hook-form Controller plus the context the Form* parts read.
- `useFormField` — Ids and error state for the current field. Must be called inside FormField and FormItem.
- `FormItem` — Wraps one field's label, control, description and message; generates their shared id.
- `FormLabel` — Label wired to the field's control; turns destructive on error.
- `FormControl` — Wraps your input and wires up id + aria-describedby + aria-invalid. Use with any control that forwards props: <FormControl><Input /></FormControl>
- `FormDescription` — Helper text under the control.
- `FormMessage` — Renders the field's validation error, or `children` when there is none.
- `FormTabs` — Splits one react-hook-form form across tabs or steps without losing input. Every step stays mounted while hidden, so values survive switching. Each FormField inside a FormTabsContent belongs to that step: a tab with an error shows a dot, and a failed submit jumps to the first such tab and focuses the field. With `linear`, a step can only be left forwards once its fields (and every earlier step's) validate: a stepper. Steps are ordered as they mount. Must be inside `<Form>`; put it inside the `<form>` so the submit button works.

  ```tsx
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormTabs defaultValue="employee" linear>
        <TabsList>
          <FormTabsTrigger value="employee">Employee</FormTabsTrigger>
          <FormTabsTrigger value="personnel">Personnel file</FormTabsTrigger>
        </TabsList>
        <FormTabsContent value="employee">…FormFields…</FormTabsContent>
        <FormTabsContent value="personnel">…FormFields…</FormTabsContent>
        <FormTabsPrevious />
        <FormTabsNext />
      </FormTabs>
      <Button type="submit">Save</Button>
    </form>
  </Form>
  ```

- `FormTabsTrigger` — A TabsTrigger that marks its step when one of its fields has an error.
- `FormTabsContent` — One step's panel. Stays mounted while hidden, so its fields keep their values.
- `FormTabsNext` — Goes to the next step (validating first when `linear`). Renders nothing on the last step.
- `FormTabsPrevious` — Goes to the previous step. Renders nothing on the first step.
- `useFormTabs` — The current step and navigation, for custom controls (e.g. show the submit button only when `isLast`). Must be called inside FormTabs.
