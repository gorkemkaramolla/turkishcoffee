'use client'

import { createContext, useContext, useId } from 'react'
import type * as React from 'react'
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { cn } from '../../lib/cn'
import { Label } from '../label/label'

/**
 * `react-hook-form` is an OPTIONAL peer, so this lives behind its own entry
 * point (`turkishcoffee/form`) and never loads for projects that only
 * import the root barrel.
 */
export const Form = FormProvider

type FieldContextValue = { name: string }
const FieldContext = createContext<FieldContextValue | null>(null)

type ItemContextValue = { id: string }
const ItemContext = createContext<ItemContextValue | null>(null)

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FieldContext.Provider>
  )
}

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

export function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField()
  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn('data-[error=true]:text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  )
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
      className={cn('text-destructive text-sm', className)}
      {...props}
    >
      {body}
    </p>
  )
}
