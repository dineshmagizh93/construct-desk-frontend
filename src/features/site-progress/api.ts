import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import type { SiteProgressEntry } from './types'

export const siteProgressApi = createRestApi<SiteProgressEntry>('/site-progress')
export const {
  useEntityList: useSiteProgress,
  useEntityCreate: useCreateSiteProgress,
  useEntityUpdate: useUpdateSiteProgress,
  useEntityRemove: useDeleteSiteProgress,
} = createEntityHooks('site-progress', siteProgressApi)
