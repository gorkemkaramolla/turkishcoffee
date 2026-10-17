import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { FileUpload, FileUploadDropzone, FileUploadItem, FileUploadList, formatFileSize } from './file-upload'

const pdf = (name = 'contract.pdf', size = 1000) => new File([new Uint8Array(size)], name, { type: 'application/pdf' })
const png = (name = 'photo.png') => new File([new Uint8Array(10)], name, { type: 'image/png' })

function drop(files: File[]) {
  fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files, types: ['Files'] } })
}

describe('FileUpload', () => {
  it('passes accepted files and rejects the rest with a reason', () => {
    const onFilesAdded = vi.fn()
    const onFilesRejected = vi.fn()
    render(
      <FileUpload accept=".pdf,image/*" maxSize={2000} maxFiles={3} fileCount={1} onFilesAdded={onFilesAdded} onFilesRejected={onFilesRejected}>
        <FileUploadDropzone />
      </FileUpload>,
    )
    const big = pdf('big.pdf', 5000)
    const text = new File(['x'], 'notes.txt', { type: 'text/plain' })
    const third = pdf('third.pdf')
    act(() => drop([pdf(), png(), big, text, third]))
    expect(onFilesAdded).toHaveBeenCalledOnce()
    expect(onFilesAdded.mock.calls[0]![0].map((f: File) => f.name)).toEqual(['contract.pdf', 'photo.png'])
    expect(onFilesRejected.mock.calls[0]![0].map((r: { file: File; reason: string }) => [r.file.name, r.reason])).toEqual([
      ['big.pdf', 'size'],
      ['notes.txt', 'type'],
      ['third.pdf', 'count'],
    ])
    expect(screen.getByRole('status').textContent).toContain('2 files added')
  })

  it('takes only the first file without multiple', () => {
    const onFilesAdded = vi.fn()
    render(
      <FileUpload multiple={false} onFilesAdded={onFilesAdded}>
        <FileUploadDropzone />
      </FileUpload>,
    )
    act(() => drop([pdf('a.pdf'), pdf('b.pdf')]))
    expect(onFilesAdded.mock.calls[0]![0]).toHaveLength(1)
  })

  it('opens the picker from the keyboard and ignores everything when disabled', () => {
    const onFilesAdded = vi.fn()
    const { container, rerender } = render(
      <FileUpload onFilesAdded={onFilesAdded}>
        <FileUploadDropzone />
      </FileUpload>,
    )
    const input = container.querySelector('input[type=file]') as HTMLInputElement
    const click = vi.spyOn(input, 'click')
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(click).toHaveBeenCalledOnce()

    rerender(
      <FileUpload onFilesAdded={onFilesAdded} disabled>
        <FileUploadDropzone />
      </FileUpload>,
    )
    expect(screen.getByRole('button').getAttribute('aria-disabled')).toBe('true')
    act(() => drop([pdf()]))
    expect(onFilesAdded).not.toHaveBeenCalled()
  })

  it('shows progress, then size; an error replaces the size', () => {
    const { rerender } = render(
      <FileUploadList>
        <FileUploadItem file={pdf('a.pdf', 2048)} progress={40} onRemove={() => {}} />
      </FileUploadList>,
    )
    expect(screen.getByRole('progressbar', { name: 'Uploading a.pdf' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Remove a.pdf' })).toBeTruthy()
    rerender(
      <FileUploadList>
        <FileUploadItem file={pdf('a.pdf', 2048)} progress={100} />
      </FileUploadList>,
    )
    expect(screen.getByText('2 kB')).toBeTruthy()
    rerender(
      <FileUploadList>
        <FileUploadItem file={pdf('a.pdf', 2048)} progress={40} error="Upload failed" />
      </FileUploadList>,
    )
    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(screen.getByText('Upload failed')).toBeTruthy()
  })
})

describe('formatFileSize', () => {
  it('picks the unit', () => {
    expect(formatFileSize(512, 'en-US')).toBe('512 byte')
    expect(formatFileSize(1.5 * 1024 * 1024, 'en-US')).toBe('1.5 MB')
  })
})
