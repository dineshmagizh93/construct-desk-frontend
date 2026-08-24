import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Building2,
  Wallet,
  Clock,
  CheckSquare,
  Target,
  PackageX,
  Plus,
  Receipt,
  Users,
  ClipboardCheck,
  CreditCard,
  FileSignature,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DASHBOARD_KPIS, PROJECT_STATUS_BREAKDOWN, RECENT_ACTIVITY, REVENUE_TREND } from '../data.mock'

const ACTIVITY_ICONS = {
  lead: Target,
  payment: CreditCard,
  task: CheckSquare,
  site: ClipboardCheck,
  contract: FileSignature,
}

const QUICK_LINKS = [
  { label: 'New Lead', to: '/leads', icon: Target },
  { label: 'New Project', to: '/projects', icon: Building2 },
  { label: 'New Task', to: '/tasks', icon: CheckSquare },
  { label: 'New Expense', to: '/expenses', icon: Receipt },
]

export function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader title="Dashboard" description="A snapshot of every project, deal, and rupee right now." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Active Projects"
          value={String(DASHBOARD_KPIS.activeProjects)}
          icon={Building2}
          trend={{ value: DASHBOARD_KPIS.activeProjectsTrend, direction: 'up' }}
        />
        <StatCard
          label="Revenue (MTD)"
          value={formatCurrency(DASHBOARD_KPIS.totalRevenue)}
          icon={Wallet}
          trend={{ value: DASHBOARD_KPIS.revenueTrend, direction: 'up' }}
        />
        <StatCard
          label="Pending Payments"
          value={formatCurrency(DASHBOARD_KPIS.pendingPayments)}
          icon={Clock}
          trend={{ value: DASHBOARD_KPIS.pendingPaymentsTrend, direction: 'down' }}
        />
        <StatCard
          label="Open Tasks"
          value={String(DASHBOARD_KPIS.openTasks)}
          icon={CheckSquare}
          trend={{ value: DASHBOARD_KPIS.openTasksTrend, direction: 'up' }}
        />
        <StatCard
          label="Leads in Pipeline"
          value={String(DASHBOARD_KPIS.leadsInPipeline)}
          icon={Users}
          trend={{ value: DASHBOARD_KPIS.leadsInPipelineTrend, direction: 'up' }}
        />
        <StatCard
          label="Low Stock Items"
          value={String(DASHBOARD_KPIS.lowStockItems)}
          icon={PackageX}
          trend={{ value: DASHBOARD_KPIS.lowStockItemsTrend, direction: 'down' }}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs Expense</CardTitle>
          </CardHeader>
          <CardContent className="h-72 pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND} margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                  contentStyle={{ borderRadius: 8, borderColor: 'var(--color-border)', fontSize: 13 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" fill="url(#revenueFill)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="expense" stroke="var(--color-accent)" fill="url(#expenseFill)" strokeWidth={2} name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PROJECT_STATUS_BREAKDOWN}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {PROJECT_STATUS_BREAKDOWN.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: 'var(--color-border)', fontSize: 13 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {RECENT_ACTIVITY.map((event) => {
              const Icon = ACTIVITY_ICONS[event.type]
              return (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{event.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(event.timestamp)}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {QUICK_LINKS.map((link) => (
              <Button
                key={link.label}
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => navigate(link.to)}
              >
                <link.icon className="size-5" />
                <span className="text-xs">{link.label}</span>
              </Button>
            ))}
            <Button variant="ghost" className="col-span-2 h-auto py-3" onClick={() => navigate('/reports')}>
              <Plus className="size-4" /> View all reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
