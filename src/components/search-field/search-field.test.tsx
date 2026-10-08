import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchField } from './search-field'

beforeEach(() => vi.useFakeTimers())
afterEach(() => { cleanup(); vi.useRealTimers() })
const type = (value: string) => fireEvent.change(screen.getByRole('textbox'), { target: { value } })
const advance = (ms = 300) => act(() => { vi.advanceTimersByTime(ms) })
const draft = () => (screen.getByRole('textbox') as HTMLInputElement).value

describe('SearchField', () => {
  it('debounces typing and submits only the final trimmed value', () => {
    const onSearch = vi.fn()
    render(<SearchField value="" onSearch={onSearch} label="Ara" />)
    expect(screen.getByLabelText('Ara')).toBe(screen.getByRole('textbox'))
    type(' G'); advance(200); type(' Görkem '); advance(299)
    expect(onSearch).not.toHaveBeenCalled()
    advance(1)
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Görkem')
  })

  it('submits immediately on Enter without a second debounced request', () => {
    const onSearch = vi.fn()
    render(<SearchField value="" onSearch={onSearch} />)
    type('Görkem')
    fireEvent.submit(screen.getByRole('search'))
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Görkem')
    advance()
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('clears immediately, cancels pending typing, and returns focus', () => {
    const onSearch = vi.fn()
    render(<SearchField value="old" onSearch={onSearch} clearLabel="Temizle" />)
    type('new')
    fireEvent.click(screen.getByRole('button', { name: 'Temizle' }))
    expect(draft()).toBe('')
    expect(document.activeElement).toBe(screen.getByRole('textbox'))
    advance()
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('')
  })

  it('sends a clear even when an earlier search is still awaiting acknowledgement', () => {
    const onSearch = vi.fn()
    render(<SearchField value="" onSearch={onSearch} />)
    type('new'); advance()
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onSearch.mock.calls).toEqual([['new'], ['']])
  })

  it('preserves newer typing when earlier searches arrive in sequence', () => {
    const onSearch = vi.fn()
    const { rerender } = render(<SearchField value="" onSearch={onSearch} />)
    type('a'); advance(); type('ab'); advance(); type('abc')
    rerender(<SearchField value="a" onSearch={onSearch} />)
    expect(draft()).toBe('abc')
    rerender(<SearchField value="ab" onSearch={onSearch} />)
    expect(draft()).toBe('abc')
    advance()
    expect(onSearch.mock.calls).toEqual([['a'], ['ab'], ['abc']])
  })

  it('replaces the draft on external navigation and cancels its pending request', () => {
    const onSearch = vi.fn()
    const { rerender } = render(<SearchField value="old" onSearch={onSearch} />)
    type('pending')
    rerender(<SearchField value="back" onSearch={onSearch} />)
    expect(draft()).toBe('back')
    advance()
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('shows localized loading feedback and allows typing while loading', () => {
    const onSearch = vi.fn()
    render(<SearchField value="" onSearch={onSearch} loading loadingLabel="Aranıyor" debounceMs={0} />)
    expect(screen.getByRole('status', { name: 'Aranıyor' })).toBeTruthy()
    type('new')
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('new')
  })

  it('cancels pending searches on unmount and when disabled', () => {
    const onSearch = vi.fn()
    const { rerender, unmount } = render(<SearchField value="" onSearch={onSearch} />)
    type('new')
    rerender(<SearchField value="" onSearch={onSearch} disabled />)
    advance()
    expect(onSearch).not.toHaveBeenCalled()
    rerender(<SearchField value="" onSearch={onSearch} />)
    type('other'); unmount(); advance()
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('waits for IME composition to finish before searching', () => {
    const onSearch = vi.fn()
    render(<SearchField value="" onSearch={onSearch} />)
    fireEvent.compositionStart(screen.getByRole('textbox'))
    type('日本'); advance()
    fireEvent.submit(screen.getByRole('search'))
    expect(onSearch).not.toHaveBeenCalled()
    fireEvent.compositionEnd(screen.getByRole('textbox'))
    advance()
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('日本')
  })
})
