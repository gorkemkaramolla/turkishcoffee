'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type * as React from 'react'
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { useFormContext, useFormState } from 'react-hook-form'
import { cn, cnState } from '../../lib/cn'
import { inLanguage, type Language } from '../../lib/i18n'
import { NavigatorContext, RegistryContext, StepContext, type FieldNavigator, type Registry } from '../../lib/form-steps'
import { CheckIcon, ErrorIcon } from '../../lib/icons'
import { useLocale } from '../locale-provider/locale-provider'
import { Spinner } from '../spinner/spinner'
import { Button } from '../button/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs/tabs'

/** Where a step stands in a linear form. */
export type FormStepState = 'complete' | 'current' | 'upcoming' | 'invalid'

/** Localizable navigation and status text. Button children override their label. */
export type FormTabsLabels = {
  next: string
  previous: string
  validating: string
  complete: string
  errors: (count: number) => string
  position: (current: number, total: number) => string
}

const FORM_TABS_LABELS: Record<Language, FormTabsLabels> = {
  en: {
    next: 'Next',
    previous: 'Back',
    validating: 'Validating…',
    complete: 'done',
    errors: (count) => `${count} ${count === 1 ? 'field' : 'fields'} to fix`,
    position: (current, total) => `Step ${current} / ${total}`,
  },
  tr: {
    next: 'İleri',
    previous: 'Geri',
    validating: 'Doğrulanıyor…',
    complete: 'tamamlandı',
    errors: (count) => `Düzeltilecek ${count} alan`,
    position: (current, total) => `Adım ${current} / ${total}`,
  },
}

type FormTabsContextValue = {
  value: string | undefined
  steps: string[]
  linear: boolean
  /** Visitation history, independent of validation/completion. */
  reached: number
  labels: FormTabsLabels
  isNavigating: boolean
  getStepState: (step: string) => FormStepState
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
 * step's) validate, validated steps show a check, and errors remain visible on every step.
 * Editing a field clears completion for its step and subsequent steps.
 * Navigation is locked during async validation. Use labels to translate all
 * navigation/status text, and FormTabsActions to align Back and Next/Save.
 * Steps are ordered as they mount. Must be inside `<Form>` and `<form>`.
 * An unknown/removed selection falls back to the first mounted step.
 * Controlled consumers must apply onValueChange before error focus is moved.
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
 *       <FormTabsActions>
 *         <FormTabsPrevious />
 *         <FormTabsNext />
 *       </FormTabsActions>
 *     </FormTabs>
 *     <Button type="submit">Save</Button>
 *   </form>
 * </Form>
 *
 * @example <caption>Turkish navigation text</caption>
 * <FormTabs linear labels={{
 *   next: 'Devam et', previous: 'Geri', validating: 'Doğrulanıyor…',
 *   complete: 'Tamamlandı', errors: (count) => `${count} alanı düzeltin`,
 *   position: (current, total) => `Adım ${current} / ${total}`,
 * }}>…</FormTabs>
 */
export function FormTabs({
  value: valueProp,
  defaultValue,
  onValueChange,
  linear = false,
  labels: labelOverrides,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Tabs>, 'value' | 'defaultValue' | 'onValueChange'> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** A stepper: only move forwards once the steps before the target validate. */
  linear?: boolean
  labels?: Partial<FormTabsLabels>
}) {
  const form = useFormContext()
  const formState = useFormState({ control: form.control })
  const fields = useRef(new Map<string, Set<string>>())
  const [steps, setSteps] = useState<string[]>([])
  const [internal, setInternal] = useState(defaultValue)
  const requested = valueProp ?? internal
  const value = requested !== undefined && steps.includes(requested) ? requested : steps[0]
  const index = value === undefined ? -1 : steps.indexOf(value)
  const [reached, setReached] = useState(0)
  const [pendingFocus, setPendingFocus] = useState<{ step: string; name: string } | null>(null)
  const [completed, setCompleted] = useState<Set<string>>(() => new Set())
  const [isNavigating, setIsNavigating] = useState(false)
  const navigating = useRef(false)
  const revision = useRef(0)
  const mounted = useRef(true)
  const labels = { ...inLanguage(FORM_TABS_LABELS, useLocale()), ...labelOverrides }

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  // External selection changes and structural changes cancel an in-flight result.
  useEffect(() => { revision.current++ }, [value, steps])

  useEffect(() => {
    const subscription = form.watch((_values, { name }) => {
      const changed = name === undefined ? 0 : steps.findIndex((step) =>
        [...(fields.current.get(step) ?? [])].some((field) =>
          field === name || field.startsWith(`${name}.`) || name.startsWith(`${field}.`)))
      if (changed < 0) return
      revision.current++
      setCompleted((previous) => new Set([...previous].filter((step) => steps.indexOf(step) < changed)))
    })
    return () => subscription.unsubscribe()
  }, [form, steps])

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
          revision.current++
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
    setPendingFocus(focus ? { step, name: focus } : null)
    setInternal(step)
    onValueChange?.(step)
  }

  // Wait for controlled consumers to actually reveal the requested panel.
  useEffect(() => {
    if (!pendingFocus || pendingFocus.step !== value) return
    const timer = setTimeout(() => {
      form.setFocus(pendingFocus.name)
      setPendingFocus(null)
    }, 0)
    return () => clearTimeout(timer)
  }, [value, pendingFocus, form])

  // A failed submit: open the first step holding an error.
  useEffect(() => {
    if (!formState.submitCount) return
    revision.current++
    for (const step of steps) {
      const [name] = invalidIn(step)
      if (name) return show(step, name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on a new submit
  }, [formState.submitCount])

  const goTo = async (target: string) => {
    const to = steps.indexOf(target)
    if (to < 0 || navigating.current) return false
    if (target === value) return true
    if (!linear || to < index) {
      show(target)
      return true
    }
    navigating.current = true
    setIsNavigating(true)
    const attempt = revision.current
    try {
      for (const step of steps.slice(0, to)) {
        const names = [...fieldsOf(step)]
        const valid = !names.length || await form.trigger(names)
        if (!mounted.current || revision.current !== attempt) return false
        if (!valid) {
          setCompleted((previous) => new Set([...previous].filter((item) => steps.indexOf(item) < steps.indexOf(step))))
          show(step, names.find((name) => form.getFieldState(name).invalid) ?? names[0])
          return false
        }
        setCompleted((previous) => new Set([...previous, step]))
      }
      show(target)
      return true
    } finally {
      navigating.current = false
      if (mounted.current) setIsNavigating(false)
    }
  }

  const stepOf = (name: string) => steps.find((step) => fields.current.get(step)?.has(name))

  const navigator: FieldNavigator = {
    reveal: (name) => {
      revision.current++
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
    labels,
    isNavigating,
    getStepState: (step) => step === value ? 'current' : invalidIn(step).length ? 'invalid' : completed.has(step) ? 'complete' : 'upcoming',
    goTo,
    errorCount: (step) => invalidIn(step).length,
  }

  return (
    <RegistryContext.Provider value={registry}>
      <FormTabsContext.Provider value={ctx}>
        <Tabs className={cnState('min-w-0 gap-4', className)} value={value ?? null} onValueChange={(v) => void goTo(v as string)} {...props} />
      </FormTabsContext.Provider>
    </RegistryContext.Provider>
  )
}

/**
 * The row of tabs, or with `linear` the row of steps. Use it in place of
 * TabsList inside FormTabs so a stepper gets its own layout.
 */
export function FormTabsList({ className, ...props }: React.ComponentProps<typeof TabsList>) {
  const ctx = useContext(FormTabsContext)
  const viewport = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = viewport.current
    const active = container?.querySelector<HTMLElement>('[data-active]')
    if (!container || !active) return
    const bounds = container.getBoundingClientRect()
    const item = active.getBoundingClientRect()
    if (item.left < bounds.left) container.scrollLeft += item.left - bounds.left
    else if (item.right > bounds.right) container.scrollLeft += item.right - bounds.right
  }, [ctx?.value])
  return (
    <div className="min-w-0 max-w-full">
      <div ref={viewport} className="relative overflow-x-auto p-1">
        {ctx?.linear ? (
          <TabsPrimitive.List
            data-slot="form-steps"
            activateOnFocus={false}
            className={cnState('flex w-max min-w-full items-center', className)}
            {...props}
          />
        ) : <TabsList activateOnFocus={false} className={cnState('min-w-max', className)} {...props} />}
      </div>
      {ctx?.linear && (
        <p className="mt-1 text-xs text-muted-foreground sm:sr-only" role="status">
          {ctx.labels.position(Math.max(0, ctx.steps.indexOf(ctx.value ?? '') + 1), ctx.steps.length)}
        </p>
      )}
    </div>
  )
}

/**
 * A section tab or numbered step. Errors stay visible on the current step.
 * Completed steps have passed validation; editing a field clears completion
 * for that step and every later one. Arrow keys move focus; Enter/Space selects.
 */
export function FormTabsTrigger({
  value,
  children,
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof TabsTrigger> & { value: string }) {
  const ctx = useContext(FormTabsContext)
  if (!ctx) throw new Error('FormTabsTrigger must be used inside <FormTabs>')
  const errors = ctx.errorCount(value)
  const errorText = ctx.labels.errors(errors)

  if (!ctx.linear) {
    return (
      <TabsTrigger
        value={value}
        data-invalid={errors ? '' : undefined}
        className={cnState('shrink-0 data-invalid:not-data-active:text-danger-text', className)}
        {...props}
        disabled={disabled || ctx.isNavigating}
      >
        {errors > 0 && <ErrorIcon aria-hidden="true" className="size-3.5" />}
        {children}
        {errors > 0 && <><span aria-hidden="true" className="text-xs tabular-nums">{errors}</span><span className="sr-only">({errorText})</span></>}
      </TabsTrigger>
    )
  }

  const position = ctx.steps.indexOf(value)
  const current = value === ctx.value
  const state = ctx.getStepState(value)
  return (
    <TabsPrimitive.Tab
      value={value}
      data-slot="form-step"
      data-state={state}
      data-invalid={errors ? '' : undefined}
      aria-current={current ? 'step' : undefined}
      className={cnState(
        'group/step flex min-h-control shrink-0 flex-1 items-center gap-2 rounded-sm px-1 text-left outline-none',
        'after:mx-2 after:h-px after:min-w-4 after:flex-1 after:bg-border last:after:hidden',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
      disabled={disabled || ctx.isNavigating || position > ctx.reached + 1}
    >
      <span aria-hidden="true" className={cn(
        'grid size-6 shrink-0 place-items-center rounded-md border border-field text-xs font-semibold tabular-nums text-muted-foreground',
        'group-data-[state=current]/step:border-primary group-data-[state=current]/step:bg-primary group-data-[state=current]/step:text-primary-foreground',
        'group-data-[state=complete]/step:border-border group-data-[state=complete]/step:bg-selection group-data-[state=complete]/step:text-foreground',
      )}>
        {state === 'complete' ? <CheckIcon className="size-3.5" /> : position + 1}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className={cn(
          'whitespace-nowrap text-sm text-muted-foreground',
          'group-data-[state=current]/step:font-semibold group-data-[state=current]/step:text-foreground',
          'group-data-[state=complete]/step:text-foreground',
        )}>{children}</span>
        {errors > 0 && <span className="flex items-center gap-1 text-xs text-danger-text"><ErrorIcon aria-hidden="true" className="size-3.5" />{errorText}</span>}
        {state === 'complete' && <span className="sr-only">({ctx.labels.complete})</span>}
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

/**
 * Optional action row with a hairline divider. Previous sits left; remaining
 * actions sit right. Supply the submit button yourself; no saving is performed.
 * @example
 * <FormTabsActions>
 *   <FormTabsPrevious />
 *   <FormTabsNext />
 *   {isLast && <Button type="submit">Save</Button>}
 * </FormTabsActions>
 */
export function FormTabsActions({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="form-tabs-actions" className={cn('flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4 [&>[data-slot=form-tabs-previous]]:mr-auto', className)} {...props} />
}

/** Goes forwards, validating in linear mode. Busy navigation cannot be overridden by disabled={false}. */
export function FormTabsNext({ children, disabled, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { next, isLast, isNavigating } = useFormTabs()
  const { labels } = useContext(FormTabsContext)!
  if (isLast) return null
  return (
    <Button type="button" {...props} disabled={disabled || isNavigating} aria-busy={isNavigating || undefined}
      onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) void next() }}>
      {isNavigating && <Spinner className="size-4" label={null} />}
      {children ?? (isNavigating ? labels.validating : labels.next)}
    </Button>
  )
}

/** Goes backwards without validation. Renders nothing on the first step. */
export function FormTabsPrevious({ children, variant = 'secondary', disabled, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { previous, isFirst, isNavigating } = useFormTabs()
  const { labels } = useContext(FormTabsContext)!
  if (isFirst) return null
  return (
    <Button type="button" variant={variant} data-slot="form-tabs-previous" {...props} disabled={disabled || isNavigating}
      onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) previous() }}>
      {children ?? labels.previous}
    </Button>
  )
}

/**
 * The current step and navigation, for custom controls (e.g. show the submit
 * button only when `isLast`). isNavigating locks custom controls during validation.
 * getStepState reports current/invalid/complete/upcoming; use hasError separately
 * for the active step. goTo returns false for unknown targets or cancelled/blocked
 * navigation. Must be called inside FormTabs.
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
    isNavigating: ctx.isNavigating,
    getStepState: ctx.getStepState,
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
