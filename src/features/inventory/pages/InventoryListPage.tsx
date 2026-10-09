import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PackagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { purchaseRequestsApi } from '@/features/purchase-requests/api'
import { usePermission } from '@/lib/permissions'
import { SummaryStrip } from '@/components/shared/SummaryStrip'
import { formatCurrency } from '@/lib/utils'
import { summariseInventory } from '../summary'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { useProjectOptions, useProjectNameMap, useProjectCodes } from '@/features/projects/hooks'
import { useIndustryConfig } from '@/lib/industry-store'
import { useInventory, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem } from '../api'
import { inventoryColumns, inventoryFields, inventoryImportColumns } from '../config'
import { RestockDialog } from '../components/RestockDialog'
import { StockLedgerDialog } from '../components/StockLedgerDialog'
import { countLines, restockPlan } from '../restock'
import type { InventoryItem } from '../types'

export function InventoryListPage() {
  const { data = [], isLoading } = useInventory()
  const createMutation = useCreateInventoryItem()
  const updateMutation = useUpdateInventoryItem()
  const deleteMutation = useDeleteInventoryItem()
  const { moduleText } = useIndustryConfig()

  const canRequestStock = usePermission('inventory', 'create')
  const { data: requests = [] } = useQuery({ queryKey: ['purchase-requests'], queryFn: purchaseRequestsApi.list, enabled: canRequestStock })
  const [restockOpen, setRestockOpen] = useState(false)
  const plan = useMemo(() => restockPlan(data, requests), [data, requests])

  const [ledgerItemId, setLedgerItemId] = useState<string | null>(null)
  const ledgerItem = ledgerItemId ? (data.find((i) => i.id === ledgerItemId) ?? null) : null

  const projectOptions = useProjectOptions()
  const projectNameMap = useProjectNameMap()
  const projectCodes = useProjectCodes()

  const summary = useMemo(() => summariseInventory(data), [data])
  const enriched = useMemo(
    () => data.map((i) => ({ ...i, projectName: projectNameMap[i.projectId] ?? i.projectId })),
    [data, projectNameMap],
  )

  const fields = useMemo(
    () => inventoryFields.map((f) => (f.name === 'projectId' ? { ...f, options: projectOptions } : f)),
    [projectOptions],
  )

  return (
    <>
    <EntityListPage<InventoryItem & { projectName: string }>
      title={moduleText.inventory.title}
      description={moduleText.inventory.description}
      data={enriched}
      columns={inventoryColumns}
      fields={fields}
      keyField="id"
      moduleKey="inventory"
      historyEntity="InventoryItem"
      headerActions={
        canRequestStock && plan.length > 0 ? (
          <Button variant="outline" onClick={() => setRestockOpen(true)}>
            <PackagePlus className="size-4" /> Request restock ({countLines(plan)})
          </Button>
        ) : undefined
      }
      summary={
        data.length > 0 ? (
          <SummaryStrip
            items={[
              { label: 'Items', value: String(summary.items) },
              { label: 'Stock value', value: formatCurrency(summary.stockValue), hint: 'Quantity × unit cost' },
              { label: 'Low stock', value: String(summary.lowStock), hint: 'At or below reorder level', tone: summary.lowStock > 0 ? 'warning' : undefined },
            ]}
          />
        ) : undefined
      }
      isLoading={isLoading}
      searchKeys={['name', 'category', 'projectName']}
      entityLabel={moduleText.inventory.entityLabel ?? 'material'}
      onRowClick={(row) => setLedgerItemId(row.id)}
      onCreate={(values) => createMutation.mutateAsync(values as Partial<InventoryItem>)}
      onUpdate={(id, values) => updateMutation.mutateAsync({ id, values: values as Partial<InventoryItem> })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      importConfig={{ columns: inventoryImportColumns, fileName: 'inventory-template.xlsx' }}
      validateImportRow={(row) => {
        const code = String(row.projectId ?? '').trim()
        return projectCodes.includes(code) ? null : `Unknown Project ID: ${code}`
      }}
    />

    <RestockDialog open={restockOpen} onOpenChange={setRestockOpen} plan={plan} projectNames={projectNameMap} />
    <StockLedgerDialog item={ledgerItem} onOpenChange={(open) => !open && setLedgerItemId(null)} />
    </>
  )
}
