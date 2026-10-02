# Form

**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.

Needs the optional peer `react-hook-form`. It is **not** exported from the root `turkishcoffee` entry.

```tsx
import { Form, FormField, useFormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from 'turkishcoffee/form'
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

## Parts

- `FormField` — Connects one field to the form: a react-hook-form Controller plus the context the Form* parts read.
- `useFormField` — Ids and error state for the current field. Must be called inside FormField and FormItem.
- `FormItem` — Wraps one field's label, control, description and message; generates their shared id.
- `FormLabel` — Label wired to the field's control; turns destructive on error.
- `FormControl` — Wraps your input and wires up id + aria-describedby + aria-invalid. Use with any control that forwards props: <FormControl><Input /></FormControl>
- `FormDescription` — Helper text under the control.
- `FormMessage` — Renders the field's validation error, or `children` when there is none.
