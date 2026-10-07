import { useNavigate } from 'react-router-dom'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '../api'
import { clientColumns, clientFields, clientImportColumns } from '../config'
import { useDuplicateGuard } from '@/features/duplicates/useDuplicateGuard'
import type { Client } from '../types'

export function ClientsListPage() {
  const navigate = useNavigate()
  const { data = [], isLoading } = useClients()
  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()
  const deleteMutation = useDeleteClient()
  const { confirmCreate, dialog: duplicateDialog } = useDuplicateGuard('clients', 'client')
  const importClient = (values: Record<string, unknown>) => createMutation.mutateAsync({ ...values, contactHistory: [] } as Partial<Client>)

  return (
    <>
    <EntityListPage<Client>
      title="Clients"
      description="Every client relationship, from first contract to latest correspondence."
      moduleKey="clients"
      historyEntity="Client"
      data={data}
      columns={clientColumns}
      fields={clientFields}
      keyField="id"
      isLoading={isLoading}
      searchKeys={['name', 'contactPerson', 'phone']}
      entityLabel="client"
      onRowClick={(row) => navigate(`/clients/${row.id}`)}
      onCreate={async (values) => {
        if (!(await confirmCreate(values))) throw new Error('Cancelled')
        return importClient(values)
      }}
      onImportRow={importClient}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<Client> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: clientImportColumns, fileName: 'clients-template.xlsx' }}
    />
    {duplicateDialog}
    </>
  )
}
