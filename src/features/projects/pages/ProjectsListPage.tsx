import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { toast } from '@/hooks/use-toast'
import { useIndustryConfig } from '@/lib/industry-store'
import { useCreateProject, useDeleteProject, useProjects, useUpdateProject } from '../api'
import { projectColumns, projectFields, projectImportColumns } from '../config'
import { nextProjectCode } from '../utils'
import type { Project } from '../types'

export function ProjectsListPage() {
  const navigate = useNavigate()
  const { data = [], isLoading } = useProjects()
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const deleteMutation = useDeleteProject()
  const industryConfig = useIndustryConfig()

  const fields = useMemo(
    () => projectFields.map((f) => (f.name === 'type' ? { ...f, options: industryConfig.projectTypeOptions } : f)),
    [industryConfig],
  )

  const createProject = (values: Record<string, unknown>) => {
    const code = String(values.code ?? '').trim()
    if (data.some((p) => p.code.toLowerCase() === code.toLowerCase())) {
      toast({ title: 'Duplicate Project ID', description: `A project with ID "${code}" already exists.`, variant: 'destructive' })
      return Promise.reject(new Error('Duplicate Project ID'))
    }
    return createMutation.mutateAsync({
      ...values,
      code,
      milestones: [],
      tasks: [],
      expenses: [],
      documents: [],
      progress: Number(values.progress) || 0,
    } as Partial<Project>)
  }

  return (
    <EntityListPage<Project>
      title={industryConfig.moduleText.projects.title}
      description={industryConfig.moduleText.projects.description}
      data={data}
      columns={projectColumns}
      fields={fields}
      keyField="id"
      moduleKey="projects"
      isLoading={isLoading}
      searchKeys={['name', 'clientName', 'location', 'code']}
      entityLabel="project"
      onRowClick={(row) => navigate(`/projects/${row.id}`)}
      getCreateDefaults={() => ({
        code: nextProjectCode(data),
        status: 'planning',
        type: industryConfig.projectTypeOptions[0]?.value,
      })}
      onCreate={createProject}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<Project> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: projectImportColumns, fileName: 'projects-template.xlsx' }}
      validateImportRow={(row) => {
        const code = String(row.code ?? '').trim()
        return data.some((p) => p.code.toLowerCase() === code.toLowerCase()) ? `Duplicate Project ID: ${code}` : null
      }}
    />
  )
}
