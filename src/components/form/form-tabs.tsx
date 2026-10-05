'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type * as React from 'react'
import { useFormContext, useFormState } from 'react-hook-form'
import { RegistryContext, StepContext, type Registry } from '../../lib/form-steps'
import { Button } from '../button/button'
import { Tabs, TabsContent, TabsTrigger } from '../tabs/tabs'

type FormTabsContextValue = {
  value: string | undefined
  steps: string[]
  linear: boolean
  goTo: (step: string) => Promise<boolean>
  hasError: (step: string) => boolean
}

const FormTabsContext = createContext<FormTabsContextValue | null>(null)

/**
 * Splits one react-hook-form form across tabs or steps without losing input.
 * Every step stays mounted while hidden, so values survive switching. Each
 * FormField inside a FormTabsContent belongs to that step: a tab with an error
 * shows a dot, and a failed submit jumps to the first such tab and focuses the
 * field. With `linear`, a step can only be left forwards once its fields (and
 * every earlier step's) validate: a stepper. Steps are ordered as they mount.
 * Must be inside `<Form>`; put it inside the `<form>` so the submit button works.
 *
 * @example
 * <Form {...form}>
 *   <form onSubmit={form.handleSubmit(onSubmit)}>
 *     <FormTabs defaultValue="employee" linear>
 *       <TabsList>
 *         <FormTabsTrigger value="employee">Employee</FormTabsTrigger>
 *         <FormTabsTrigger value="personnel">Personnel file</FormTabsTrigger>
 *       </TabsList>
 *       <FormTabsContent value="employee">…FormFields…</FormTabsContent>
 *       <FormTabsContent value="personnel">…FormFields…</FormTabsContent>
 *       <FormTabsPrevious />
 *       <FormTabsNext />
 *     </FormTabs>
 *     <Button type="submit">Save</Button>
 *   </form>
 * </Form>
 */
export function FormTabs({
  value: valueProp,
  defaultValue,
  onValueChange,
  linear = false,
  ...props
}: Omit<React.ComponentProps<typeof Tabs>, 'value' | 'defaultValue' | 'onValueChange'> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Only move forwards once the steps before the target validate. */
  linear?: boolean
}) {
  const form = useFormContext()
  const formState = useFormState({ control: form.control })
  const fields = useRef(new Map<string, Set<string>>())
  const [steps, setSteps] = useState<string[]>([])
  const [internal, setInternal] = useState(defaultValue)
  const value = valueProp ?? internal ?? steps[0]
  const pendingFocus = useRef<string | null>(null)

  const fieldsOf = useCallback((step: string) => {
    let set = fields.current.get(step)
    if (!set) fields.current.set(step, (set = new Set()))
    return set
  }, [])

  const registry = useMemo<Registry>(
    () => ({
      registerStep: (step) => {
        fieldsOf(step)
        setSteps((s) => (s.includes(step) ? s : [...s, step]))
        return () => {
          fields.current.delete(step)
          setSteps((s) => s.filter((x) => x !== step))
        }
      },
      // A field mounts before its step's effect runs, so this may create the step's set.
      registerField: (step, name) => {
        fieldsOf(step).add(name)
        return () => fields.current.get(step)?.delete(name)
      },
    }),
    [fieldsOf],
  )

  const firstError = (step: string) =>
    [...fieldsOf(step)].find((name) => form.getFieldState(name, formState).invalid)

  const show = (step: string, focus?: string) => {
    pendingFocus.current = focus ?? null
    setInternal(step)
    onValueChange?.(step)
  }

  // Hidden fields can't take focus, so focus once their panel is shown.
  useEffect(() => {
    const name = pendingFocus.current
    if (!name) return
    pendingFocus.current = null
    form.setFocus(name)
  }, [value, form])

  // A failed submit: open the first step holding an error.
  useEffect(() => {
    if (!formState.submitCount) return
    for (const step of steps) {
      const name = firstError(step)
      if (name) return show(step, name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on a new submit
  }, [formState.submitCount])

  const goTo = async (target: string) => {
    const to = steps.indexOf(target)
    if (linear && value !== undefined && to > steps.indexOf(value)) {
      for (const step of steps.slice(0, to)) {
        const names = [...fieldsOf(step)]
        if (names.length && !(await form.trigger(names))) {
          show(step, firstError(step) ?? names[0])
          return false
        }
      }
    }
    show(target)
    return true
  }

  const ctx: FormTabsContextValue = {
    value,
    steps,
    linear,
    goTo,
    hasError: (step) => firstError(step) !== undefined,
  }

  return (
    <RegistryContext.Provider value={registry}>
      <FormTabsContext.Provider value={ctx}>
        <Tabs value={value ?? null} onValueChange={(v) => void goTo(v as string)} {...props} />
      </FormTabsContext.Provider>
    </RegistryContext.Provider>
  )
}

/** A TabsTrigger that marks its step when one of its fields has an error. */
export function FormTabsTrigger({
  value,
  children,
  ...props
}: React.ComponentProps<typeof TabsTrigger> & { value: string }) {
  const invalid = useFormTabs().hasError(value)
  return (
    <TabsTrigger value={value} data-invalid={invalid ? '' : undefined} {...props}>
      {children}
      {invalid && (
        <>
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-destructive" />
          <span className="sr-only">(has errors)</span>
        </>
      )}
    </TabsTrigger>
  )
}

/** One step's panel. Stays mounted while hidden, so its fields keep their values. */
export function FormTabsContent({
  value,
  keepMounted = true,
  ...props
}: React.ComponentProps<typeof TabsContent> & { value: string }) {
  const registry = useContext(RegistryContext)
  useEffect(() => registry?.registerStep(value), [registry, value])
  return (
    <StepContext.Provider value={value}>
      <TabsContent value={value} keepMounted={keepMounted} {...props} />
    </StepContext.Provider>
  )
}

/** Goes to the next step (validating first when `linear`). Renders nothing on the last step. */
export function FormTabsNext({ children = 'Next', ...props }: React.ComponentProps<typeof Button>) {
  const { next, isLast } = useFormTabs()
  if (isLast) return null
  return (
    <Button type="button" onClick={() => void next()} {...props}>
      {children}
    </Button>
  )
}

/** Goes to the previous step. Renders nothing on the first step. */
export function FormTabsPrevious({
  children = 'Back',
  variant = 'outline',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { previous, isFirst } = useFormTabs()
  if (isFirst) return null
  return (
    <Button type="button" variant={variant} onClick={previous} {...props}>
      {children}
    </Button>
  )
}

/**
 * The current step and navigation, for custom controls (e.g. show the submit
 * button only when `isLast`). Must be called inside FormTabs.
 */
export function useFormTabs() {
  const ctx = useContext(FormTabsContext)
  if (!ctx) throw new Error('useFormTabs must be used inside <FormTabs>')
  const { value, steps, goTo, hasError } = ctx
  const index = value === undefined ? -1 : steps.indexOf(value)
  return {
    value,
    steps,
    index,
    isFirst: index <= 0,
    isLast: index === steps.length - 1,
    hasError,
    goTo,
    next: () => {
      const step = steps[index + 1]
      return step === undefined ? Promise.resolve(false) : goTo(step)
    },
    previous: () => {
      const step = index > 0 ? steps[index - 1] : undefined
      if (step !== undefined) void goTo(step)
    },
  }
}
