'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type * as React from 'react'
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { useFormContext, useFormState } from 'react-hook-form'
import { cn, cnState } from '../../lib/cn'
import { NavigatorContext, RegistryContext, StepContext, type FieldNavigator, type Registry } from '../../lib/form-steps'
import { CheckIcon, ErrorIcon } from '../../lib/icons'
import { Button } from '../button/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs/tabs'

/** Where a step stands in a linear form. */
export type FormStepState = 'complete' | 'current' | 'upcoming' | 'invalid'

type FormTabsContextValue = {
  value: string | undefined
  steps: string[]
  linear: boolean
  /** The furthest step index reached through validation. */
  reached: number
  goTo: (step: string) => Promise<boolean>
  errorCount: (step: string) => number
}

const FormTabsContext = createContext<FormTabsContextValue | null>(null)

/**
 * Splits one react-hook-form form across tabs or steps without losing input.
 * Every step stays mounted while hidden, so values survive switching. Each
 * FormField inside a FormTabsContent belongs to that step: a tab with errors
 * shows an error icon and their count, and a failed submit jumps to the first
 * such tab and focuses the field. Add FormErrorSummary to list every error
 * with a link that opens its tab.
 *
 * With `linear` it is a stepper: FormTabsList draws numbered steps instead of
 * tabs, a step can only be left forwards once its fields (and every earlier
 * step's) validate, done steps show a check and a step left with errors says
 * how many. Steps are ordered as they mount. Must be inside `<Form>`; put it
 * inside the `<form>` so the submit button works.
 *
 * @example
 * <Form {...form}>
 *   <form onSubmit={form.handleSubmit(onSubmit)}>
 *     <FormTabs defaultValue="employee" linear>
 *       <FormTabsList>
 *         <FormTabsTrigger value="employee">Employee</FormTabsTrigger>
 *         <FormTabsTrigger value="personnel">Personnel file</FormTabsTrigger>
 *       </FormTabsList>
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
  /** A stepper: only move forwards once the steps before the target validate. */
  linear?: boolean
}) {
  const form = useFormContext()
  const formState = useFormState({ control: form.control })
  const fields = useRef(new Map<string, Set<string>>())
  const [steps, setSteps] = useState<string[]>([])
  const [internal, setInternal] = useState(defaultValue)
  const value = valueProp ?? internal ?? steps[0]
  const index = value === undefined ? -1 : steps.indexOf(value)
  const [reached, setReached] = useState(0)
  const pendingFocus = useRef<string | null>(null)

  useEffect(() => setReached((r) => Math.max(r, index)), [index])

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

  const invalidIn = (step: string) =>
    [...fieldsOf(step)].filter((name) => form.getFieldState(name, formState).invalid)

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
      const [name] = invalidIn(step)
      if (name) return show(step, name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on a new submit
  }, [formState.submitCount])

  const goTo = async (target: string) => {
    const to = steps.indexOf(target)
    if (linear && to > index) {
      for (const step of steps.slice(0, to)) {
        const names = [...fieldsOf(step)]
        if (names.length && !(await form.trigger(names))) {
          show(step, invalidIn(step)[0] ?? names[0])
          return false
        }
      }
    }
    show(target)
    return true
  }

  const stepOf = (name: string) => steps.find((step) => fields.current.get(step)?.has(name))

  const navigator: FieldNavigator = {
    reveal: (name) => {
      const step = stepOf(name)
      if (step === undefined || step === value) form.setFocus(name)
      else show(step, name)
    },
    rank: (name) => {
      const step = stepOf(name)
      if (step === undefined) return Number.MAX_SAFE_INTEGER
      return steps.indexOf(step) * 10_000 + [...fieldsOf(step)].indexOf(name)
    },
  }

  // Fill Form's slot every render, so FormErrorSummary always calls the latest steps.
  const slot = useContext(NavigatorContext)
  useEffect(() => {
    if (!slot) return
    slot.current = navigator
    return () => {
      slot.current = null
    }
  })

  const ctx: FormTabsContextValue = {
    value,
    steps,
    linear,
    reached,
    goTo,
    errorCount: (step) => invalidIn(step).length,
  }

  return (
    <RegistryContext.Provider value={registry}>
      <FormTabsContext.Provider value={ctx}>
        <Tabs value={value ?? null} onValueChange={(v) => void goTo(v as string)} {...props} />
      </FormTabsContext.Provider>
    </RegistryContext.Provider>
  )
}

/**
 * The row of tabs, or with `linear` the row of steps. Use it in place of
 * TabsList inside FormTabs so a stepper gets its own layout.
 */
export function FormTabsList({ className, ...props }: React.ComponentProps<typeof TabsList>) {
  const { linear } = useContext(FormTabsContext) ?? {}
  if (!linear) return <TabsList className={className} {...props} />
  return (
    <TabsPrimitive.List
      data-slot="form-steps"
      className={cnState('flex w-full items-start gap-2', className)}
      {...props}
    />
  )
}

/**
 * One tab, or with `linear` one step. A tab with errors shows an error icon
 * and how many fields to fix. A step shows its number, a check once done, or
 * an error icon and "N fields to fix" when left with errors; steps further
 * than the next one can't be picked until the ones before them are done.
 */
export function FormTabsTrigger({
  value,
  children,
  className,
  ...props
}: React.ComponentProps<typeof TabsTrigger> & { value: string }) {
  const ctx = useContext(FormTabsContext)
  if (!ctx) throw new Error('FormTabsTrigger must be used inside <FormTabs>')
  const errors = ctx.errorCount(value)
  const errorText = `${errors} ${errors === 1 ? 'field' : 'fields'} to fix`

  if (!ctx.linear) {
    return (
      <TabsTrigger
        value={value}
        data-invalid={errors ? '' : undefined}
        className={cnState('data-invalid:not-data-active:text-danger-text', className)}
        {...props}
      >
        {errors > 0 && <ErrorIcon aria-hidden="true" className="size-3.5" />}
        {children}
        {errors > 0 && (
          <>
            <span aria-hidden="true" className="text-xs tabular-nums">
              {errors}
            </span>
            <span className="sr-only">({errorText})</span>
          </>
        )}
      </TabsTrigger>
    )
  }

  const position = ctx.steps.indexOf(value)
  const current = value === ctx.value
  // The step being fixed already shows its errors on the fields; the marker is for steps left behind.
  const state: FormStepState = current
    ? 'current'
    : errors
      ? 'invalid'
      : position < ctx.reached
        ? 'complete'
        : 'upcoming'

  return (
    <TabsPrimitive.Tab
      value={value}
      data-slot="form-step"
      data-state={state}
      data-invalid={errors ? '' : undefined}
      aria-current={current ? 'step' : undefined}
      disabled={position > ctx.reached + 1}
      className={cnState(
        'group/step flex min-w-0 flex-1 flex-col gap-2 rounded-sm pb-1 text-left outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'data-disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {/* The progress line: filled up to the current step. */}
      <span
        aria-hidden="true"
        className={cn(
          'h-1 w-full rounded-full bg-border transition-colors',
          'group-data-[state=complete]/step:bg-primary group-data-[state=current]/step:bg-primary',
          'group-data-[state=invalid]/step:bg-danger',
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          'grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular-nums transition-colors',
          'border-field text-muted-foreground',
          'group-data-[state=current]/step:border-primary group-data-[state=current]/step:bg-primary group-data-[state=current]/step:text-primary-foreground',
          'group-data-[state=complete]/step:border-primary-soft group-data-[state=complete]/step:bg-primary-soft group-data-[state=complete]/step:text-primary-text',
          'group-data-[state=invalid]/step:border-transparent group-data-[state=invalid]/step:text-danger-text',
        )}
      >
        {state === 'complete' ? (
          <CheckIcon className="size-3.5 stroke-[2.5]" />
        ) : state === 'invalid' ? (
          <ErrorIcon className="size-5" />
        ) : (
          position + 1
        )}
      </span>
      {/* Under the marker, not beside it, so the name has the column's full width and wraps between words. */}
      <span className="flex flex-col gap-0.5">
        <span
          className={cn(
            'text-sm leading-5 text-balance text-muted-foreground',
            'group-data-[state=current]/step:font-semibold group-data-[state=current]/step:text-foreground',
            'group-data-[state=complete]/step:text-foreground',
            'group-data-[state=invalid]/step:text-danger-text',
            // On a phone only the current step keeps its name; the others keep their marker.
            'max-sm:sr-only group-data-[state=current]/step:max-sm:not-sr-only',
          )}
        >
          {children}
        </span>
        {state === 'invalid' && (
          <span className="text-xs text-danger-text max-sm:sr-only">{errorText}</span>
        )}
        {state === 'complete' && <span className="sr-only">(done)</span>}
      </span>
    </TabsPrimitive.Tab>
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
  variant = 'secondary',
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
  const { value, steps, goTo, errorCount } = ctx
  const index = value === undefined ? -1 : steps.indexOf(value)
  return {
    value,
    steps,
    index,
    isFirst: index <= 0,
    isLast: index === steps.length - 1,
    hasError: (step: string) => errorCount(step) > 0,
    errorCount,
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
