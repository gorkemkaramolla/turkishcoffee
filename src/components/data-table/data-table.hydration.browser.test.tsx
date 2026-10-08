import '../../styles/storybook.css'
import { act } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { DataTable } from './data-table'
import type { DataTableColumn } from './features'
import type { DataTableLayout } from './internal/use-persisted-layout'

// A server-rendered page shows the server's HTML until hydration. Column
// widths fitted to the content are measured only then; the server's estimate
// must be close enough that nothing visibly jumps.

type Person = { id: string; name: string; number: string; email: string; phone: string | null; active: boolean }

const people: Person[] = [
  ['Görkem Karamolla', '120391230931', 'gorkemkaramolla@torunavm.com', '5395455259'],
  ['Görkem Karamolla', '120391230912', 'admin@torunavm.com', '5395455259'],
  ['Görkem Karamolla', '2020202204386294', 'gorkemkaramolla@gmail.com', '+905395455259'],
  ['testamacli testamli', '12312312312', 'gorkemkaramolla@torunavm.com', null],
  ['Sistem Yöneticisi', '', 'admin@torunavm.com', null],
].map(([name, number, email, phone], i) => ({ id: String(i), name: name!, number: number!, email: email!, phone: phone ?? null, active: true }))

const columns: Array<DataTableColumn<Person>> = [
  { accessorKey: 'name', header: 'Ad Soyad' },
  { accessorKey: 'number', header: 'Personel No' },
  { accessorKey: 'email', header: 'E-posta' },
  { accessorKey: 'phone', header: 'Telefon', cell: ({ getValue }) => getValue<string | null>() ?? '—' },
  { accessorKey: 'active', header: 'Durum', cell: () => 'Aktif' },
  { id: 'actions', header: '', size: 96, enableSorting: false, cell: () => '…' },
]

const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
const widths = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>('[role="columnheader"]')].map((header) => Math.round(header.getBoundingClientRect().width))

let container: HTMLElement | null = null
afterEach(() => container?.remove())

describe('hydration (Chromium)', () => {
  for (const width of [700, 1300]) {
    it(`the server's column widths are within a few pixels of the fitted ones (${width}px wide)`, async () => {
      const element = (
        <DataTable aria-label="Records" columns={columns} data={people} getRowId={(row) => row.id} selectable sortable resizable hideable reorderable />
      )
      container = document.createElement('div')
      container.style.width = `${width}px`
      document.body.append(container)
      container.innerHTML = renderToString(element)
      await frame()
      const server = widths(container)

      await act(async () => {
        hydrateRoot(container!, element)
      })
      await frame()
      await frame()
      const fitted = widths(container)

      const jumps = fitted.map((fit, index) => Math.abs(fit - server[index]!))
      expect(Math.max(...jumps), `server ${server} → fitted ${fitted}`).toBeLessThanOrEqual(16)
    })
  }
})

// A refresh has the preceding mount's cookie. Its first paint must use the
// same natural proportions, including manually resized automatic columns.
describe('saved content widths (Chromium)', () => {
  for (const width of [700, 1300]) {
    it(`keeps column boundaries unchanged across a refresh at ${width}px`, async () => {
      let saved: DataTableLayout | null = null
      container = document.createElement('div')
      container.style.width = `${width}px`
      document.body.append(container)
      const element = (layout: DataTableLayout | null) => (
        <DataTable aria-label="Records" columns={columns} data={people} getRowId={(row) => row.id}
          selectable resizable hideable reorderable savedLayout={layout}
          onLayoutChange={(layout) => { saved = layout }} />
      )
      const firstRoot = createRoot(container)
      await act(async () => { firstRoot.render(element(null)) })
      await frame()
      await act(async () => { await new Promise((resolve) => setTimeout(resolve, 220)) })
      expect((saved as DataTableLayout | null)?.columnAutoSizing).toBeDefined()
      await act(async () => { firstRoot.unmount() })

      // A manual resize must also stretch identically before and after hydration.
      const layout = { ...saved!, columnSizing: { name: 240 } }
      const refreshed = element(layout)
      container.innerHTML = renderToString(refreshed)
      await frame()
      const server = widths(container)
      const root = hydrateRoot(container, refreshed)
      await act(async () => { await frame() })
      await frame()
      const fitted = widths(container)
      // The server stretches by flex-grow, the client by computed px: the same
      // proportions, but sub-pixel layout may round a column the other way.
      const drift = fitted.map((fit, index) => Math.abs(fit - server[index]!))
      expect(Math.max(...drift), `server ${server} → fitted ${fitted}`).toBeLessThanOrEqual(1)
      await act(async () => { root.unmount() })
    })
  }
})
