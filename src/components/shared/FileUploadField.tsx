import { useRef, useState } from 'react'
import { UploadCloud, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { uploadFile, formatFileSize } from '@/lib/file'
import { cn } from '@/lib/utils'
import type { UploadedFile } from './types'

interface FileUploadFieldProps {
  value?: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  accept?: string
  multiple?: boolean
  folder: 'site-progress' | 'documents'
}

export function FileUploadField({ value = [], onChange, accept, multiple, folder }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const uploaded = await Promise.all(Array.from(fileList).map((file) => uploadFile(file, folder)))
      onChange(multiple ? [...value, ...uploaded] : [uploaded[0]])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (id: string) => {
    onChange(value.filter((f) => f.id !== id))
  }

  return (
    <div>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          addFiles(e.dataTransfer.files)
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-4 py-6 text-center transition-colors hover:bg-secondary/50',
          dragOver && 'border-primary bg-secondary/50',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        ) : (
          <UploadCloud className="size-6 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">{uploading ? 'Uploading…' : 'Click to upload or drag and drop'}</p>
        <p className="text-xs text-muted-foreground">{accept ? accept.split(',').join(', ') : 'Any file type'}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}

      {value.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {value.map((file) => (
            <div key={file.id} className="group relative flex items-center gap-2 rounded-md border border-border p-2">
              {file.type.startsWith('image/') ? (
                <img src={file.url} alt={file.name} className="size-9 shrink-0 rounded object-cover" />
              ) : (
                <div className="flex size-9 shrink-0 items-center justify-center rounded bg-secondary text-muted-foreground">
                  {file.type.startsWith('image/') ? <ImageIcon className="size-4" /> : <FileText className="size-4" />}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{file.name}</p>
                <p className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
