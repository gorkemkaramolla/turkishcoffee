import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FileIcon,
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadList,
  FileUploadTrigger,
  FolderIcon,
  FolderOpenIcon,
  SearchField,
  toast,
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemLayout,
  UploadIcon,
  type FileRejection,
} from '../../src'
import { DownloadIcon, RotateIcon } from '../../src/lib/icons'
import { employees } from './data'
import { PageHeader } from './shell'

type StoredFile = { id: string; name: string; size: number; file?: File; progress?: number; error?: string }
type Folder = { id: string; name: string; children?: Folder[] }

const KB = 1024
const folders: Folder[] = [
  {
    id: 'personnel',
    name: 'Personnel files',
    children: employees.slice(0, 6).map((e) => ({ id: e.id, name: e.name })),
  },
  {
    id: 'payroll',
    name: 'Payroll',
    children: [
      { id: 'payroll-2026-10', name: 'October 2026' },
      { id: 'payroll-2026-09', name: 'September 2026' },
    ],
  },
  { id: 'policies', name: 'Policies' },
  { id: 'templates', name: 'Templates' },
]

const seed: Record<string, StoredFile[]> = {
  emp_1: [
    { id: 'f1', name: 'Employment contract.pdf', size: 412 * KB },
    { id: 'f2', name: 'ID card copy.pdf', size: 1240 * KB },
    { id: 'f3', name: 'Diploma.pdf', size: 860 * KB },
  ],
  emp_2: [{ id: 'f4', name: 'Employment contract.pdf', size: 398 * KB }],
  'payroll-2026-09': [
    { id: 'f5', name: 'Payslips September.zip', size: 8400 * KB },
    { id: 'f6', name: 'SGK declaration.xml', size: 96 * KB },
  ],
  policies: [
    { id: 'f7', name: 'Leave policy 2026.pdf', size: 220 * KB },
    { id: 'f8', name: 'Remote work.pdf', size: 140 * KB },
    { id: 'f9', name: 'Code of conduct.pdf', size: 310 * KB },
  ],
  templates: [{ id: 'f10', name: 'Offer letter.docx', size: 54 * KB }],
}

const findFolder = (list: Folder[], id: string): Folder | undefined => {
  for (const folder of list) {
    if (folder.id === id) return folder
    const inner = folder.children && findFolder(folder.children, id)
    if (inner) return inner
  }
}

const reasons: Record<FileRejection['reason'], string> = {
  type: 'is not a PDF, image or Office file',
  size: 'is over 10 MB',
  count: 'would exceed 10 files in this folder',
}

let nextId = 100

export function DocumentsPage() {
  const [open, setOpen] = useState(['personnel'])
  const [selected, setSelected] = useState(['emp_1'])
  const [store, setStore] = useState(seed)
  const [search, setSearch] = useState('')
  const folderId = selected[0] ?? 'emp_1'
  const folder = findFolder(folders, folderId)
  const files = store[folderId] ?? []
  const visible = files.filter((f) => f.name.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR')))

  // Fake uploads: progress ticks up; a file whose name starts with "fail" fails halfway.
  useEffect(() => {
    const uploading = Object.values(store).some((list) => list.some((f) => f.progress !== undefined && f.progress < 100 && !f.error))
    if (!uploading) return
    const timer = window.setInterval(() => {
      setStore((current) =>
        Object.fromEntries(
          Object.entries(current).map(([key, list]) => [
            key,
            list.map((f) => {
              if (f.progress === undefined || f.progress >= 100 || f.error) return f
              if (f.name.toLowerCase().startsWith('fail') && f.progress >= 50) return { ...f, error: 'Upload failed. Try again.' }
              return { ...f, progress: Math.min(100, f.progress + 15) }
            }),
          ]),
        ),
      )
    }, 250)
    return () => window.clearInterval(timer)
  }, [store])

  const update = (fn: (list: StoredFile[]) => StoredFile[]) => setStore((current) => ({ ...current, [folderId]: fn(current[folderId] ?? []) }))
  const add = (added: File[]) =>
    update((list) => [...list, ...added.map((file) => ({ id: String(nextId++), name: file.name, size: file.size, file, progress: 0 }))])

  const renderFolders = (list: Folder[]) =>
    list.map((f) =>
      f.children ? (
        <TreeItem key={f.id} value={f.id} itemType="branch">
          <TreeItemLayout iconBefore={open.includes(f.id) ? <FolderOpenIcon /> : <FolderIcon />} aside={<Badge>{f.children.length}</Badge>}>
            {f.name}
          </TreeItemLayout>
          <TreeGroup>{renderFolders(f.children)}</TreeGroup>
        </TreeItem>
      ) : (
        <TreeItem key={f.id} value={f.id}>
          <TreeItemLayout
            iconBefore={<FolderIcon />}
            aside={(store[f.id]?.length ?? 0) > 0 && <span className="tabular-nums">{store[f.id]!.length}</span>}
          >
            {f.name}
          </TreeItemLayout>
        </TreeItem>
      ),
    )

  return (
    <>
      <PageHeader title="Documents" description="Contracts, payslips and policies, filed by folder." />

      <div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Card className="gap-0 p-1.5 lg:sticky lg:top-20">
          <Tree
            aria-label="Folders"
            selectionMode="single"
            openItems={open}
            onOpenItemsChange={setOpen}
            selectedItems={selected}
            onSelectedItemsChange={(next) => {
              setSelected(next)
              setSearch('')
            }}
          >
            {renderFolders(folders)}
          </Tree>
        </Card>

        <Card className="gap-0 py-0">
          <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4">
            <div className="me-auto min-w-0">
              <h2 className="truncate font-semibold">{folder?.name}</h2>
              <p className="text-muted-foreground text-sm">
                {files.length === 1 ? '1 file' : `${files.length} files`}
              </p>
            </div>
            <SearchField
              value={search}
              onSearch={setSearch}
              label={`Search in ${folder?.name}`}
              hideLabel
              size="sm"
              debounceMs={100}
              placeholder="Search files"
              className="w-56"
            />
          </div>

          <FileUpload
            accept=".pdf,.docx,.xlsx,.zip,image/*"
            maxSize={10 * 1024 * KB}
            maxFiles={10}
            fileCount={files.length}
            onFilesAdded={add}
            onFilesRejected={(rejections) => rejections.forEach(({ file, reason }) => toast.error(`${file.name} ${reasons[reason]}`))}
            className="p-5"
          >
            {files.length === 0 ? (
              <EmptyState
                icon={<FileIcon />}
                title="This folder is empty"
                description="Drop files anywhere below, or upload them from your computer."
                action={
                  <FileUploadTrigger>
                    <UploadIcon />
                    Upload files
                  </FileUploadTrigger>
                }
              />
            ) : (
              <FileUploadList>
                {visible.map((f) => (
                  <FileUploadItem
                    key={f.id}
                    file={f}
                    progress={f.progress}
                    error={f.error}
                    onRemove={() => update((list) => list.filter((x) => x.id !== f.id))}
                    actions={
                      f.error ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => update((list) => list.map((x) => (x.id === f.id ? { ...x, progress: 0, error: undefined } : x)))}
                        >
                          <RotateIcon />
                          Retry
                        </Button>
                      ) : (
                        (f.progress === undefined || f.progress >= 100) && (
                          <Button variant="ghost" size="icon" className="size-control-sm" aria-label={`Download ${f.name}`}>
                            <DownloadIcon />
                          </Button>
                        )
                      )
                    }
                  />
                ))}
                {visible.length === 0 && <li className="text-muted-foreground py-6 text-center text-sm">No file matches “{search}”.</li>}
              </FileUploadList>
            )}
            <FileUploadDropzone description="PDF, Office, ZIP or image · up to 10 MB · 10 files per folder" />
          </FileUpload>
        </Card>
      </div>
    </>
  )
}
