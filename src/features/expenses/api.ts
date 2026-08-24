import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import type { Expense } from './types'

export const expensesApi = createRestApi<Expense>('/expenses')
export const {
  useEntityList: useExpenses,
  useEntityCreate: useCreateExpense,
  useEntityUpdate: useUpdateExpense,
  useEntityRemove: useDeleteExpense,
} = createEntityHooks('expenses', expensesApi)
