import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Download, Target, Building2, Receipt, HardHat, Package, Truck } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { useLeads } from '@/features/leads/api'
import { LEAD_KANBAN_COLUMNS } from '@/features/leads/config'
import { useLabour } from '@/features/labour/api'

const REPORT_CARDS = [
  { title: 'Project Summary', description: 'Status, progress, and budget for every project.', icon: Building2 },
  { title: 'Expense Breakdown', description: 'Expenses by category and project.', icon: Receipt },
  { title: 'Inventory Status', description: 'Stock levels and reorder alerts by material.', icon: Package },
  { title: 'Vendor Performance', description: 'Ratings and purchase order volume by vendor.', icon: Truck },
]

export function ReportsPage() {
  const { data: leads = [] } = useLeads()
  const { data: labour = [] } = useLabour()

  const funnel = LEAD_KANBAN_COLUMNS.map((col) => ({
    name: col.label,
    value: leads.filter((l) => l.status === col.id).length,
  }))

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

  const exportReport = (title: string) => {
    toast({ title: 'Export started', description: `${title} is being prepared for download.`, variant: 'success' })
  }

  return (
    <div>
      <PageHeader title="Reports & Analytics" description="Cross-module reports you can export and share." />

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {REPORT_CARDS.map((report) => (
          <Card key={report.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <report.icon className="size-4 text-primary" /> {report.title}
              </CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" size="sm" onClick={() => exportReport(report.title)}>
                <Download /> Export CSV
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
