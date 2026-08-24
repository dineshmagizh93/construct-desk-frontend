import { useState } from 'react'
import { Camera } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { UploadedFile } from '@/components/shared/types'

export function PhotosCell({ photos, title }: { photos: UploadedFile[]; title: string }) {
  const [open, setOpen] = useState(false)

  if (photos.length === 0) {
    return <span className="text-xs text-muted-foreground">No photos</span>
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        className="flex items-center gap-1.5 hover:opacity-80"
      >
        <div className="flex -space-x-2">
          {photos.slice(0, 3).map((photo) => (
            <img key={photo.id} src={photo.url} alt="" className="size-7 rounded-full border-2 border-card object-cover" />
          ))}
        </div>
        {photos.length > 3 && <span className="text-xs text-muted-foreground">+{photos.length - 3}</span>}
        {photos.length <= 3 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Camera className="size-3" /> {photos.length}
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title} — Site Photos</DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {photos.map((photo) => (
              <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border border-border">
                <img src={photo.url} alt={photo.name} className="aspect-square w-full object-cover" />
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
