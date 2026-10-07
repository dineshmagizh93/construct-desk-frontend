import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Download, Target, Building2, Receipt, HardHat, Package, Truck, type LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { downloadCsv } from '@/lib/csv'
import { usePermission } from '@/lib/permissions'
import { formatCurrency } from '@/lib/utils'
import { useContracts } from '@/features/contracts/api'
import { useExpenses } from '@/features/expenses/api'
import { useInventory } from '@/features/inventory/api'
import { useLeads } from '@/features/leads/api'
import { LEAD_KANBAN_COLUMNS } from '@/features/leads/config'
import { useLabour } from '@/features/labour/api'
import { useProjectNameMap } from '@/features/projects/hooks'
import { useProjects } from '@/features/projects/api'
import { useVendors } from '@/features/vendors/api'
import { useWorkOrders } from '@/features/work-orders/api'
import { expenseBreakdown, inventoryStatus, projectSummary, vendorPerformance, type ReportTable } from '../exports'

const today = () => new Date().toISOString().slice(0, 10)

// One downloadable report. The table is built from live data on every render, so the file always
// matches what the module pages show right now.
function ExportCard({ title, description, icon: Icon, fileBase, table }: { title: string; description: string; icon: LucideIcon; fileBase: string; table: ReportTable }) {
  const count = table.rows.length
  const exportReport = () => {
    downloadCsv(`${fileBase}-${today()}.csv`, table.headers, table.rows)
    toast({ title: 'Report downloaded', description: `${title} — ${count} row${count === 1 ? '' : 's'}.`, variant: 'success' })
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="size-4 text-primary" /> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={exportReport} disabled={count === 0}>
          <Download /> Export CSV
        </Button>
        <span className="text-xs text-muted-foreground">{count === 0 ? 'Nothing to export yet' : `${count} row${count === 1 ? '' : 's'}`}</span>
      </CardFooter>
    </Card>
  )
}

function ProjectSummaryCard() {
  const { data = [] } = useProjects()
  return (
    <ExportCard
      title="Project Summary"
      description="Status, progress, and budget for every project."
      icon={Building2}
      fileBase="project-summary"
      table={projectSummary(data)}
    />
  )
}

function ExpenseBreakdownCard() {
  const { data = [] } = useExpenses()
  const projectNames = useProjectNameMap()
  return (
    <ExportCard
      title="Expense Breakdown"
      description="Expenses by category and project (rejected expenses excluded)."
      icon={Receipt}
      fileBase="expense-breakdown"
      table={expenseBreakdown(data, projectNames)}
    />
  )
}

function InventoryStatusCard() {
  const { data = [] } = useInventory()
  const projectNames = useProjectNameMap()
  return (
    <ExportCard
      title="Inventory Status"
      description="Stock levels, value and reorder alerts by material."
      icon={Package}
      fileBase="inventory-status"
      table={inventoryStatus(data, projectNames)}
    />
  )
}

function VendorPerformanceCard() {
  const { data: vendors = [] } = useVendors()
  const { data: contracts = [] } = useContracts()
  const { data: workOrders = [] } = useWorkOrders()
  return (
    <ExportCard
      title="Vendor Performance"
      description="Ratings, purchase orders and subcontractor work order volume by vendor."
      icon={Truck}
      fileBase="vendor-performance"
      table={vendorPerformance(vendors, contracts, workOrders)}
    />
  )
}

function LeadFunnelCard() {
  const { data: leads = [] } = useLeads()
  const funnel = LEAD_KANBAN_COLUMNS.map((col) => ({
    name: col.label,
    value: leads.filter((l) => l.status === col.id).length,
  }))

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="size-4" /> Lead Conversion Funnel
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funnel} margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs" />
            <YAxis tickLine={false} axisLine={false} className="text-xs" allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 8, borderColor: 'var(--color-border)', fontSize: 13 }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {LEAD_KANBAN_COLUMNS.map((col) => (
                <Cell key={col.id} fill="var(--color-primary)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function LabourUtilizationCard() {
  const { data: labour = [] } = useLabour()
  const labourByRole = Object.values(
    labour.reduce<Record<string, { role: string; workers: number; daysPresent: number; wageCost: number }>>((acc, worker) => {
      const role = worker.role || 'Unspecified'
      acc[role] ??= { role, workers: 0, daysPresent: 0, wageCost: 0 }
      acc[role].workers += 1
      acc[role].daysPresent += worker.attendance.filter((a) => a.present).length
      acc[role].wageCost += worker.attendance.reduce((sum, a) => sum + a.wageAmount, 0)
      return acc
    }, {}),
  ).sort((a, b) => b.wageCost - a.wageCost)

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardHat className="size-4" /> Labour Utilization
        </CardTitle>
        <CardDescription>Attendance and wage cost by trade.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trade</TableHead>
              <TableHead className="text-right">Workers</TableHead>
              <TableHead className="text-right">Days Present</TableHead>
              <TableHead className="text-right">Wage Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {labourByRole.map((row) => (
              <TableRow key={row.role}>
                <TableCell>{row.role}</TableCell>
                <TableCell className="text-right">{row.workers}</TableCell>
                <TableCell className="text-right">{row.daysPresent}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(row.wageCost)}</TableCell>
              </TableRow>
            ))}
            {labourByRole.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                  No labour records yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function ReportsPage() {
  // Each section only mounts (and so only fetches) when the user may view its source module.
  const canLeads = usePermission('leads', 'view')
  const canLabour = usePermission('labour', 'view')
  const canProjects = usePermission('projects', 'view')
  const canExpenses = usePermission('expenses', 'view')
  const canInventory = usePermission('inventory', 'view')
  const canVendorReport = usePermission('vendors', 'view') && usePermission('contracts', 'view')

  return (
    <div>
      <PageHeader title="Reports & Analytics" description="Cross-module reports you can export and share." />

      {canLeads && <LeadFunnelCard />}
      {canLabour && <LabourUtilizationCard />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {canProjects && <ProjectSummaryCard />}
        {canExpenses && <ExpenseBreakdownCard />}
        {canInventory && <InventoryStatusCard />}
        {canVendorReport && <VendorPerformanceCard />}
      </div>
    </div>
  )
}
