import { useMemo } from 'react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap } from '@/features/projects/hooks'
import { useSafetyIncidents, useCreateSafetyIncident, useUpdateSafetyIncident, useDeleteSafetyIncident } from '../api'
import { safetyColumns, safetyFields } from '../config'
import type { SafetyIncident } from '../types'

const DAY_MS = 86_400_000

// One-line safety scoreboard shown under the page title: whole days since the last Injury, and how
// many incidents are still open.
function summarize(data: SafetyIncident[]) {
  const injuries = data.filter((i) => i.type === 'Injury').map((i) => new Date(i.date).getTime())
  const open = data.filter((i) => i.status === 'open').length
  const parts: string[] = []
  if (injuries.length > 0) {
    const days = Math.max(0, Math.floor((Date.now() - Math.max(...injuries)) / DAY_MS))
    parts.push(`${days} day${days === 1 ? '' : 's'} since the last injury`)
  } else if (data.length > 0) {
    parts.push('No injuries logged')
  }
  if (open > 0) parts.push(`${open} open incident${open === 1 ? '' : 's'}`)
  return parts.join(' · ')
}

export function SafetyLogPage() {
  const { data = [], isLoading } = useSafetyIncidents()
  const createMutation = useCreateSafetyIncident()
  const updateMutation = useUpdateSafetyIncident()
  const deleteMutation = useDeleteSafetyIncident()

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()

  const enriched = useMemo(
    () => data.map((i) => ({ ...i, projectName: projectNameMap[i.projectId] ?? i.projectId })),
    [data, projectNameMap],
  )

  const fields = useMemo(
    () => safetyFields.map((f) => (f.name === 'projectId' ? { ...f, options: projectOptions } : f)),
    [projectOptions],
  )

  const summary = summarize(data)

  return (
    <EntityListPage<SafetyIncident & { projectName: string }>
      title="Safety Log"
      description={`Incidents, near misses, unsafe conditions and toolbox talks across your sites.${summary ? ` ${summary}.` : ''}`}
      data={enriched}
      columns={safetyColumns}
      fields={fields}
      keyField="id"
      moduleKey="site-progress"
      isLoading={isLoading}
      searchKeys={['projectName', 'type', 'description']}
      entityLabel="incident"
      addButtonLabel="Log Incident"
      getCreateDefaults={() => ({ date: new Date().toISOString().slice(0, 10), severity: 'Low', status: 'open' })}
      onCreate={(values) => createMutation.mutateAsync(values as Partial<SafetyIncident>)}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<SafetyIncident> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
    />
  )
}
