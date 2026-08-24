import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Wallet, TrendingUp, TrendingDown, Percent } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { useProjects } from '@/features/projects/api'
import { useFinanceReport } from '../api'

export function FinanceReportsPage() {
  const { data: projects = [] } = useProjects()
  const { data: report } = useFinanceReport()

  const summary = report?.summary ?? { totalRevenue: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0, outstanding: 0 }
  const cashFlow = report?.cashFlow ?? []

  const budgetVsActual = projects.map((p) => ({
    name: p.name.length > 16 ? `${p.name.slice(0, 16)}…` : p.name,
    budget: p.budget,
    spent: p.spent,
  }))

  return (
    <div>
      <PageHeader title="Financial Reports" description="Profit & loss, budget performance, and cash flow across the business." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(summary.totalRevenue)} icon={Wallet} />
        <StatCard label="Total Expenses" value={formatCurrency(summary.totalExpenses)} icon={TrendingDown} />
        <StatCard label="Net Profit" value={formatCurrency(summary.netProfit)} icon={TrendingUp} />
        <StatCard label="Profit Margin" value={`${summary.profitMargin}%`} icon={Percent} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
          </CardHeader>
          <CardContent className="h-72 pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlow} margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} contentStyle={{ borderRadius: 8, borderColor: 'var(--color-border)', fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="inflow" stroke="var(--color-success)" strokeWidth={2} name="Inflow" />
                <Line type="monotone" dataKey="outflow" stroke="var(--color-destructive)" strokeWidth={2} name="Outflow" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual Spend</CardTitle>
          </CardHeader>
          <CardContent className="h-72 pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActual} margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} contentStyle={{ borderRadius: 8, borderColor: 'var(--color-border)', fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="budget" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Budget" />
                <Bar dataKey="spent" fill="var(--color-accent)" radius={[4, 4, 0, 0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
