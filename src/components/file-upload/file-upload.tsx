'use client'

import * as React from 'react'
import { cn } from '../../lib/cn'
import { inLanguage, type Language } from '../../lib/i18n'
import { CloudUploadIcon, ErrorIcon, FileIcon, XIcon } from '../../lib/icons'
import { Button } from '../button/button'
import { useLocale } from '../locale-provider/locale-provider'
import { Progress } from '../progress/progress'

/** Why a file was turned away. */
export type FileRejectionReason = 'type' | 'size' | 'count'
export type FileRejection = { file: File; reason: FileRejectionReason }

export type FileUploadLabels = {
  /** The drop zone's main line. */
  title: string
  /** The drop zone's main line while files are dragged over it. */
  dropping: string
  /** Announced after files are added. */
  added: (count: number) => string
  /** Announced (and passed nowhere else) for each rejected file. */
  rejected: (rejection: FileRejection) => string
}

const FILE_UPLOAD_LABELS: Record<Language, FileUploadLabels> = {
  en: {
    title: 'Drag files here or click to browse',
    dropping: 'Drop to add',
    added: (count) => (count === 1 ? '1 file added' : `${count} files added`),
    rejected: ({ file, reason }) =>
      reason === 'type'
        ? `${file.name} is not an accepted file type`
        : reason === 'size'
          ? `${file.name} is too large`
          : `${file.name} was not added: too many files`,
  },
  tr: {
    title: 'Dosyaları buraya sürükleyin ya da seçmek için tıklayın',
    dropping: 'Eklemek için bırakın',
    added: (count) => `${count} dosya eklendi`,
    rejected: ({ file, reason }) =>
      reason === 'type'
        ? `${file.name} kabul edilen bir dosya türü değil`
        : reason === 'size'
          ? `${file.name} çok büyük`
          : `${file.name} eklenmedi: dosya sayısı sınırı aşıldı`,
  },
}

/** The labels in `locale`'s language. */
export function fileUploadLabelsForLocale(locale: string): FileUploadLabels {
  return inLanguage(FILE_UPLOAD_LABELS, locale)
}

/** The English labels. */
export const defaultFileUploadLabels: FileUploadLabels = FILE_UPLOAD_LABELS.en

type FileUploadContextValue = {
  open: () => void
  addFiles: (files: File[]) => void
  disabled: boolean
  dragging: boolean
  setDragging: (dragging: boolean) => void
  labels: FileUploadLabels
  descriptionId: string
}

const FileUploadContext = React.createContext<FileUploadContextValue | null>(null)

function useFileUpload(part: string) {
  const context = React.useContext(FileUploadContext)
  if (!context) throw new Error(`${part} must be used inside FileUpload`)
  return context
}

/** Whether `file` matches an `accept` list such as `".pdf,image/*"`. */
function accepts(file: File, accept: string | undefined) {
  if (!accept) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) =>
      rule.startsWith('.')
        ? name.endsWith(rule)
        : rule.endsWith('/*')
          ? type.startsWith(rule.slice(0, -1))
          : type === rule,
    )
}

/** "412 KB", "1.2 MB": a file size in the units people read. */
export function formatFileSize(bytes: number, locale?: string) {
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: units[unit],
    unitDisplay: 'short',
    maximumFractionDigits: unit < 2 ? 0 : 1,
  }).format(value)
}

export type FileUploadProps = Omit<React.ComponentProps<'div'>, 'onChange'> & {
  /** File types to take, as in `<input accept>`: extensions, MIME types or `image/*`. */
  accept?: string
  /** Take several files at once. Defaults to true. */
  multiple?: boolean
  /** Largest file in bytes. */
  maxSize?: number
  /** Most files to take, counting `fileCount` already held. */
  maxFiles?: number
  /** How many files the app already holds, so `maxFiles` counts them. */
  fileCount?: number
  disabled?: boolean
  /** The files that passed `accept`, `maxSize` and `maxFiles`. */
  onFilesAdded: (files: File[]) => void
  /** The files that did not, with the reason. */
  onFilesRejected?: (rejections: FileRejection[]) => void
  /** `name` for the hidden input, to submit files with a plain form. */
  name?: string
  labels?: Partial<FileUploadLabels>
}

/**
 * Picks files by drag-and-drop, click or keyboard and checks them against
 * `accept`, `maxSize` and `maxFiles`. It holds no list and uploads nothing:
 * `onFilesAdded` hands over the accepted `File`s, the app keeps them in state
 * (with any upload progress) and renders them as FileUploadItems.
 * Rejections go to `onFilesRejected` and are announced to screen readers.
 *
 * @example
 * const [files, setFiles] = useState<File[]>([])
 *
 * <FileUpload accept=".pdf,image/*" maxSize={10 * 1024 * 1024} maxFiles={5} fileCount={files.length}
 *   onFilesAdded={(added) => setFiles((current) => [...current, ...added])}
 *   onFilesRejected={(rejections) => toast.error(`${rejections.length} files were not added`)}>
 *   <FileUploadDropzone description="PDF or image, up to 10 MB" />
 *   <FileUploadList>
 *     {files.map((file) => (
 *       <FileUploadItem key={file.name} file={file}
 *         onRemove={() => setFiles((current) => current.filter((f) => f !== file))} />
 *     ))}
 *   </FileUploadList>
 * </FileUpload>
 */
export function FileUpload({
  accept,
  multiple = true,
  maxSize,
  maxFiles,
  fileCount = 0,
  disabled = false,
  onFilesAdded,
  onFilesRejected,
  name,
  labels: labelOverrides,
  className,
  children,
  ...props
}: FileUploadProps) {
  const input = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const [announcement, setAnnouncement] = React.useState('')
  const descriptionId = React.useId()
  const locale = useLocale()
  const labels = React.useMemo(() => ({ ...fileUploadLabelsForLocale(locale), ...labelOverrides }), [locale, labelOverrides])

  const addFiles = React.useCallback(
    (incoming: File[]) => {
      if (disabled || incoming.length === 0) return
      const accepted: File[] = []
      const rejected: FileRejection[] = []
      const room = maxFiles === undefined ? Infinity : Math.max(0, maxFiles - fileCount)
      for (const file of multiple ? incoming : incoming.slice(0, 1)) {
        if (!accepts(file, accept)) rejected.push({ file, reason: 'type' })
        else if (maxSize !== undefined && file.size > maxSize) rejected.push({ file, reason: 'size' })
        else if (accepted.length >= room) rejected.push({ file, reason: 'count' })
        else accepted.push(file)
      }
      if (accepted.length) onFilesAdded(accepted)
      if (rejected.length) onFilesRejected?.(rejected)
      setAnnouncement(
        [accepted.length ? labels.added(accepted.length) : '', ...rejected.map(labels.rejected)].filter(Boolean).join('. '),
      )
    },
    [accept, disabled, fileCount, labels, maxFiles, maxSize, multiple, onFilesAdded, onFilesRejected],
  )

  const context = React.useMemo<FileUploadContextValue>(
    () => ({
      open: () => {
        if (!disabled) input.current?.click()
      },
      addFiles,
      disabled,
      dragging,
      setDragging,
      labels,
      descriptionId,
    }),
    [addFiles, disabled, dragging, labels, descriptionId],
  )

  return (
    <FileUploadContext.Provider value={context}>
      <div data-slot="file-upload" data-disabled={disabled || undefined} className={cn('flex flex-col gap-3', className)} {...props}>
        <input
          ref={input}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          onChange={(event) => {
            addFiles([...(event.target.files ?? [])])
            // Picking the same file again must fire change again.
            event.target.value = ''
          }}
        />
        {children}
        <p role="status" className="sr-only">
          {announcement}
        </p>
      </div>
    </FileUploadContext.Provider>
  )
}

export type FileUploadDropzoneProps = Omit<React.ComponentProps<'div'>, 'title'> & {
  /** Replaces the main line ("Drag files here or click to browse"). */
  title?: React.ReactNode
  /** What is accepted, e.g. "PDF or image, up to 10 MB". */
  description?: React.ReactNode
  /** Replaces the cloud icon. */
  icon?: React.ReactNode
}

/**
 * The drop area. Click it, or focus it and press Enter or Space, to browse;
 * drag files onto it to add them. Pass children to replace its content.
 */
export function FileUploadDropzone({ title, description, icon, className, children, ...props }: FileUploadDropzoneProps) {
  const { open, addFiles, disabled, dragging, setDragging, labels, descriptionId } = useFileUpload('FileUploadDropzone')
  // dragenter/dragleave fire for every child; count them to know when the pointer really left.
  const depth = React.useRef(0)

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-describedby={description ? descriptionId : undefined}
      data-slot="file-upload-dropzone"
      data-dragging={dragging || undefined}
      className={cn(
        'border-field flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center transition-colors outline-none',
        'hover:border-field-hover hover:bg-accent/50',
        'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring',
        'data-dragging:border-ring data-dragging:bg-selection',
        'aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent',
        className,
      )}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          open()
        }
      }}
      onDragEnter={(event) => {
        event.preventDefault()
        if (disabled) return
        depth.current += 1
        setDragging(true)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = disabled ? 'none' : 'copy'
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1)
        if (depth.current === 0) setDragging(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        depth.current = 0
        setDragging(false)
        addFiles([...event.dataTransfer.files])
      }}
      {...props}
    >
      {children ?? (
        <>
          <span className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full [&_svg]:size-5">
            {icon ?? <CloudUploadIcon />}
          </span>
          <span className="text-sm font-medium">{dragging ? labels.dropping : (title ?? labels.title)}</span>
          {description && (
            <span id={descriptionId} className="text-muted-foreground text-xs">
              {description}
            </span>
          )}
        </>
      )}
    </div>
  )
}

/**
 * Opens the file picker from your own control, e.g. a Button in a toolbar.
 * Pass `render` to use another element.
 *
 * @example
 * <FileUploadTrigger render={<Button variant="secondary" />}><UploadIcon />Upload</FileUploadTrigger>
 */
export function FileUploadTrigger({
  render,
  onClick,
  ...props
}: React.ComponentProps<'button'> & { render?: React.ReactElement<React.ComponentProps<'button'>> }) {
  const { open, disabled } = useFileUpload('FileUploadTrigger')
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) open()
  }
  if (render) return React.cloneElement(render, { type: 'button', disabled, ...props, onClick: handleClick })
  return <Button type="button" variant="secondary" disabled={disabled} {...props} onClick={handleClick} />
}

/** The list of files under the drop zone. */
export function FileUploadList({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul data-slot="file-upload-list" className={cn('flex flex-col gap-2 empty:hidden', className)} {...props} />
}

export type FileUploadItemProps = Omit<React.ComponentProps<'li'>, 'children'> & {
  /** The file, or just its name and size for files already on the server. */
  file: File | { name: string; size: number }
  /** 0–100 while uploading; leave out when there is no upload or it is done. */
  progress?: number
  /** Shown in place of the size, in the danger colour, when the upload failed. */
  error?: React.ReactNode
  /** Adds a remove button. */
  onRemove?: () => void
  /** Accessible name of the remove button. Defaults to "Remove" followed by the file name. */
  removeLabel?: string
  /** Replaces the file icon, e.g. with an image preview. */
  icon?: React.ReactNode
  /** Extra controls before the remove button, e.g. a retry or download button. */
  actions?: React.ReactNode
  locale?: string
}

/** One file: icon, name, size or error, an optional progress bar and a remove button. */
export function FileUploadItem({
  file,
  progress,
  error,
  onRemove,
  removeLabel,
  icon,
  actions,
  locale: localeProp,
  className,
  ...props
}: FileUploadItemProps) {
  const locale = useLocale(localeProp)
  const uploading = progress !== undefined && progress < 100 && !error
  return (
    <li
      data-slot="file-upload-item"
      data-error={error ? true : undefined}
      data-uploading={uploading || undefined}
      className={cn(
        'flex items-center gap-3 rounded-md border border-border px-3 py-2.5 text-sm',
        'data-error:border-danger/50',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-sm bg-muted text-muted-foreground [&_svg]:size-4',
          error && 'bg-danger-soft text-danger-text',
        )}
      >
        {error ? <ErrorIcon /> : (icon ?? <FileIcon />)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate font-medium">{file.name}</span>
          {uploading && <span className="text-muted-foreground shrink-0 text-xs tabular-nums">{Math.round(progress)}%</span>}
        </div>
        {uploading ? (
          <Progress value={progress} aria-label={`Uploading ${file.name}`} />
        ) : error ? (
          <span className="text-danger-text text-xs">{error}</span>
        ) : (
          <span className="text-muted-foreground text-xs tabular-nums">{formatFileSize(file.size, locale)}</span>
        )}
      </div>
      {actions}
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-control-sm shrink-0"
          aria-label={removeLabel ?? `Remove ${file.name}`}
          onClick={onRemove}
        >
          <XIcon />
        </Button>
      )}
    </li>
  )
}
