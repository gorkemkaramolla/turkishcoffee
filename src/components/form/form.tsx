'use client'

import { createContext, useContext, useId, useRef } from 'react'
import type * as React from 'react'
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldErrors,
  type FieldPath,
  type FieldValues,
  type FormProviderProps,
} from 'react-hook-form'
import { cn } from '../../lib/cn'
import { Alert, AlertDescription, AlertTitle } from '../alert/alert'
import { InfoLabel, type InfoLabelProps } from '../info-label/info-label'
import { Label } from '../label/label'
import { NavigatorContext, useStepField, type FieldNavigator } from '../../lib/form-steps'

/**
 * react-hook-form's FormProvider. Imported from `turkishcoffee/form`, not the
 * root: `react-hook-form` is an OPTIONAL peer, so this lives behind its own entry
 * point and never loads for projects that only import the root barrel.
 *
 * @example
 * const form = useForm<Values>({ defaultValues: { email: '' } })
 *
 * <Form {...form}>
 *   <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
 *     <FormField
 *       control={form.control}
 *       name="email"
 *       rules={{ required: 'Email is required' }}
 *       render={({ field }) => (
 *         <FormItem>
 *           <FormLabel>Email</FormLabel>
 *           <FormControl><Input type="email" {...field} /></FormControl>
 *           <FormDescription>We never share it.</FormDescription>
 *           <FormMessage />
 *         </FormItem>
 *       )}
 *     />
 *     <Button type="submit">Save</Button>
 *   </form>
 * </Form>
 */
export function Form<
  TFieldValues extends FieldValues,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches FormProvider's own default
  TContext = any,
  TTransformedValues = TFieldValues,
>(props: FormProviderProps<TFieldValues, TContext, TTransformedValues>) {
  // A slot FormTabs fills, so FormErrorSummary can open a tab from outside it.
  const navigator = useRef<FieldNavigator | null>(null)
  return (
    <NavigatorContext.Provider value={navigator}>
      <FormProvider {...props} />
    </NavigatorContext.Provider>
  )
}

type FieldContextValue = { name: string }
const FieldContext = createContext<FieldContextValue | null>(null)

type ItemContextValue = { id: string }
const ItemContext = createContext<ItemContextValue | null>(null)

/** Connects one field to the form: a react-hook-form Controller plus the context the Form* parts read. */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  useStepField(props.name)
  return (
    <FieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FieldContext.Provider>
  )
}

/** Ids and error state for the current field. Must be called inside FormField and FormItem. */
export function useFormField() {
  const field = useContext(FieldContext)
  const item = useContext(ItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: field?.name as string })

  if (!field) {
    throw new Error('useFormField must be used inside a <FormField>')
  }
  if (!item) {
    throw new Error('useFormField must be used inside a <FormItem>')
  }

  const state = getFieldState(field.name, formState)
  const { id } = item

  return {
    id,
    name: field.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...state,
  }
}

/** Wraps one field's label, control, description and message; generates their shared id. */
export function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = useId()
  return (
    <ItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn('flex flex-col gap-2', className)}
        {...props}
      />
    </ItemContext.Provider>
  )
}

/**
 * Label wired to the field's control; turns red on error. Pass `info`
 * to put an InfoLabel's info button beside it.
 */
export function FormLabel({
  className,
  info,
  infoLabel,
  ...props
}: React.ComponentProps<typeof Label> & Partial<Pick<InfoLabelProps, 'info' | 'infoLabel'>>) {
  const { error, formItemId } = useFormField()
  const labelProps = {
    'data-slot': 'form-label',
    'data-error': !!error,
    className: cn('data-[error=true]:text-danger-text', className),
    htmlFor: formItemId,
    ...props,
  }
  if (info === undefined) return <Label {...labelProps} />
  return <InfoLabel info={info} infoLabel={infoLabel} {...labelProps} />
}

/**
 * Wraps your input and wires up id + aria-describedby + aria-invalid.
 * Use with any control that forwards props: <FormControl><Input /></FormControl>
 */
export function FormControl({
  children,
}: {
  children: React.ReactElement<Record<string, unknown>>
}) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  const Comp = children.type as React.ElementType
  return (
    <Comp
      {...children.props}
      id={formItemId}
      aria-describedby={error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId}
      aria-invalid={!!error}
    />
  )
}

/** Helper text under the control. */
export function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField()
  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

/** Renders the field's validation error, or `children` when there is none. */
export function FormMessage({ className, children, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error.message ?? '') : children

  if (!body) return null

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn('text-danger-text text-sm', className)}
      {...props}
    >
      {body}
    </p>
  )
}

type ErrorEntry = { name: string; message: string }

// react-hook-form nests errors like its values (`address.city`, `items.0.name`);
// a node with a `type` is one field's error.
function collectErrors(errors: FieldErrors, prefix = ''): ErrorEntry[] {
  return Object.entries(errors).flatMap(([key, value]) => {
    if (!value || typeof value !== 'object') return []
    const name = prefix ? `${prefix}.${key}` : key
    if (typeof (value as { type?: unknown }).type === 'string') {
      return [{ name, message: String((value as { message?: unknown }).message ?? '') }]
    }
    return collectErrors(value as FieldErrors, name)
  })
}

const defaultSummaryTitle = (count: number) =>
  count === 1 ? '1 field needs attention' : `${count} fields need attention`

/**
 * A danger Alert that lists every validation error after a failed submit,
 * each a link that focuses its field — opening the FormTabs tab it sits in
 * first. Hidden until the first submit and once every error is fixed. Put it
 * above the fields (or the tabs), where it is seen first; worth it on long or
 * tabbed forms, noise on a short one. Errors set on `root` are listed as text.
 *
 * @example
 * <form onSubmit={form.handleSubmit(onSubmit)}>
 *   <FormErrorSummary />
 *   <FormTabs>…</FormTabs>
 * </form>
 */
export function FormErrorSummary({
  title = defaultSummaryTitle,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Alert>, 'tone' | 'title'> & {
  /** The heading, from the number of errors. */
  title?: (count: number) => React.ReactNode
}) {
  const { setFocus } = useFormContext()
  const { errors, submitCount } = useFormState()
  const slot = useContext(NavigatorContext)

  if (!submitCount) return null
  const entries = collectErrors(errors)
  if (!entries.length) return null
  const order = slot?.current
  if (order) entries.sort((a, b) => order.rank(a.name) - order.rank(b.name))
  // Read the slot on click, not render: FormTabs refills it with its latest steps.
  const reveal = (name: string) => (slot?.current ? slot.current.reveal(name) : setFocus(name))

  return (
    <Alert data-slot="form-error-summary" tone="danger" className={className} {...props}>
      <AlertTitle>{title(entries.length)}</AlertTitle>
      <AlertDescription>
        <ul className="mt-1 flex flex-col gap-1">
          {entries.map(({ name, message }) => {
            const text = message || name
            const isRoot = name === 'root' || name.startsWith('root.') || name.endsWith('.root')
            return (
              <li key={name}>
                {isRoot ? (
                  text
                ) : (
                  <button
                    type="button"
                    className="cursor-pointer rounded-sm text-left underline underline-offset-2 outline-none hover:no-underline focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => reveal(name)}
                  >
                    {text}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
