import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'
import { toXlsxBlob as toXlsx } from './export'

// The real writer (it uses a Web Worker), read back from the zip it produces.

type Row = { name: string; amount: number; joined: Date; active: boolean; note: string | null }

describe('xlsx (Chromium)', () => {
  it('writes real numbers, dates and booleans under a bold, frozen header', async () => {
    const blob = await toXlsx<Row>(
      [
        { label: 'Name', value: (row) => row.name, width: 140 },
        { label: 'Amount', value: (row) => row.amount },
        { label: 'Joined', value: (row) => row.joined },
        { label: 'Active', value: (row) => row.active },
        { label: 'Note', value: (row) => row.note },
      ],
      [
        { name: 'Çağrı Işık', amount: 1234.5, joined: new Date(2026, 0, 5), active: true, note: null },
        { name: 'Şule "Ö"', amount: -3, joined: new Date(2025, 11, 31), active: false, note: '=1+1' },
      ],
      'tr',
    )
    const files = unzipSync(new Uint8Array(await blob.arrayBuffer()))
    const sheet = strFromU8(files['xl/worksheets/sheet1.xml']!)
    const styles = strFromU8(files['xl/styles.xml']!)
    const strings = files['xl/sharedStrings.xml'] ? strFromU8(files['xl/sharedStrings.xml']) : ''
    const text = sheet + strings

    for (const label of ['Name', 'Amount', 'Joined', 'Active', 'Note', 'Çağrı Işık']) expect(text).toContain(label)
    // Quotes need no escaping in element text.
    expect(text).toContain('Şule "Ö"')
    // Numbers are numbers (a <v> without a string type), booleans are booleans.
    expect(sheet).toMatch(/<v>1234\.5<\/v>/)
    expect(sheet).toMatch(/t="b"[^>]*>\s*<v>1<\/v>/)
    // Dates are serial numbers formatted with the Turkish short date.
    expect(styles).toContain('dd.mm.yyyy')
    // 2026-01-05 is serial 46027 whatever the time zone: Excel dates are wall-clock dates.
    expect(sheet).toMatch(/<v>46027<\/v>/)
    // Bold header, frozen first row.
    expect(styles).toMatch(/<b\s*\/>/)
    expect(sheet).toMatch(/ySplit="1"/)
    // A formula-looking string stays text in xlsx.
    expect(sheet).not.toContain('<f>')
  })

  it('no rows: a header-only sheet', async () => {
    const blob = await toXlsx([{ label: 'Only', value: () => null }], [])
    const files = unzipSync(new Uint8Array(await blob.arrayBuffer()))
    expect(strFromU8(files['xl/worksheets/sheet1.xml']!) + strFromU8(files['xl/sharedStrings.xml'] ?? new Uint8Array())).toContain('Only')
  })
})
