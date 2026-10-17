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
          <Table striped>
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
          <DataTable columns={columns} data={data.slice(0, 4)} striped
            selectable={{ value: { type: 'ids', ids: ['2', '3'] } }} getRowId={(row) => row.id} />
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
          <DataTable columns={columns} data={data} height={220} getRowId={(row) => row.id} striped />
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

    it('body rows part with a fainter line than the header, in Table and DataTable alike', () => {
      const { container } = render(
        <div className={dark ? 'dark' : ''}><h1>Outside</h1>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader>
            <TableBody><TableRow><TableCell>One</TableCell></TableRow><TableRow><TableCell>Two</TableCell></TableRow></TableBody>
          </Table>
          <DataTable aria-label="Grid" columns={columns} data={data.slice(0, 3)} getRowId={(row) => row.id} />
        </div>,
      )
      const line = (selector: string) => getComputedStyle(container.querySelector(selector)!).borderBottomColor
      expect(line('tbody tr')).not.toBe(line('thead tr'))
      expect(line('[role="grid"] [role="row"][data-stripe]')).toBe(line('tbody tr'))
      expect(line('[role="grid"] [role="row"][aria-rowindex="1"]')).toBe(line('thead tr'))
    })

    it('rows are plain unless striped; selection is grey unless primary', () => {
      const { container } = render(
        <div className={dark ? 'dark' : ''}><h1>Outside</h1>
          {(['neutral', 'primary'] as const).map((selectionColor) => (
            <DataTable key={selectionColor} aria-label={selectionColor} columns={columns} data={data.slice(0, 3)}
              selectable={{ color: selectionColor, value: { type: 'ids', ids: ['2'] } }} getRowId={(row) => row.id} />
          ))}
        </div>,
      )
      const [neutral, primary] = [...container.querySelectorAll<HTMLElement>('[role="grid"]')].map((grid) => [
        ...grid.querySelectorAll<HTMLElement>('[role="row"][data-stripe]'),
      ])
      expect(fill(neutral![0]!)).toBe(fill(neutral![1]!))
      expect(fill(neutral![2]!)).not.toBe(fill(neutral![0]!))
      expect(fill(primary![2]!)).not.toBe(fill(neutral![2]!))
    })
  })
}
