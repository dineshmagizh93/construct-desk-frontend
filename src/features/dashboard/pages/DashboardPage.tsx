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
  AlertTriangle,
  Building2,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  ClipboardCheck,
  Clock,
  CreditCard,
  Lock,
  PackageX,
  Plus,
  Receipt,
  Target,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { useDashboard, type AttentionItem, type DashboardActivity } from '../api'

const ACTIVITY_ICONS: Record<DashboardActivity['type'], LucideIcon> = {
  lead: Target,
  payment: CreditCard,
  task: CheckSquare,
  site: ClipboardCheck,
}

const QUICK_LINKS = [
  { label: 'New Lead', to: '/leads', icon: Target },
  { label: 'New Project', to: '/projects', icon: Building2 },
  { label: 'New Task', to: '/tasks', icon: CheckSquare },
  { label: 'New Expense', to: '/expenses', icon: Receipt },
]

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  planning: { label: 'Planning', color: 'var(--color-muted-foreground)' },
  in_progress: { label: 'In Progress', color: 'var(--color-warning)' },
  on_hold: { label: 'On Hold', color: 'var(--color-destructive)' },
  completed: { label: 'Completed', color: 'var(--color-success)' },
  cancelled: { label: 'Cancelled', color: 'var(--color-border)' },
}

const TONE_STYLE: Record<AttentionItem['tone'], string> = {
  destructive: 'bg-destructive/10 text-destructive',
  warning: 'bg-warning/15 text-warning',
  info: 'bg-primary/10 text-primary',
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useDashboard()
  const kpis = data?.kpis

  // A null figure means this role can't see that data — leave the card out rather than show a fake zero.
  const cards = [
    { label: 'Active Projects', value: kpis?.activeProjects, icon: Building2, format: String },
    { label: 'Revenue (MTD)', value: kpis?.revenueMtd, icon: Wallet, format: formatCurrency },
    { label: 'Pending Payments', value: kpis?.pendingPayments, icon: Clock, format: formatCurrency },
    { label: 'Retention Held by Clients', value: kpis?.retentionHeld, icon: Lock, format: formatCurrency },
    { label: 'Open Tasks', value: kpis?.openTasks, icon: CheckSquare, format: String },
    { label: 'Leads in Pipeline', value: kpis?.leadsInPipeline, icon: Users, format: String },
    { label: 'Low Stock Items', value: kpis?.lowStockItems, icon: PackageX, format: String },
  ].filter((card) => isLoading || card.value !== null)

  const statusData = (data?.projectsByStatus ?? [])
    .filter((g) => g.count > 0)
    .map((g) => ({ name: STATUS_STYLE[g.status]?.label ?? g.status, value: g.count, color: STATUS_STYLE[g.status]?.color ?? 'var(--color-border)' }))

  const trend = data?.revenueTrend
  const attention = data?.attention ?? []
  const activity = data?.activity ?? []

  return (
    <div>
      <PageHeader title="Dashboard" description="A snapshot of every project, deal, and rupee right now." />

      {!isLoading && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {attention.length > 0 ? <AlertTriangle className="size-4 text-warning" /> : <CheckCircle2 className="size-4 text-success" />}
              Needs your attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attention.length === 0 ? (
              <p className="text-sm text-muted-foreground">You're all caught up — nothing is waiting on you right now.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {attention.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigate(item.to)}
                    className="flex items-center gap-3 rounded-md border border-border p-3 text-left transition-colors hover:bg-secondary/60"
                  >
                    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums', TONE_STYLE[item.tone])}>
                      {item.count}
                    </span>
                    <span className="min-w-0 flex-1 text-sm">
                      {item.label}
                      {item.amount ? <span className="ml-1 text-muted-foreground">· {formatCurrency(item.amount)}</span> : null}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) =>
          isLoading ? (
            <Skeleton key={card.label} className="h-[104px]" />
          ) : (
            <StatCard key={card.label} label={card.label} value={card.format(card.value as number)} icon={card.icon} />
          ),
        )}
      </div>

      {(trend || statusData.length > 0 || isLoading) && (
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          {trend && (
            <Card className={statusData.length > 0 ? 'xl:col-span-2' : 'xl:col-span-3'}>
              <CardHeader>
                <CardTitle>Revenue vs Expense</CardTitle>
              </CardHeader>
              <CardContent className="h-72 pl-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
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
                    <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
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
          )}

          {statusData.length > 0 && (
            <Card className={trend ? undefined : 'xl:col-span-3'}>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, borderColor: 'var(--color-border)', fontSize: 13 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.length === 0 && !isLoading && <p className="text-sm text-muted-foreground">Activity will show up here as your team works.</p>}
            {activity.map((event) => {
              const Icon = ACTIVITY_ICONS[event.type]
              return (
                <div key={`${event.type}-${event.id}`} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{event.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{event.timestamp ? formatDate(event.timestamp) : ''}</span>
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
              <Button key={link.label} variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate(link.to)}>
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
