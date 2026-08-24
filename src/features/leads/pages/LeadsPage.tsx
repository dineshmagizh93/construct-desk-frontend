import { useState } from 'react'
import { Building2, MapPin, Plus, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { KanbanBoard } from '@/components/shared/KanbanBoard'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { DrawerForm } from '@/components/shared/DrawerForm'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useCreateLead, useDeleteLead, useLeads, useUpdateLead, toLeadPayload } from '../api'
import { LEAD_KANBAN_COLUMNS, leadColumns, leadFields, leadImportColumns } from '../config'
import { LeadDetailDialog } from '../components/LeadDetailDialog'
import type { Lead } from '../types'

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function LeadsPage() {
  const { data = [], isLoading } = useLeads()
  const createMutation = useCreateLead()
  const updateMutation = useUpdateLead()
  const deleteMutation = useDeleteLead()

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const selectedLead = selectedLeadId ? (data.find((lead) => lead.id === selectedLeadId) ?? null) : null

  const createLead = (values: Record<string, unknown>) => createMutation.mutateAsync(toLeadPayload(values))
  const updateLead = (id: string, values: Record<string, unknown>) =>
    updateMutation.mutateAsync({ id, values: toLeadPayload(values) })

  const tabsNav = (
    <TabsList className="shrink-0">
      <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
      <TabsTrigger value="list">All Leads</TabsTrigger>
    </TabsList>
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0">
        <PageHeader title="Leads" description="Track inquiries from first contact through to a signed contract." />
      </div>

      <Tabs defaultValue="pipeline" className="flex min-h-0 flex-1 flex-col">
        <TabsContent value="pipeline" className="mt-0 min-h-0 flex-1 data-[state=active]:flex data-[state=active]:flex-col">
          <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
            {tabsNav}
            <Button className="ml-auto" onClick={() => setCreateOpen(true)}>
              <Plus /> Add Lead
            </Button>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading pipeline…</p>
          ) : (
            <KanbanBoard<Lead>
              columns={LEAD_KANBAN_COLUMNS}
              items={data}
              statusKey="status"
              keyField="id"
              onStatusChange={(id, status) => updateMutation.mutate({ id, values: { status: status as Lead['status'] } })}
              renderColumnSummary={(leads) =>
                leads.length ? `${formatCurrency(leads.reduce((total, lead) => total + Number(lead.estimatedBudget || 0), 0))} value` : 'No value'
              }
              renderCard={(lead) => (
                <button className="w-full text-left" onClick={() => setSelectedLeadId(lead.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-semibold">{lead.name}</p>
                    <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px] font-normal">
                      {lead.source}
                    </Badge>
                  </div>

                  <div className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="size-3.5 shrink-0" />
                      <span className="truncate">{lead.projectType || 'Project type not set'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">{lead.location || 'Location not set'}</span>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-border/70 pt-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Estimated value</p>
                    <p className="mt-0.5 text-sm font-semibold">{formatCurrency(lead.estimatedBudget)}</p>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
                      {lead.assignedTo ? getInitials(lead.assignedTo) : <UserRound className="size-3" />}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">{lead.assignedTo || 'Unassigned'}</span>
                  </div>
                </button>
              )}
            />
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-0 min-h-0 flex-1 data-[state=active]:flex data-[state=active]:flex-col">
          <EntityListPage<Lead>
            hideHeader
            moduleKey="leads"
            toolbarStart={tabsNav}
            data={data}
            columns={leadColumns}
            fields={leadFields}
            keyField="id"
            isLoading={isLoading}
            searchKeys={['name', 'projectType', 'assignedTo']}
            entityLabel="lead"
            getCreateDefaults={() => ({ status: 'new' })}
            onRowClick={(row) => setSelectedLeadId(row.id)}
            onCreate={createLead}
            onUpdate={updateLead}
            onDelete={(id) => deleteMutation.mutateAsync(id)}
            importConfig={{ columns: leadImportColumns, fileName: 'leads-template.xlsx' }}
          />
        </TabsContent>
      </Tabs>

      <LeadDetailDialog lead={selectedLead} onOpenChange={(open) => !open && setSelectedLeadId(null)} />

      <DrawerForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add Lead"
        fields={leadFields}
        defaultValues={{ status: 'new' }}
        onSubmit={createLead}
        submitLabel="Create"
      />
    </div>
  )
}
