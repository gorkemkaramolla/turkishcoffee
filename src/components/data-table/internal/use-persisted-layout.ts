import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import {
  functionalUpdate,
  type ColumnOrderState,
  type ColumnSizingState,
  type ColumnVisibilityState,
  type Updater,
} from '@tanstack/react-table'

/** The part of a DataTable's state the user shapes by hand. */
export type DataTableLayout = {
  columnSizing: ColumnSizingState
  /** Last measured content widths; a cache, never a manual resize. */
  columnAutoSizing?: ColumnSizingState
  columnOrder: ColumnOrderState
  columnVisibility: ColumnVisibilityState
}

/**
 * What is stored: the layout, a format version, and the column ids it was
 * made for — so a later version can tell renamed columns from new ones.
 */
type StoredLayout = DataTableLayout & { v: 2; columns: string[] }

const PREFIX = 'turkishcoffee:data-table:'

/**
 * The layout state, and where a saved copy comes from:
 *
 * - `saved` (not undefined): a layout the app kept itself — typically in a
 *   cookie, read on the server. It is there on the server render, so the page
 *   arrives already in the user's layout. `localStorage` is not touched.
 * - Otherwise `localStorage` under `storageKey`, read through
 *   `useSyncExternalStore`. The server can't see it: the server render and
 *   hydration use the defaults and the saved layout arrives right after
 *   (never a hydration mismatch, but a visible jump on server-rendered pages).
 *   Storage that throws (private mode, blocked site data) just means the
 *   layout lasts for the session.
 *
 * `onChange` gets the whole layout after every edit, and null after a reset.
 *
 * Column definitions change between releases, so every layout — stored,
 * edited or initial — is reconciled with the current `columnIds`: entries for
 * columns that no longer exist are dropped, and columns added since the layout
 * was saved take their place from the definitions instead of piling up at the
 * end. Layouts saved before versioning (no `v`) are read the same way.
 */
export function usePersistedLayout(
  storageKey: string | undefined,
  initial: Partial<DataTableLayout> | undefined,
  columnIds: readonly string[],
  saved?: Partial<DataTableLayout> | null,
  onChange?: (layout: DataTableLayout | null) => void,
) {
  const [defaults] = useState<DataTableLayout>(() => ({
    columnSizing: initial?.columnSizing ?? {},
    columnOrder: initial?.columnOrder ?? [],
    columnVisibility: initial?.columnVisibility ?? {},
  }))
  const external = saved !== undefined
  const key = storageKey && !external ? PREFIX + storageKey : undefined
  const idsKey = columnIds.join('\u0000')

  const raw = useSyncExternalStore(
    subscribe,
    () => (key ? readRaw(key) : null),
    () => null,
  )
  const stored = useMemo(() => (external ? sanitizeLayout(saved) : parseLayout(raw)), [external, saved, raw])

  // A storage-key change starts a separate layout session.
  const sessionKey = storageKey ?? ''
  const [session, setSession] = useState<{ key: string; edited: DataTableLayout | null }>({ key: sessionKey, edited: null })
  const edited = session.key === sessionKey ? session.edited : null
  const layout = useMemo(() => {
    const ids = idsKey ? idsKey.split('\u0000') : []
    return reconcileLayout(edited ?? stored ?? defaults, ids)
  }, [edited, stored, defaults, idsKey])
  const latest = useRef(layout)
  const onChangeRef = useRef(onChange)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<{ layout: DataTableLayout; key: string | undefined; ids: string[] } | null>(null)
  const cancel = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = null
    pending.current = null
  }, [])
  const flush = useCallback(() => {
    const next = pending.current
    cancel()
    if (!next) return
    if (next.key) {
      try {
        const value: StoredLayout = { v: 2, columns: next.ids, ...next.layout }
        localStorage.setItem(next.key, JSON.stringify(value))
      } catch { /* Storage unavailable: the in-memory layout remains usable. */ }
    }
    onChangeRef.current?.(next.layout)
  }, [cancel])
  const previousKey = useRef(sessionKey)
  useLayoutEffect(() => {
    if (previousKey.current !== sessionKey) {
      cancel()
      previousKey.current = sessionKey
    }
    latest.current = layout
    onChangeRef.current = onChange
  }, [layout, onChange, sessionKey, cancel])
  useEffect(() => {
    const events = ['pagehide', 'pointerup', 'mouseup', 'touchend', 'keyup'] as const
    events.forEach((event) => window.addEventListener(event, flush))
    return () => {
      events.forEach((event) => window.removeEventListener(event, flush))
      flush()
    }
  }, [flush])
  const update = useCallback(
    <K extends keyof DataTableLayout>(slice: K, updater: Updater<DataTableLayout[K]>) => {
      const current = latest.current
      const next = { ...current, [slice]: functionalUpdate(updater, current[slice]) }
      latest.current = next
      setSession({ key: sessionKey, edited: next })
      if (timer.current !== null) clearTimeout(timer.current)
      pending.current = { layout: next, key, ids: idsKey ? idsKey.split('\u0000') : [] }
      timer.current = setTimeout(flush, 200)
    }, [sessionKey, key, idsKey, flush],
  )
  const reset = useCallback(() => {
    cancel()
    latest.current = defaults
    setSession({ key: sessionKey, edited: defaults })
    if (key) {
      try { localStorage.removeItem(key) } catch { /* unavailable */ }
    }
    onChangeRef.current?.(null)
  }, [defaults, sessionKey, key, cancel])

  return { layout, defaults, update, reset, flush }

}

/**
 * Fits a layout to the columns that exist now. A column the order doesn't
 * name — added since it was saved, or never ordered — goes right after the
 * column that precedes it in the definitions.
 */
export function reconcileLayout(layout: DataTableLayout, columnIds: readonly string[]): DataTableLayout {
  const known = new Set(columnIds)
  const pick = <T,>(record: Record<string, T>): Record<string, T> =>
    Object.fromEntries(Object.entries(record).filter(([id]) => known.has(id)))

  const order = layout.columnOrder.filter((id) => known.has(id))
  if (order.length) {
    const placed = new Set(order)
    columnIds.forEach((id, index) => {
      if (placed.has(id)) return
      const before = columnIds
        .slice(0, index)
        .reverse()
        .find((candidate) => placed.has(candidate))
      order.splice(before === undefined ? 0 : order.indexOf(before) + 1, 0, id)
      placed.add(id)
    })
  }
  return {
    ...(layout.columnAutoSizing ? { columnAutoSizing: pick(layout.columnAutoSizing) } : {}),
    columnSizing: pick(layout.columnSizing),
    columnVisibility: pick(layout.columnVisibility),
    columnOrder: order,
  }
}

function subscribe(onChange: () => void) {
  // Other tabs editing the same table.
  window.addEventListener('storage', onChange)
  return () => window.removeEventListener('storage', onChange)
}

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function parseLayout(raw: string | null): DataTableLayout | null {
  if (!raw) return null
  try {
    // v1 (no `v`) and v2 share the layout fields.
    return sanitizeLayout(JSON.parse(raw))
  } catch {
    return null
  }
}

/** Keeps only well-formed fields: a saved layout comes from the browser (a cookie, storage) and can't be trusted. */
function sanitizeLayout(value: unknown): DataTableLayout | null {
  if (!isRecord(value)) return null
  return {
    ...(isRecord(value.columnAutoSizing) ? { columnAutoSizing: onlyNumbers(value.columnAutoSizing) } : {}),
    columnSizing: isRecord(value.columnSizing) ? onlyNumbers(value.columnSizing) : {},
    columnOrder: Array.isArray(value.columnOrder) ? [...new Set(value.columnOrder.filter((id) => typeof id === 'string'))] : [],
    columnVisibility: isRecord(value.columnVisibility) ? onlyBooleans(value.columnVisibility) : {},
  }
}

function onlyNumbers(record: Record<string, unknown>): ColumnSizingState {
  return Object.fromEntries(
    Object.entries(record).filter(([, width]) => typeof width === 'number' && Number.isFinite(width) && width > 0),
  ) as ColumnSizingState
}

function onlyBooleans(record: Record<string, unknown>): ColumnVisibilityState {
  return Object.fromEntries(
    Object.entries(record).filter(([, visible]) => typeof visible === 'boolean'),
  ) as ColumnVisibilityState
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
