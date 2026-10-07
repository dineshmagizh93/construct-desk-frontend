import { useState } from 'react'
import { History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { usePermission } from '@/lib/permissions'
import { useAuditLog } from '../api'
import { entityName } from '../format'
import { AuditEntryItem } from './AuditEntryItem'

function HistoryList({ entity, entityId }: { entity: string; entityId: string }) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useAuditLog({ entity, entityId })
  const entries = data?.pages.flatMap((page) => page.items) ?? []

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    )
  }
  if (entries.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No changes recorded for this {entityName(entity)} yet.</p>
  }
  return (
    <div>
      <ul className="-mx-4 max-h-[60vh] overflow-y-auto">
        {entries.map((entry) => (
          <AuditEntryItem key={entry.id} entry={entry} showRecord={false} />
        ))}
      </ul>
      {hasNextPage && (
        <div className="mt-3 flex justify-center">
          <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load older history'}
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * A small History button for a record: opens everything recorded against it — who created, edited,
 * approved or removed what, and when. Shown only to people who can read the Activity Log (the same
 * `users:view` permission the backend asks for), so it never appears as a button that would fail.
 */
export function HistoryButton({ entity, entityId, title }: { entity: string; entityId: string; title?: string }) {
  const canView = usePermission('users', 'view')
  const [open, setOpen] = useState(false)
  if (!canView) return null

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`View history of this ${entityName(entity)}`}
        title="History"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <History className="size-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>History{title ? ` — ${title}` : ''}</DialogTitle>
            <DialogDescription>Every change recorded against this {entityName(entity)}, newest first.</DialogDescription>
          </DialogHeader>
          {open && <HistoryList entity={entity} entityId={entityId} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
