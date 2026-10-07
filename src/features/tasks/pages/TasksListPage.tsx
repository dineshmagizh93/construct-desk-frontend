import { useMemo } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { useUserOptions, useUserNameMap } from '@/features/users/hooks'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../api'
import { taskColumns, taskFields, taskImportColumns } from '../config'
import type { Task } from '../types'

export function TasksListPage() {
  const { data = [], isLoading } = useTasks()
  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask()
  const deleteMutation = useDeleteTask()

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
