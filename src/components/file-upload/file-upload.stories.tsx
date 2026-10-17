import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../button/button'
import { toast, Toaster } from '../toast/toast'
import { RotateIcon, UploadIcon } from '../../lib/icons'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadList,
  FileUploadTrigger,
  type FileRejection,
} from './file-upload'

const meta = {
  title: 'Components/FileUpload',
  component: FileUpload,
  args: { onFilesAdded: () => {} },
  parameters: { a11y: { test: 'error' } },
} satisfies Meta<typeof FileUpload>
export default meta
type Story = StoryObj<typeof meta>

type Upload = { id: string; file: File; progress: number; error?: string }

const MB = 1024 * 1024
let nextId = 0

/** Fakes an upload: progress ticks up, and files named "fail…" fail at 60%. */
function useFakeUploads(initial: Upload[] = []) {
  const [uploads, setUploads] = useState<Upload[]>(initial)
  useEffect(() => {
    if (!uploads.some((u) => u.progress < 100 && !u.error)) return
    const timer = window.setInterval(() => {
      setUploads((current) =>
        current.map((u) => {
          if (u.progress >= 100 || u.error) return u
          if (u.file.name.startsWith('fail') && u.progress >= 60) return { ...u, error: 'Upload failed. Check your connection and retry.' }
          return { ...u, progress: Math.min(100, u.progress + 12) }
        }),
      )
    }, 250)
    return () => window.clearInterval(timer)
  }, [uploads])
  const add = (files: File[]) =>
    setUploads((current) => [...current, ...files.map((file) => ({ id: String(nextId++), file, progress: 0 }))])
  const remove = (id: string) => setUploads((current) => current.filter((u) => u.id !== id))
  const retry = (id: string) => setUploads((current) => current.map((u) => (u.id === id ? { ...u, progress: 0, error: undefined } : u)))
  return { uploads, add, remove, retry }
}

const reasons: Record<FileRejection['reason'], string> = {
  type: 'is not a PDF or image',
  size: 'is over 5 MB',
  count: 'is over the 4-file limit',
}

const signed = new File([new Uint8Array(412 * 1024)], 'Employment contract.pdf', { type: 'application/pdf' })
const failed = new File([new Uint8Array(96 * 1024)], 'fail-addendum.pdf', { type: 'application/pdf' })

/**
 * Drop or pick PDFs and images up to 5 MB, at most 4. Uploads are faked: a
 * file named "fail…" fails, then Retry works.
 */
export const Default: Story = {
  render: function Example() {
    const { uploads, add, remove, retry } = useFakeUploads([
      { id: 'a', file: signed, progress: 100 },
      { id: 'b', file: failed, progress: 60, error: 'Upload failed. Check your connection and retry.' },
    ])
    return (
      <div className="w-[28rem] max-w-full">
        <FileUpload
          accept=".pdf,image/*"
          maxSize={5 * MB}
          maxFiles={4}
          fileCount={uploads.length}
          onFilesAdded={add}
          onFilesRejected={(rejections) =>
            rejections.forEach(({ file, reason }) => toast.error(`${file.name} ${reasons[reason]}`))
          }
        >
          <FileUploadDropzone description="PDF or image, up to 5 MB each, 4 files at most" />
          <FileUploadList>
            {uploads.map((u) => (
              <FileUploadItem
                key={u.id}
                file={u.file}
                progress={u.progress}
                error={u.error}
                onRemove={() => remove(u.id)}
                actions={
                  u.error && (
                    <Button variant="ghost" size="sm" onClick={() => retry(u.id)}>
                      <RotateIcon />
                      Retry
                    </Button>
                  )
                }
              />
            ))}
          </FileUploadList>
        </FileUpload>
        <Toaster />
      </div>
    )
  },
}

/** No drop zone: a Button opens the picker, e.g. in a card header. */
export const WithTrigger: Story = {
  render: function Example() {
    const [files, setFiles] = useState<File[]>([])
    return (
      <FileUpload multiple={false} onFilesAdded={(added) => setFiles(added)} className="w-80">
        <FileUploadTrigger>
          <UploadIcon />
          Upload a photo
        </FileUploadTrigger>
        <FileUploadList>
          {files.map((file) => (
            <FileUploadItem key={file.name} file={file} onRemove={() => setFiles([])} />
          ))}
        </FileUploadList>
      </FileUpload>
    )
  },
}

/** Every label can be replaced, here in Turkish. */
export const Turkish: Story = {
  render: () => (
    <FileUpload
      className="w-[28rem] max-w-full"
      onFilesAdded={() => {}}
      labels={{
        title: 'Dosyaları buraya sürükleyin veya seçmek için tıklayın',
        dropping: 'Eklemek için bırakın',
        added: (count) => `${count} dosya eklendi`,
      }}
    >
      <FileUploadDropzone description="PDF veya görsel, en fazla 10 MB" />
      <FileUploadList>
        <FileUploadItem file={{ name: 'Kimlik fotokopisi.pdf', size: 1.2 * MB }} locale="tr-TR" removeLabel="Kaldır" onRemove={() => {}} />
      </FileUploadList>
    </FileUpload>
  ),
}

export const Disabled: Story = {
  render: () => (
    <FileUpload className="w-[28rem] max-w-full" disabled onFilesAdded={() => {}}>
      <FileUploadDropzone description="Uploads open once the contract is signed" />
    </FileUpload>
  ),
}
