import { useState } from 'react'
import { Download, Paperclip } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { UploadedFile } from '@/components/shared/types'
import { formatFileSize } from '@/lib/file'

export function FilesCell({ files, title }: { files: UploadedFile[]; title: string }) {
  const [open, setOpen] = useState(false)

  if (files.length === 0) {
    return <span className="text-xs text-muted-foreground">No files attached</span>
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:opacity-80"
      >
        <Paperclip className="size-3.5" /> {files.length} file{files.length === 1 ? '' : 's'}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{title} — Files</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-1.5 overflow-y-auto">
            {files.map((file) => (
              <a
                key={file.id}
                href={file.url}
                download={file.name}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-between gap-3 rounded-md border border-border p-2.5 text-sm hover:bg-secondary/50"
              >
                <span className="min-w-0 truncate">{file.name}</span>
                <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                  <Download className="size-3.5" />
                </span>
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
