// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { DataTable } from './data-table'
import type { DataTableColumn } from './features'

// A genuine server render: no `document`, `window` or ResizeObserver.
type Row = { id: string; name: string }
const columns: DataTableColumn<Row>[] = [{ accessorKey: 'name', header: 'Name' }]
const data: Row[] = Array.from({ length: 10 }, (_, i) => ({ id: String(i), name: `Row ${i}` }))

const html = (locale?: string) =>
  renderToString(
    <DataTable aria-label="Rows" columns={columns} data={data} server={{ rowCount: 1234 }} pageSize={10}
      sortable resizable reorderable hideable filterable exportable locale={locale} />,
  )

describe('server rendering', () => {
  it('renders without a DOM', () => {
    expect(typeof document).toBe('undefined')
    const markup = html()
    expect(markup).toContain('role="grid"')
    expect(markup).toContain('Row 9')
  })

  it('uses the explicit locale, en-US by default, so server and browser agree', () => {
    expect(html()).toContain('1,234')
    expect(html('en-US')).toBe(html())
    expect(html('tr-TR')).toContain('1.234')
  })
})
