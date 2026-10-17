import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from './combobox'

const cities = ['Ankara', 'Bursa', 'İstanbul', 'İzmir']

function Cities({ onValueChange }: { onValueChange?: (value: string | null) => void }) {
  return (
    <Combobox items={cities} onValueChange={onValueChange}>
      <ComboboxInput aria-label="City" />
      <ComboboxContent>
        <ComboboxEmpty>No city matches.</ComboboxEmpty>
        <ComboboxList>
          {(city: string) => (
            <ComboboxItem key={city} value={city}>
              {city}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

describe('Combobox', () => {
  it('filters as you type and selects with a click', async () => {
    const onValueChange = vi.fn()
    render(<Cities onValueChange={onValueChange} />)
    const user = userEvent.setup()
    await user.type(screen.getByRole('combobox', { name: 'City' }), 'iz')
    const izmir = await screen.findByRole('option', { name: 'İzmir' })
    expect(screen.queryByRole('option', { name: 'Ankara' })).toBeNull()
    await user.click(izmir)
    expect(onValueChange.mock.calls[0]?.[0]).toBe('İzmir')
  })

  it('shows the empty message when nothing matches', async () => {
    render(<Cities />)
    await userEvent.setup().type(screen.getByRole('combobox'), 'zzz')
    expect(await screen.findByText('No city matches.')).toBeTruthy()
  })

  it('names the clear and open buttons', () => {
    render(
      <Combobox items={cities} defaultValue="Bursa">
        <ComboboxInput aria-label="City" clearLabel="Temizle" triggerLabel="Seçenekleri göster" />
      </Combobox>,
    )
    expect(screen.getByRole('button', { name: 'Temizle' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Seçenekleri göster' })).toBeTruthy()
  })

  it('renders chips with remove buttons in multiple mode', () => {
    render(
      <Combobox multiple items={cities} defaultValue={['Ankara', 'Bursa']}>
        <ComboboxChips>
          <ComboboxValue>
            {(values: string[]) => values.map((city) => <ComboboxChip key={city}>{city}</ComboboxChip>)}
          </ComboboxValue>
          <ComboboxChipsInput aria-label="Cities" />
        </ComboboxChips>
      </Combobox>,
    )
    expect(screen.getByRole('button', { name: 'Remove Ankara' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Remove Bursa' })).toBeTruthy()
  })
})
