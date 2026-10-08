'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type * as React from 'react'
import { cn } from '../../lib/cn'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '../input-group/input-group'
import { Label } from '../label/label'
import { Spinner } from '../spinner/spinner'

export type SearchFieldProps = {
  /** Applied search value, e.g. from a URL. Draft text stays local until submitted. */
  value: string
  /** Receives trimmed text after a pause, or immediately on Enter and clear. */
  onSearch: (value: string) => void
  /** Typing pause in milliseconds. Defaults to 300; 0 searches immediately. */
  debounceMs?: number
  /** Shows a spinner while results are loading; typing remains available. */
  loading?: boolean
  /** Visible input label. Defaults to "Search". */
  label?: React.ReactNode
  /** Clear button text. Defaults to "Clear". */
  clearLabel?: string
  /** Accessible spinner label. Defaults to "Searching". */
  loadingLabel?: string
  id?: string
  name?: string
  placeholder?: string
  disabled?: boolean
  /** Classes on the search form; defaults to w-72. */
  className?: string
}

/**
 * A reusable search field with a label, debounce, clear button and loading
 * indicator. Enter bypasses the debounce. External value changes (e.g. browser
 * back) replace the draft; acknowledgements of submitted searches preserve
 * newer typing. Routing and fetching belong to the consuming application.
 * Renders a search form: place it outside other forms.
 *
 * @example
 * <SearchField value={search} onSearch={setSearch} placeholder="Name, email…" />
 */
export function SearchField({
  value,
  onSearch,
  debounceMs = 300,
  loading = false,
  label = 'Search',
  clearLabel = 'Clear',
  loadingLabel = 'Searching',
  id,
  name,
  placeholder,
  disabled = false,
  className,
}: SearchFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const composing = useRef(false)
  const input = useRef<HTMLInputElement>(null)
  const latestSearch = useRef(onSearch)
  const [state, setState] = useState({ seen: value, draft: value, submitted: [] as string[], reset: 0 })

  if (value !== state.seen) {
    const acknowledgement = state.submitted.indexOf(value)
    setState(acknowledgement >= 0
      ? { ...state, seen: value, submitted: state.submitted.slice(acknowledgement + 1) }
      : { seen: value, draft: value, submitted: [], reset: state.reset + 1 })
  }

  useLayoutEffect(() => { latestSearch.current = onSearch }, [onSearch])
  // External navigation cancels the old draft's request before it can fire.
  useLayoutEffect(() => { clearTimeout(timer.current) }, [state.reset, disabled])
  useEffect(() => () => clearTimeout(timer.current), [])

  function search(text: string) {
    clearTimeout(timer.current)
    const next = text.trim()
    if (next === (state.submitted.at(-1) ?? value)) return
    setState((current) => ({ ...current, submitted: [...current.submitted, next] }))
    latestSearch.current(next)
  }

  function schedule(text: string) {
    clearTimeout(timer.current)
    if (debounceMs <= 0) search(text)
    else timer.current = setTimeout(() => search(text), debounceMs)
  }

  return (
    <form role="search" data-slot="search-field" className={cn('grid w-72 gap-2', className)}
      onSubmit={(event) => {
        event.preventDefault()
        if (!disabled && !composing.current) search(state.draft)
      }}>
      <Label htmlFor={inputId}>{label}</Label>
      <InputGroup>
        <InputGroupInput ref={input} id={inputId} name={name} value={state.draft}
          placeholder={placeholder} disabled={disabled} autoComplete="off"
          onChange={(event) => {
            const text = event.target.value
            setState((current) => ({ ...current, draft: text }))
            if (!composing.current) schedule(text)
          }}
          onCompositionStart={() => { composing.current = true; clearTimeout(timer.current) }}
          onCompositionEnd={(event) => { composing.current = false; schedule(event.currentTarget.value) }} />
        {(loading || state.draft) && (
          <InputGroupAddon align="end">
            {loading && <Spinner label={loadingLabel} />}
            {state.draft && (
              <InputGroupButton type="button" disabled={disabled} onClick={() => {
                setState((current) => ({ ...current, draft: '' }))
                search('')
                input.current?.focus()
              }}>{clearLabel}</InputGroupButton>
            )}
          </InputGroupAddon>
        )}
      </InputGroup>
    </form>
  )
}
