import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CommentsPanel } from '@/features/comments/CommentsPanel'
import { STATUS_COLORS } from '@/lib/constants'
import { cn, formatDate } from '@/lib/utils'
import { taskStatusLabel } from '../config'
import { dueLabel } from '../dueLabel'
import { recurrenceLabel } from '../recurrence'
import type { Task } from '../types'

const PRIORITY_VARIANT = { high: 'destructive', medium: 'warning', low: 'secondary' } as const

interface TaskDetailDialogProps {
  task: (Task & { projectName: string; assigneeName: string }) | null
  onOpenChange: (open: boolean) => void
}

/** One task at a glance, with the team's discussion underneath. */
export function TaskDetailDialog({ task, onOpenChange }: TaskDetailDialogProps) {
  if (!task) return null
  const due = dueLabel(task.dueDate, task.status === 'done', new Date())
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>{task.projectName}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant={STATUS_COLORS[task.status] ?? 'secondary'}>{taskStatusLabel(task.status)}</Badge>
          <Badge variant={PRIORITY_VARIANT[task.priority] ?? 'secondary'}>{task.priority} priority</Badge>
          <span className="text-muted-foreground">{task.assigneeName || 'Unassigned'}</span>
          {recurrenceLabel(task.recurrence) && <Badge variant="outline">↻ {recurrenceLabel(task.recurrence)}</Badge>}
          {task.dueDate && (
            <span className={cn('text-muted-foreground', due?.tone === 'overdue' && 'font-medium text-destructive')}>
              · {formatDate(task.dueDate)}
              {due ? ` (${due.text.toLowerCase()})` : ''}
            </span>
          )}
        </div>

        {task.description && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{task.description}</p>}

        <div className="border-t border-border pt-3">
          <CommentsPanel entity="Task" entityId={task.id} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
