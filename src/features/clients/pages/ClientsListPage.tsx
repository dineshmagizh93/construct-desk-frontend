import { useNavigate } from 'react-router-dom'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '../api'
import { clientColumns, clientFields, clientImportColumns } from '../config'
import type { Client } from '../types'

export function ClientsListPage() {
  const navigate = useNavigate()
  const { data = [], isLoading } = useClients()
  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()
  const deleteMutation = useDeleteClient()

  return (
    <EntityListPage<Client>
      title="Clients"
      description="Every client relationship, from first contract to latest correspondence."
      moduleKey="clients"
      data={data}
      columns={clientColumns}
      fields={clientFields}
      keyField="id"
      isLoading={isLoading}
      searchKeys={['name', 'contactPerson', 'phone']}
      entityLabel="client"
      onRowClick={(row) => navigate(`/clients/${row.id}`)}
      onCreate={(values) => createMutation.mutateAsync({ ...values, contactHistory: [] } as Partial<Client>)}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<Client> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: clientImportColumns, fileName: 'clients-template.xlsx' }}
    />
  )
}
