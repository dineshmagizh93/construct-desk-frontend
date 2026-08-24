import { useMemo } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
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

  const enriched = useMemo(
    () => data.map((t) => ({ ...t, projectName: projectNameMap[t.projectId] ?? t.projectId })),
    [data, projectNameMap],
  )

  const fields = useMemo(
    () => taskFields.map((f) => (f.name === 'projectId' ? { ...f, options: projectOptions } : f)),
    [projectOptions],
  )

  return (
    <EntityListPage<Task & { projectName: string }>
      title="Tasks"
      description="Every task across every project, assigned and tracked to completion."
      data={enriched}
      columns={taskColumns}
      fields={fields}
      keyField="id"
      moduleKey="tasks"
      isLoading={isLoading}
      searchKeys={['title', 'projectName', 'assignee']}
      entityLabel="task"
      onCreate={(values) => createMutation.mutateAsync(values as Partial<Task>)}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<Task> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: taskImportColumns, fileName: 'tasks-template.xlsx' }}
      validateImportRow={(row) => {
        const code = String(row.projectId ?? '').trim()
        return projectCodes.includes(code) ? null : `Unknown Project ID: ${code}`
      }}
    />
  )
}
