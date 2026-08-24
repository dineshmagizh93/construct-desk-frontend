import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface KanbanColumn {
  id: string
  label: string
  accentClassName?: string
}

interface KanbanBoardProps<T extends object> {
  columns: KanbanColumn[]
  items: T[]
  statusKey: keyof T
  keyField: keyof T
  onStatusChange: (id: string, status: string) => void
  renderCard: (item: T) => ReactNode
  renderColumnSummary?: (items: T[]) => ReactNode
}

export function KanbanBoard<T extends object>({
  columns,
  items,
  statusKey,
  keyField,
  onStatusChange,
  renderCard,
  renderColumnSummary,
}: KanbanBoardProps<T>) {
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  return (
    <div className="flex h-full min-h-96 gap-3 overflow-x-auto pb-2">
      {columns.map((col) => {
        const colItems = items.filter((item) => item[statusKey] === col.id)
        return (
          <div
            key={col.id}
            className={cn(
              'flex h-full w-[18rem] shrink-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-secondary/30 transition-all',
              dragOverCol === col.id && 'border-primary/40 bg-primary/5 ring-2 ring-primary/10',
            )}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOverCol(col.id)
            }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData('text/plain')
              if (id) onStatusChange(id, col.id)
              setDragOverCol(null)
              setDraggingId(null)
            }}
          >
            <div className="border-b border-border/70 bg-card/70 px-3.5 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn('size-2 rounded-full', col.accentClassName ?? 'bg-primary')} />
                    <span className="text-sm font-semibold">{col.label}</span>
                  </div>
                  {renderColumnSummary && (
                    <div className="mt-1 pl-4 text-xs text-muted-foreground">{renderColumnSummary(colItems)}</div>
                  )}
                </div>
                <span className="flex min-w-6 items-center justify-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {colItems.length}
                </span>
              </div>
            </div>
            <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
              {colItems.length ? (
                colItems.map((item) => {
                  const itemId = String(item[keyField])
                  return (
                    <div
                      key={itemId}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('text/plain', itemId)
                        setDraggingId(itemId)
                      }}
                      onDragEnd={() => {
                        setDraggingId(null)
                        setDragOverCol(null)
                      }}
                      className={cn(
                        'cursor-grab rounded-lg border border-border/80 bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md active:cursor-grabbing',
                        draggingId === itemId && 'opacity-40',
                      )}
                    >
                      {renderCard(item)}
                    </div>
                  )
                })
              ) : (
                <div className="flex min-h-28 flex-1 items-center justify-center rounded-lg border border-dashed border-border/80 px-4 text-center">
                  <p className="text-xs leading-5 text-muted-foreground">
                    No leads in this stage
                    <br />
                    Drag a lead here
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
