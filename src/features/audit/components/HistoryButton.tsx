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

/** Whether the signed-in person may read the Activity Log (the same `users:view` the backend asks for). */
export function useCanViewHistory() {
  return usePermission('users', 'view')
}

/**
 * Everything recorded against one record: who created, edited, approved or removed what, and when. Opened from a
 * row's three-dots menu; the menu only offers it to people who can read the Activity Log, so it never fails for them.
 */
export function HistoryDialog({
  entity,
  entityId,
  title,
  open,
  onOpenChange,
}: {
  entity: string
  entityId: string
  title?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>History{title ? ` — ${title}` : ''}</DialogTitle>
          <DialogDescription>Every change recorded against this {entityName(entity)}, newest first.</DialogDescription>
        </DialogHeader>
        {open && <HistoryList entity={entity} entityId={entityId} />}
      </DialogContent>
    </Dialog>
  )
}
