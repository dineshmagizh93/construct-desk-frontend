import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import type { DocumentItem } from './types'

export const documentsApi = createRestApi<DocumentItem>('/documents')
export const {
  useEntityList: useDocuments,
  useEntityCreate: useCreateDocument,
  useEntityUpdate: useUpdateDocument,
  useEntityRemove: useDeleteDocument,
} = createEntityHooks('documents', documentsApi)
