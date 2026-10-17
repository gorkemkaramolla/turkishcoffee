import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { functionalUpdate, type Updater } from '@tanstack/react-table'

/**
 * One piece of state that a parent may control. Controlled (`value` given):
 * the parent's value is the only source, and changes are only reported.
 * Uncontrolled: kept here, starting from `initial`, and reported too. Either
 * way `set` takes a value or an updater (TanStack's shape) and calls
 * `onChange` with the resolved value.
 *
 * Successive updates in one event chain off each other, not off the
 * last render — two quick TanStack updates both land. Extra arguments to
 * `set` reach `onChange` after the value (what the change was).
 */
export function useControllableState<T, A extends unknown[] = []>(
  value: T | undefined,
  initial: T | (() => T),
  onChange?: (next: T, ...args: A) => void,
): [T, (updater: Updater<T>, ...args: A) => void] {
  const [internal, setInternal] = useState(initial)
  const controlled = value !== undefined
  const current = controlled ? value : internal

  const latest = useRef(current)
  const onChangeRef = useRef(onChange)
  useLayoutEffect(() => {
    latest.current = current
    onChangeRef.current = onChange
  })

  const set = useCallback(
    (updater: Updater<T>, ...args: A) => {
      const next = functionalUpdate(updater, latest.current)
      if (Object.is(next, latest.current)) return
      latest.current = next
      if (!controlled) setInternal(next)
      onChangeRef.current?.(next, ...args)
    },
    [controlled],
  )

  return [current, set]
}
