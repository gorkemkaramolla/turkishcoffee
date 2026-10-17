# FileUpload

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { fileUploadLabelsForLocale, defaultFileUploadLabels, formatFileSize, FileUpload, FileUploadDropzone, FileUploadTrigger, FileUploadList, FileUploadItem, type FileRejectionReason, type FileRejection, type FileUploadLabels, type FileUploadProps, type FileUploadDropzoneProps, type FileUploadItemProps } from 'turkishcoffee'
```

Picks files by drag-and-drop, click or keyboard and checks them against
`accept`, `maxSize` and `maxFiles`. It holds no list and uploads nothing:
`onFilesAdded` hands over the accepted `File`s, the app keeps them in state
(with any upload progress) and renders them as FileUploadItems.
Rejections go to `onFilesRejected` and are announced to screen readers.

## Example

```tsx
const [files, setFiles] = useState<File[]>([])

<FileUpload accept=".pdf,image/*" maxSize={10 * 1024 * 1024} maxFiles={5} fileCount={files.length}
  onFilesAdded={(added) => setFiles((current) => [...current, ...added])}
  onFilesRejected={(rejections) => toast.error(`${rejections.length} files were not added`)}>
  <FileUploadDropzone description="PDF or image, up to 10 MB" />
  <FileUploadList>
    {files.map((file) => (
      <FileUploadItem key={file.name} file={file}
        onRemove={() => setFiles((current) => current.filter((f) => f !== file))} />
    ))}
  </FileUploadList>
</FileUpload>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

### `FileUploadLabels`

- `title: string` — The drop zone's main line.
- `dropping: string` — The drop zone's main line while files are dragged over it.
- `added: (count: number) => string` — Announced after files are added.
- `rejected: (rejection: FileRejection) => string` — Announced (and passed nowhere else) for each rejected file.

### `FileUploadProps`

- `accept?: string` — File types to take, as in `<input accept>`: extensions, MIME types or `image/*`.
- `multiple?: boolean` — Take several files at once. Defaults to true.
- `maxSize?: number` — Largest file in bytes.
- `maxFiles?: number` — Most files to take, counting `fileCount` already held.
- `fileCount?: number` — How many files the app already holds, so `maxFiles` counts them.
- `onFilesAdded: (files: File[]) => void` — The files that passed `accept`, `maxSize` and `maxFiles`.
- `onFilesRejected?: (rejections: FileRejection[]) => void` — The files that did not, with the reason.
- `name?: string` — `name` for the hidden input, to submit files with a plain form.

### `FileUploadDropzoneProps`

- `title?: React.ReactNode` — Replaces the main line ("Drag files here or click to browse").
- `description?: React.ReactNode` — What is accepted, e.g. "PDF or image, up to 10 MB".
- `icon?: React.ReactNode` — Replaces the cloud icon.

### `FileUploadItemProps`

- `file: File | { name: string; size: number }` — The file, or just its name and size for files already on the server.
- `progress?: number` — 0–100 while uploading; leave out when there is no upload or it is done.
- `error?: React.ReactNode` — Shown in place of the size, in the danger colour, when the upload failed.
- `onRemove?: () => void` — Adds a remove button.
- `removeLabel?: string` — Accessible name of the remove button. Defaults to "Remove" followed by the file name.
- `icon?: React.ReactNode` — Replaces the file icon, e.g. with an image preview.
- `actions?: React.ReactNode` — Extra controls before the remove button, e.g. a retry or download button.

## Parts

- `type FileRejectionReason` — Why a file was turned away.
- `type FileRejection`
- `type FileUploadLabels`
- `fileUploadLabelsForLocale` — The labels in `locale`'s language.
- `defaultFileUploadLabels` — The English labels.
- `formatFileSize` — "412 KB", "1.2 MB": a file size in the units people read.
- `type FileUploadProps`
- `type FileUploadDropzoneProps`
- `FileUploadDropzone` — The drop area. Click it, or focus it and press Enter or Space, to browse; drag files onto it to add them. Pass children to replace its content.
- `FileUploadTrigger` — Opens the file picker from your own control, e.g. a Button in a toolbar. Pass `render` to use another element.

  ```tsx
  <FileUploadTrigger render={<Button variant="secondary" />}><UploadIcon />Upload</FileUploadTrigger>
  ```

- `FileUploadList` — The list of files under the drop zone.
- `type FileUploadItemProps`
- `FileUploadItem` — One file: icon, name, size or error, an optional progress bar and a remove button.
