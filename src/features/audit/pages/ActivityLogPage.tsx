import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuditLog } from '../api'
import { entityName } from '../format'
import { AuditEntryItem } from '../components/AuditEntryItem'

const ALL = '__all'

// The record types that appear in the trail, for the filter.
const ENTITY_OPTIONS = [
  'Lead',
  'Client',
  'Project',
  'Task',
  'Estimate',
  'Contract',
  'Payment',
  'Expense',
  'Vendor',
  'InventoryItem',
  'Equipment',
  'LabourRecord',
  'Document',
  'SiteProgressEntry',
  'SafetyIncident',
  'PurchaseRequest',
  'WorkOrder',
  'CalendarEvent',
]

export function ActivityLogPage() {
  const [entity, setEntity] = useState(ALL)
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useAuditLog({ entity: entity === ALL ? undefined : entity })
  const entries = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div>
      <PageHeader title="Activity Log" description="Who created, changed, approved or deleted what — newest first." />

      <div className="mb-4 flex items-center gap-2">
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All record types</SelectItem>
            {ENTITY_OPTIONS.map((name) => (
              <SelectItem key={name} value={name}>
                {entityName(name).replace(/^./, (c) => c.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Nothing recorded yet — activity appears here as your team works.</p>
          ) : (
            <ul>
              {entries.map((entry) => (
                <AuditEntryItem key={entry.id} entry={entry} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load older activity'}
          </Button>
        </div>
      )}
    </div>
  )
}
