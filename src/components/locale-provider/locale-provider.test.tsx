import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { languageOf } from '../../lib/i18n'
import { DESKTOP_WIDTH, setViewport } from '../../test/viewport'
import { DataTable } from '../data-table/data-table'
import { DatePicker } from '../date-picker/date-picker'
import { SearchField } from '../search-field/search-field'
import { Spinner } from '../spinner/spinner'
import { TablePagination } from '../table/table-pagination'
import { LocaleProvider, LocaleText } from './locale-provider'

beforeEach(() => setViewport(DESKTOP_WIDTH))

afterEach(() => {
  cleanup()
  document.documentElement.removeAttribute('lang')
})

const rows = [{ id: '1', name: 'Ada' }]
const columns = [{ accessorKey: 'name', header: 'Name' }]

describe('languageOf', () => {
  it('matches the language, not the region; anything unknown is English', () => {
    expect(['tr', 'tr-TR', 'TR_tr', 'en-GB', 'de-DE', '', undefined].map(languageOf)).toEqual([
      'tr',
      'tr',
      'tr',
      'en',
      'en',
      'en',
      'en',
    ])
  })
})

describe('LocaleProvider', () => {
  it('without a provider or a page language, components speak English', () => {
    render(<SearchField value="" onSearch={() => {}} />)
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeTruthy()
  })

  it('a Turkish provider translates every component below it', () => {
    render(
      <LocaleProvider locale="tr-TR">
        <SearchField value="" onSearch={() => {}} />
        <DatePicker />
        <Spinner />
        <TablePagination page={1} pageSize={10} total={1234} onPageChange={() => {}} />
        <DataTable aria-label="Kişiler" columns={columns} data={rows} getRowId={(row) => row.id} sortable selectable />
      </LocaleProvider>,
    )
    expect(screen.getByRole('textbox', { name: 'Ara' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Tarih seçin' })).toBeTruthy()
    expect(screen.getByRole('status', { name: 'Yükleniyor' })).toBeTruthy()
    // Turkish words, Turkish numerals.
    expect(screen.getByText('1–10 / 1.234')).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Tüm satırları seç' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Satırı seç' })).toBeTruthy()
  })

  it("a component's own locale and labels win over the provider", () => {
    render(
      <LocaleProvider locale="tr-TR">
        <TablePagination page={1} pageSize={10} total={5} onPageChange={() => {}} locale="en-US" />
        <SearchField value="" onSearch={() => {}} label="Find" />
      </LocaleProvider>,
    )
    expect(screen.getByText('1–5 of 5')).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Find' })).toBeTruthy()
  })

  it('without a provider, follows <html lang> and its later changes', () => {
    document.documentElement.lang = 'tr'
    render(<LocaleText message={{ en: 'Close', tr: 'Kapat' }} />)
    expect(screen.getByText('Kapat')).toBeTruthy()

    act(() => {
      document.documentElement.lang = 'en'
    })
    return expect.poll(() => screen.queryByText('Close')).toBeTruthy()
  })
})
