import { UserRound } from 'lucide-react'
import { KanbanBoard, type KanbanColumn } from '@/components/shared/KanbanBoard'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { dueLabel } from '../dueLabel'
import type { Task } from '../types'

export const TASK_BOARD_COLUMNS: KanbanColumn[] = [
  { id: 'todo', label: 'To Do', accentClassName: 'bg-muted-foreground' },
  { id: 'in_progress', label: 'In Progress', accentClassName: 'bg-warning' },
  { id: 'done', label: 'Done', accentClassName: 'bg-success' },
]

const PRIORITY_VARIANT = { high: 'destructive', medium: 'warning', low: 'secondary' } as const

type BoardTask = Task & { projectName: string; assigneeName: string }

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

interface TasksBoardProps {
  tasks: BoardTask[]
  onStatusChange: (id: string, status: Task['status']) => void
}

/** To Do / In Progress / Done: drag a card across to change its status. */
export function TasksBoard({ tasks, onStatusChange }: TasksBoardProps) {
  const now = new Date()
  return (
    <KanbanBoard<BoardTask>
      columns={TASK_BOARD_COLUMNS}
      items={tasks}
      statusKey="status"
      keyField="id"
      onStatusChange={(id, status) => onStatusChange(id, status as Task['status'])}
      renderColumnSummary={(items) => `${items.length} task${items.length === 1 ? '' : 's'}`}
      renderCard={(task) => {
        const due = dueLabel(task.dueDate, task.status === 'done', now)
        return (
          <div className="w-full text-left">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 text-sm font-semibold">{task.title}</p>
              <Badge variant={PRIORITY_VARIANT[task.priority] ?? 'secondary'} className="shrink-0 px-1.5 py-0 text-[10px] font-normal">
                {task.priority}
              </Badge>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">{task.projectName}</p>
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
                  {task.assigneeName ? initials(task.assigneeName) : <UserRound className="size-3" />}
                </span>
                <span className="truncate text-xs text-muted-foreground">{task.assigneeName || 'Unassigned'}</span>
              </span>
              {due && (
                <span className={cn('shrink-0 text-xs', due.tone === 'overdue' && 'font-medium text-destructive', due.tone === 'soon' && 'font-medium text-warning', due.tone === 'normal' && 'text-muted-foreground')}>
                  {due.text}
                </span>
              )}
            </div>
          </div>
        )
      }}
    />
  )
}
