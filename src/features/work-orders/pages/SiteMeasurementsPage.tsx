import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/features/auth/store'
import { useProjectNameMap } from '@/features/projects/hooks'
import { usePermission } from '@/lib/permissions'
import { formatDate } from '@/lib/utils'
import { useMeasurements } from '../api'
import { formatQuantity } from '../math'
import { percentMeasured, useSiteWorkOrders, type SiteWorkOrder } from '../siteView'

const today = () => new Date().toISOString().slice(0, 10)

function OrderCard({ order, projectName }: { order: SiteWorkOrder; projectName?: string }) {
  const measurements = useMeasurements(order.id)
  const me = useAuthStore((s) => s.user)
  const canRecord = usePermission('site-progress', 'edit')
  const canDeleteAny = usePermission('contracts', 'delete')
  const [itemId, setItemId] = useState<string | null>(null)
  const [date, setDate] = useState(today())
  const [qty, setQty] = useState('')
  const [notes, setNotes] = useState('')

  const record = async (id: string) => {
    if (!qty || measurements.add.isPending) return
    await measurements.add.mutateAsync({ itemId: id, date, quantity: Number(qty), notes: notes.trim() || undefined })
    setQty('')
    setNotes('')
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{order.title}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {order.vendor?.name ?? 'Subcontractor'}
          {projectName ? ` · ${projectName}` : ''}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {order.items.length === 0 && <p className="text-sm text-muted-foreground">No items on this work order yet.</p>}
        {order.items.map((item) => {
          const measured = item.measurements.reduce((sum, m) => sum + m.quantity, 0)
          const open = itemId === item.id
          return (
            <div key={item.id} className="rounded-md border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatQuantity(measured)} of {formatQuantity(item.quantity)} {item.unit ?? ''} measured
                  </p>
                </div>
                {canRecord && (
                  <Button variant={open ? 'secondary' : 'outline'} size="sm" onClick={() => setItemId(open ? null : item.id)}>
                    {open ? 'Close' : 'Record'}
                  </Button>
                )}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary" style={{ width: `${percentMeasured(item.quantity, measured)}%` }} />
              </div>

              {open && (
                <div className="mt-3 space-y-3">
                  {item.measurements.length > 0 && (
                    <ul className="max-h-32 space-y-1 overflow-y-auto text-sm">
                      {item.measurements.map((m) => (
                        <li key={m.id} className="flex items-center justify-between gap-2">
                          <span>
                            {formatDate(m.date)} — <span className="font-medium">{formatQuantity(m.quantity)} {item.unit ?? ''}</span>
                            {m.notes ? <span className="text-muted-foreground"> · {m.notes}</span> : null}
                          </span>
                          {(canDeleteAny || m.createdById === me?.id) && (
                            <Button variant="ghost" size="icon-sm" title="Remove" onClick={() => measurements.remove.mutate({ itemId: item.id, id: m.id })}>
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Date</Label>
                      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Quantity done ({item.unit ?? 'units'})</Label>
                      <Input type="number" step="any" value={qty} onChange={(e) => setQty(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Notes</Label>
                      <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Block / floor / bill ref" />
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full" onClick={() => record(item.id)} disabled={!qty || measurements.add.isPending}>
                        <Plus className="size-4" /> Record
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function SiteMeasurementsPage() {
  const { data: orders = [], isLoading } = useSiteWorkOrders()
  const projectNames = useProjectNameMap()

  return (
    <div>
      <PageHeader title="Site Measurements" description="Record the quantity of subcontractor work completed on site. Rates and payments stay with the office." />
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No active work orders to measure against.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} projectName={projectNames[order.projectId]} />
          ))}
        </div>
      )}
    </div>
  )
}
