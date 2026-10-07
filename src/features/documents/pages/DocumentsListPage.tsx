import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { EntityListPage } from '@/components/shared/EntityListPage'
import type { UploadedFile } from '@/components/shared/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { http } from '@/lib/http'
import { useDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument } from '../api'
import { documentColumns, documentFields, documentImportColumns } from '../config'
import type { DocumentItem } from '../types'

// `file` is a relation on the backend (populated via a nested endpoint after upload), not a scalar
// field. New (not-yet-persisted) files have a client-generated id (`file-…`); persisted ones have a
// real UUID. On save we both attach the new files AND delete any persisted file the user removed.
async function syncFiles(documentId: string, original: UploadedFile[] | undefined, submitted: UploadedFile[] | undefined) {
  const list = submitted ?? []
  const keptIds = new Set(list.map((f) => f.id))
  const removed = (original ?? []).filter((f) => !f.id.startsWith('file-') && !keptIds.has(f.id))
  const added = list.filter((f) => f.id.startsWith('file-'))
  await Promise.all([
    ...removed.map((f) => http(`/documents/${documentId}/files/${f.id}`, { method: 'DELETE' })),
    ...added.map((f) => http(`/documents/${documentId}/files`, { method: 'POST', body: JSON.stringify(f) })),
  ])
}

export function DocumentsListPage() {
  const { data = [], isLoading } = useDocuments()
  const createMutation = useCreateDocument()
  const updateMutation = useUpdateDocument()
  const deleteMutation = useDeleteDocument()

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()
  const projectCodes = useProjectCodes()

  const enriched = useMemo(
    () => data.map((d) => ({ ...d, projectName: projectNameMap[d.projectId] ?? d.projectId })),
    [data, projectNameMap],
  )

  const fields = useMemo(
    () => documentFields.map((f) => (f.name === 'projectId' ? { ...f, options: projectOptions } : f)),
    [projectOptions],
  )

  return (
    <EntityListPage<DocumentItem & { projectName: string }>
      title="Documents"
      description="Drawings, permits, contracts, and licenses — organized by project."
      data={enriched}
      columns={documentColumns}
      fields={fields}
      keyField="id"
      moduleKey="documents"
      historyEntity="Document"
      isLoading={isLoading}
      searchKeys={['name', 'projectName', 'category']}
      entityLabel="document"
      addButtonLabel="Upload Document"
      rowActions={(row) => {
        if (row.file.length === 0) return null
        if (row.file.length === 1) {
          return (
            <Button variant="ghost" size="icon-sm" asChild>
              <a href={row.file[0].url} download={row.file[0].name} onClick={(e) => e.stopPropagation()}>
                <Download className="size-3.5" />
              </a>
            </Button>
          )
        }
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={(e) => e.stopPropagation()}>
                <Download className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {row.file.map((f) => (
                <DropdownMenuItem key={f.id} asChild>
                  <a href={f.url} download={f.name}>
                    {f.name}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }}
      onCreate={async (values) => {
        const { file, ...rest } = values as Partial<DocumentItem>
        const created = await createMutation.mutateAsync(rest as Partial<DocumentItem>)
        await syncFiles(created.id, undefined, file)
        return created
      }}
      onUpdate={async (id, values) => {
        const { file, ...rest } = values as Partial<DocumentItem>
        const original = data.find((d) => d.id === id)?.file
        const updated = await updateMutation.mutateAsync({ id, values: rest as Partial<DocumentItem> })
        await syncFiles(id, original, file)
        return updated
      }}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: documentImportColumns, fileName: 'documents-template.xlsx' }}
      validateImportRow={(row) => {
        const code = String(row.projectId ?? '').trim()
        return projectCodes.includes(code) ? null : `Unknown Project ID: ${code}`
      }}
    />
  )
}
