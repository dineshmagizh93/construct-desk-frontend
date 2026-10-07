import { useMemo, useState } from 'react'
import { KanbanSquare, List } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { useUserOptions, useUserNameMap } from '@/features/users/hooks'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../api'
import { TASK_STATUS_OPTIONS, taskColumns, taskFields, taskImportColumns } from '../config'
import { TasksBoard } from '../components/TasksBoard'
import type { Task } from '../types'

export function TasksListPage() {
  const { data = [], isLoading } = useTasks()
  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask()
  const deleteMutation = useDeleteTask()
  const [view, setView] = useState<'list' | 'board'>('list')

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()
  const projectCodes = useProjectCodes()
  const userOptions = useUserOptions()
  const userNameMap = useUserNameMap()

  const enriched = useMemo(
    () =>
      data.map((t) => ({
        ...t,
        projectName: projectNameMap[t.projectId] ?? t.projectId,
        assigneeName: userNameMap[t.assignee] ?? t.assignee,
      })),
    [data, projectNameMap, userNameMap],
  )

  const fields = useMemo(
    () =>
      taskFields.map((f) => {
        if (f.name === 'projectId') return { ...f, options: projectOptions }
        if (f.name === 'assignee') return { ...f, options: userOptions }
        return f
      }),
    [projectOptions, userOptions],
  )

  const viewToggle = (
    <div className="inline-flex rounded-md border border-border p-0.5">
      <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('list')}>
        <List className="size-4" /> List
      </Button>
      <Button variant={view === 'board' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('board')}>
        <KanbanSquare className="size-4" /> Board
      </Button>
    </div>
  )

  if (view === 'board') {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <PageHeader title="Tasks" description="Drag a task between columns to change its status. Use the list view to add or edit tasks." actions={viewToggle} />
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading tasks…</p>
        ) : (
          <div className="min-h-0 flex-1">
            <TasksBoard tasks={enriched} onStatusChange={(id, status) => updateMutation.mutate({ id, values: { status } })} />
          </div>
        )}
      </div>
    )
  }

  return (
    <EntityListPage<Task & { projectName: string; assigneeName: string }>
      title="Tasks"
      description="Every task across every project, assigned and tracked to completion."
      data={enriched}
      columns={taskColumns}
      fields={fields}
      keyField="id"
      moduleKey="tasks"
      historyEntity="Task"
      headerActions={viewToggle}
      bulkStatus={{ field: 'status', options: TASK_STATUS_OPTIONS }}
      isLoading={isLoading}
      searchKeys={['title', 'projectName', 'assigneeName']}
      entityLabel="task"
      onCreate={(values) => createMutation.mutateAsync(values as Partial<Task>)}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<Task> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: taskImportColumns, fileName: 'tasks-template.xlsx' }}
      validateImportRow={(row) => {
        const code = String(row.projectId ?? '').trim()
        if (!projectCodes.includes(code)) return `Unknown Project ID: ${code}`
        const assignee = String(row.assignee ?? '').trim()
        const known = userOptions.some((o) => o.value === assignee || o.label.toLowerCase() === assignee.toLowerCase())
        if (assignee && !known) return `Unknown assignee: ${assignee}`
        return null
      }}
    />
  )
}
