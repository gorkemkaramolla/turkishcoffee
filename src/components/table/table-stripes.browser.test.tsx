import '../../styles/storybook.css'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './table'
import { DataTable } from '../data-table/data-table'

const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
const fill = (row: HTMLElement) => getComputedStyle(row).backgroundColor
const columns = [{ accessorKey: 'name' as const, header: 'Name' }]
const data = Array.from({ length: 60 }, (_, i) => ({ id: String(i), name: `Row ${i}` }))

afterEach(async () => { await page.getByRole('heading', { name: 'Outside' }).hover(); cleanup() })

for (const dark of [false, true]) {
  describe(`alternating rows (${dark ? 'dark' : 'light'})`, () => {
    it('stripes Table body only; hover and selection override stripes', async () => {
      const { container } = render(
        <div className={dark ? 'dark' : ''}>
          <h1>Outside</h1>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow><TableCell>Odd</TableCell></TableRow>
              <TableRow><TableCell>Even</TableCell></TableRow>
              <TableRow data-state="selected"><TableCell>Selected odd</TableCell></TableRow>
              <TableRow data-state="selected"><TableCell>Selected even</TableCell></TableRow>
            </TableBody>
            <TableFooter><TableRow><TableCell>Total</TableCell></TableRow></TableFooter>
          </Table>
        </div>,
      )
      const [odd, even, selectedOdd, selectedEven] = [...container.querySelectorAll<HTMLElement>('tbody tr')]
      expect(fill(odd!)).not.toBe(fill(even!))
      expect(fill(selectedOdd!)).toBe(fill(selectedEven!))
      for (const row of container.querySelectorAll<HTMLElement>('thead tr, tfoot tr')) {
        expect(getComputedStyle(row).getPropertyValue('--table-row-background')).toBe('')
      }
      const resting = fill(even!)
      await page.elementLocator(even!).hover()
      await new Promise((resolve) => setTimeout(resolve, 200))
      expect(fill(even!)).not.toBe(resting)
      const selection = fill(selectedEven!)
      await page.elementLocator(selectedEven!).hover()
      await new Promise((resolve) => setTimeout(resolve, 200))
      expect(fill(selectedEven!)).toBe(selection)
    })

    it('stripes flow DataTable rows and preserves selected fill', () => {
      const { container } = render(
        <div className={dark ? 'dark' : ''}><h1>Outside</h1>
          <DataTable columns={columns} data={data.slice(0, 4)} selectable
            rowSelection={{ type: 'ids', ids: ['2', '3'] }} getRowId={(row) => row.id} />
        </div>,
      )
      const rows = [...container.querySelectorAll<HTMLElement>('[role="row"][data-stripe]')]
      expect(rows.map((row) => row.dataset.stripe)).toEqual(['odd', 'even', 'odd', 'even'])
      expect(fill(rows[0]!)).not.toBe(fill(rows[1]!))
      expect(fill(rows[2]!)).toBe(fill(rows[3]!))
    })

    it('keeps virtual row colors stable when the rendered window moves', async () => {
      const { container } = render(
        <div className={dark ? 'dark' : ''}><h1>Outside</h1>
          <DataTable columns={columns} data={data} height={220} getRowId={(row) => row.id} />
        </div>,
      )
      const rows = () => [...container.querySelectorAll<HTMLElement>('[role="row"][data-stripe]')]
      const odd = fill(rows()[0]!)
      const even = fill(rows()[1]!)
      expect(odd).not.toBe(even)
      const scroller = container.querySelector<HTMLElement>('[role="rowgroup"][style*="overflow: auto"]')!
      await act(async () => { scroller.scrollTop = 1000; scroller.dispatchEvent(new Event('scroll')); await frame() })
      await frame()
      expect(Number(rows()[0]!.getAttribute('aria-rowindex'))).toBeGreaterThan(2)
      for (const row of rows()) {
        const stripe = Number(row.getAttribute('aria-rowindex')) % 2 === 0 ? 'odd' : 'even'
        expect(row.dataset.stripe).toBe(stripe)
        expect(fill(row)).toBe(stripe === 'odd' ? odd : even)
      }
    })
  })
}
