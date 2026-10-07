import { History } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { AuditEntry } from '../api'
import { actionPhrase, describeChanges, entityName } from '../format'

const MAX_CHANGES_SHOWN = 4

function actionVariant(action: string): 'success' | 'destructive' | 'secondary' | 'outline' {
  if (action === 'create') return 'success'
  if (action === 'delete' || action === 'reject' || action.endsWith('-removed')) return 'destructive'
  if (action === 'update') return 'secondary'
  return 'outline'
}

const timeOf = (iso: string) => formatDate(iso, { hour: '2-digit', minute: '2-digit' })

/** One line of the trail: who did what to which record, and what changed. `showRecord` names the record
 * (omitted on a single record's own history, where it would only repeat the title). */
export function AuditEntryItem({ entry, showRecord = true }: { entry: AuditEntry; showRecord?: boolean }) {
  const changes = describeChanges(entry.changes)
  return (
    <li className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <History className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{entry.userName}</span> {actionPhrase(entry.action)}
          {showRecord ? (
            <>
              {' '}
              {entityName(entry.entity)}
              {entry.label ? <span className="font-medium"> “{entry.label}”</span> : null}
            </>
          ) : null}
        </p>
        {changes.length > 0 && (
          <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            {changes.slice(0, MAX_CHANGES_SHOWN).map((line) => (
              <li key={line}>{line}</li>
            ))}
            {changes.length > MAX_CHANGES_SHOWN && <li>+ {changes.length - MAX_CHANGES_SHOWN} more field{changes.length - MAX_CHANGES_SHOWN === 1 ? '' : 's'}</li>}
          </ul>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <Badge variant={actionVariant(entry.action)}>{actionPhrase(entry.action).split(' ')[0]}</Badge>
        <span className="text-xs text-muted-foreground">{timeOf(entry.createdAt)}</span>
      </div>
    </li>
  )
}
