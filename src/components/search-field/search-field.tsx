'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type * as React from 'react'
import { cn } from '../../lib/cn'
import { inLanguage } from '../../lib/i18n'
import { MESSAGES } from '../../lib/messages'
import { useLocale } from '../locale-provider/locale-provider'
import { SearchIcon } from '../../lib/icons'
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
  /** Input label. Defaults to "Search" in the page's language (see LocaleProvider). */
  label?: React.ReactNode
  /**
   * Keeps the label for screen readers but hides it, for toolbars and top bars
   * where the search icon and placeholder already say what the field is.
   */
  hideLabel?: boolean
  /**
   * Height, to match the controls beside it: `sm` (32px) among CommandButtons
   * and other 32px controls, `md` (36px, default) beside Buttons, as in
   * DataTable's toolbar.
   */
  size?: 'sm' | 'md'
  /** Clear button text. Defaults to "Clear" in the page's language. */
  clearLabel?: string
  /** Accessible spinner label. Defaults to "Searching" in the page's language. */
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
 * Renders a search form: place it outside other forms. In a toolbar, pass
 * `hideLabel` and match the height of the controls beside it: `size="sm"`
 * among 32px CommandButtons, the default `md` in DataTable's toolbar, whose
 * Columns and Export buttons are 36px.
 *
 * @example
 * <SearchField value={search} onSearch={setSearch} placeholder="Name, email…" />
 *
 * <SearchField value={search} onSearch={setSearch} hideLabel size="sm" label="Search people" />
 */
export function SearchField({
  value,
  onSearch,
  debounceMs = 300,
  loading = false,
  label: labelProp,
  hideLabel = false,
  size = 'md',
  clearLabel: clearLabelProp,
  loadingLabel: loadingLabelProp,
  id,
  name,
  placeholder,
  disabled = false,
  className,
}: SearchFieldProps) {
  const locale = useLocale()
  const label = labelProp ?? inLanguage(MESSAGES.search, locale)
  const clearLabel = clearLabelProp ?? inLanguage(MESSAGES.clear, locale)
  const loadingLabel = loadingLabelProp ?? inLanguage(MESSAGES.searching, locale)
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
    <form role="search" data-slot="search-field" data-size={size}
      className={cn('grid w-72', hideLabel ? 'gap-0' : 'gap-2', className)}
      onSubmit={(event) => {
        event.preventDefault()
        if (!disabled && !composing.current) search(state.draft)
      }}>
      <Label htmlFor={inputId} className={cn(hideLabel && 'sr-only')}>{label}</Label>
      <InputGroup>
        <InputGroupAddon><SearchIcon /></InputGroupAddon>
        <InputGroupInput ref={input} id={inputId} name={name} value={state.draft}
          className={cn('ps-2', size === 'sm' && 'h-control-sm')}
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
              <InputGroupButton type="button" disabled={disabled} className={cn(size === 'sm' && 'h-6')} onClick={() => {
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
