// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Pagination, PaginationContent, PaginationItem, PaginationNext } from '../pagination/pagination'
import { Spinner } from '../spinner/spinner'
import { LocaleProvider } from './locale-provider'

// A genuine server render: no `document`, so no `<html lang>` to read.
const page = (
  <>
    <Spinner />
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </>
)

describe('LocaleProvider on the server', () => {
  it('renders the first byte in its language, server components included', () => {
    const html = renderToString(<LocaleProvider locale="tr-TR">{page}</LocaleProvider>)
    expect(html).toContain('Yükleniyor')
    expect(html).toContain('Sonraki')
  })

  it('without one, the server renders English', () => {
    const html = renderToString(page)
    expect(html).toContain('Loading')
    expect(html).toContain('Next')
  })
})
