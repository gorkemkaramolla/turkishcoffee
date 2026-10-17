import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LocaleProvider } from './locale-provider'
import { Card, CardContent, CardHeader, CardTitle } from '../card'
import { DatePicker } from '../date-picker'
import { FileUpload } from '../file-upload'
import { SearchField } from '../search-field'
import { Spinner } from '../spinner'
import { TablePagination } from '../table'

const meta = {
  title: 'Components/LocaleProvider',
  component: LocaleProvider,
  args: { locale: 'tr-TR', children: null },
} satisfies Meta<typeof LocaleProvider>

export default meta
type Story = StoryObj<typeof meta>

/** One page's worth of components. Every word in it comes from the components themselves. */
function Sample() {
  const [search, setSearch] = useState('')
  const [day, setDay] = useState<Date>()
  const [page, setPage] = useState(1)
  return (
    <div className="flex w-[34rem] flex-col gap-4">
      <SearchField value={search} onSearch={setSearch} />
      <DatePicker value={day} onChange={setDay} />
      <FileUpload onFilesAdded={() => {}} />
      <TablePagination page={page} pageSize={10} total={1374} onPageChange={setPage} />
      <Spinner />
    </div>
  )
}

/**
 * The same components under two providers. The toolbar's Language switch
 * wraps every story in one; a provider nearer the component wins.
 */
export const EnglishAndTurkish: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      {(['en-US', 'tr-TR'] as const).map((locale) => (
        <Card key={locale}>
          <CardHeader>
            <CardTitle>{locale}</CardTitle>
          </CardHeader>
          <CardContent>
            <LocaleProvider locale={locale}>
              <Sample />
            </LocaleProvider>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
}
