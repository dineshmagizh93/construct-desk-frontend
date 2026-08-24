import { useEffect, useMemo, useState } from 'react'
import { Bell, CheckCheck, Trash2, CreditCard, Target, PackageX, CheckSquare, FileSignature } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatDate } from '@/lib/utils'
import { useNotifications } from '../hooks'

const TYPE_ICON = {
  info: Target,
  success: CreditCard,
  warning: PackageX,
  destructive: CheckSquare,
}

const PAGE_SIZE = 10

export function NotificationsPage() {
  const { items, markRead, markAllRead, remove } = useNotifications()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginated = useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page, pageSize])

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay on top of leads, payments, stock, and tasks that need attention."
        actions={
          <Button variant="outline" onClick={markAllRead}>
            <CheckCheck /> Mark all as read
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="New notifications will show up here." />
      ) : (
        <>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {paginated.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? FileSignature
                return (
                  <div
                    key={n.id}
                    className={cn('flex items-start gap-3 p-4', !n.read && 'bg-secondary/40')}
                    onClick={() => markRead(n.id)}
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                        n.type === 'success' && 'bg-success/15 text-success',
                        n.type === 'warning' && 'bg-warning/15 text-warning',
                        n.type === 'destructive' && 'bg-destructive/15 text-destructive',
                        n.type === 'info' && 'bg-primary/10 text-primary',
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-sm text-muted-foreground">{n.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        remove(n.id)
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>
          <Pagination page={page} pageSize={pageSize} total={items.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </>
      )}
    </div>
  )
}
