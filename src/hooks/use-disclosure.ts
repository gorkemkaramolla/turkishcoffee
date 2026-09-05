'use client'

import { useCallback, useState } from 'react'

export type Disclosure = {
  open: boolean
  setOpen: (open: boolean) => void
  onOpen: () => void
  onClose: () => void
  onToggle: () => void
}

/** Open/close state for dialogs, sheets and popovers. */
export function useDisclosure(defaultOpen = false): Disclosure {
  const [open, setOpen] = useState(defaultOpen)
  return {
    open,
    setOpen,
    onOpen: useCallback(() => setOpen(true), []),
    onClose: useCallback(() => setOpen(false), []),
    onToggle: useCallback(() => setOpen((v) => !v), []),
  }
}
