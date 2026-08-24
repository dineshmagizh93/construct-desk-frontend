import { useMemo } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import type { UploadedFile } from '@/components/shared/types'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { http } from '@/lib/http'
import { useIndustryConfig } from '@/lib/industry-store'
import { useSiteProgress, useCreateSiteProgress, useUpdateSiteProgress, useDeleteSiteProgress } from '../api'
import { siteProgressColumns, siteProgressFields, siteProgressImportColumns } from '../config'
import type { SiteProgressEntry } from '../types'

// Photos are a relation on the backend (populated via a nested endpoint after upload), not a scalar
// field. New photos have a client-generated id (`file-…`); persisted ones have a real UUID. On save
// we attach the new photos AND delete any persisted photo the user removed in the edit form.
async function syncPhotos(entryId: string, original: UploadedFile[] | undefined, submitted: UploadedFile[] | undefined) {
  const list = submitted ?? []
  const keptIds = new Set(list.map((p) => p.id))
  const removed = (original ?? []).filter((p) => !p.id.startsWith('file-') && !keptIds.has(p.id))
  const added = list.filter((p) => p.id.startsWith('file-'))
  await Promise.all([
    ...removed.map((p) => http(`/site-progress/${entryId}/photos/${p.id}`, { method: 'DELETE' })),
    ...added.map((p) => http(`/site-progress/${entryId}/photos`, { method: 'POST', body: JSON.stringify(p) })),
  ])
}

export function SiteProgressListPage() {
  const { data = [], isLoading } = useSiteProgress()
  const createMutation = useCreateSiteProgress()
  const updateMutation = useUpdateSiteProgress()
  const deleteMutation = useDeleteSiteProgress()
  const { moduleText } = useIndustryConfig()

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()
  const projectCodes = useProjectCodes()

  const enriched = useMemo(
    () => data.map((entry) => ({ ...entry, projectName: projectNameMap[entry.projectId] ?? entry.projectId })),
    [data, projectNameMap],
  )

  const fields = useMemo(
    () => siteProgressFields.map((f) => (f.name === 'projectId' ? { ...f, options: projectOptions } : f)),
    [projectOptions],
  )

  return (
    <EntityListPage<SiteProgressEntry & { projectName: string }>
      title={moduleText.siteProgress.title}
      description={moduleText.siteProgress.description}
      data={enriched}
      columns={siteProgressColumns}
      fields={fields}
      keyField="id"
      moduleKey="site-progress"
      isLoading={isLoading}
      searchKeys={['projectName']}
      entityLabel={moduleText.siteProgress.entityLabel ?? 'report'}
      addButtonLabel="Add Daily Report"
      onCreate={async (values) => {
        const { photos, ...rest } = values as Partial<SiteProgressEntry>
        const created = await createMutation.mutateAsync(rest as Partial<SiteProgressEntry>)
        await syncPhotos(created.id, undefined, photos)
        return created
      }}
      onUpdate={async (id, values) => {
        const { photos, ...rest } = values as Partial<SiteProgressEntry>
        const original = data.find((e) => e.id === id)?.photos
        const updated = await updateMutation.mutateAsync({ id, values: rest as Partial<SiteProgressEntry> })
        await syncPhotos(id, original, photos)
        return updated
      }}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: siteProgressImportColumns, fileName: 'site-progress-template.xlsx' }}
      validateImportRow={(row) => {
        const code = String(row.projectId ?? '').trim()
        return projectCodes.includes(code) ? null : `Unknown Project ID: ${code}`
      }}
    />
  )
}
