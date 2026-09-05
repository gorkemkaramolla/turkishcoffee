'use client'

import { useSyncExternalStore } from 'react'
import type * as React from 'react'

export type ToastVariant = 'default' | 'destructive' | 'success'

export type ToastOptions = {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
  /** Milliseconds before auto-dismiss. */
  duration?: number
  action?: React.ReactNode
}

export type ToastRecord = ToastOptions & { id: string }

let counter = 0
let toasts: ToastRecord[] = []
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

/** Imperative API: `toast({ title: 'Saved' })` from anywhere in a client component. */
export function toast(options: ToastOptions): string {
  const id = `toast-${++counter}`
  toasts = [...toasts, { ...options, id }]
  emit()
  return id
}

toast.success = (options: Omit<ToastOptions, 'variant'>) =>
  toast({ ...options, variant: 'success' })
toast.error = (options: Omit<ToastOptions, 'variant'>) =>
  toast({ ...options, variant: 'destructive' })

export function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const empty: ToastRecord[] = []

export function useToasts(): ToastRecord[] {
  return useSyncExternalStore(
    subscribe,
    () => toasts,
    () => empty,
  )
}
