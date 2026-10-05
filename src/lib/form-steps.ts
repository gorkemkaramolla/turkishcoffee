import { createContext, useContext, useEffect } from 'react'

/**
 * How FormFields tell the FormTabs around them which step they sit in. Kept
 * out of the form component folder so it stays internal: form.tsx calls
 * useStepField, form-tabs.tsx provides the contexts.
 */
export type Registry = {
  registerStep: (step: string) => () => void
  registerField: (step: string, name: string) => () => void
}

export const RegistryContext = createContext<Registry | null>(null)
export const StepContext = createContext<string | null>(null)

/** Ties a FormField to the FormTabsContent around it. No-op outside FormTabs. */
export function useStepField(name: string) {
  const registry = useContext(RegistryContext)
  const step = useContext(StepContext)
  useEffect(() => {
    if (registry && step !== null) return registry.registerField(step, name)
  }, [registry, step, name])
}
