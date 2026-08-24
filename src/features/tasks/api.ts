import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import type { Task } from './types'

export const tasksApi = createRestApi<Task>('/tasks')
export const {
  useEntityList: useTasks,
  useEntityCreate: useCreateTask,
  useEntityUpdate: useUpdateTask,
  useEntityRemove: useDeleteTask,
} = createEntityHooks('tasks', tasksApi)
