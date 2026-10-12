import { useNavigate } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, Building2, CheckCircle2, CheckSquare, ChevronRight, Clock, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency } from '@/lib/utils'
import { formatRupeeAxis } from '@/lib/formatAxis'
import { useDashboard, type AttentionItem } from '../api'

const TONE_STYLE: Record<AttentionItem['tone'], string> = {
  destructive: 'bg-destructive/10 text-destructive',
  warning: 'bg-warning/15 text-warning',
  info: 'bg-primary/10 text-primary',
}

/** What a manager needs on arrival: what to act on, four headline numbers, and the money trend. Everything else lives in its module. */
export function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useDashboard()
  const kpis = data?.kpis

  // A null figure means this role can't see that data — leave the card out rather than show a fake zero.
  const cards = [
    { label: 'Active Projects', value: kpis?.activeProjects, icon: Building2, format: String },
    { label: 'Revenue This Month', value: kpis?.revenueMtd, icon: Wallet, format: formatCurrency },
    { label: 'Pending Payments', value: kpis?.pendingPayments, icon: Clock, format: formatCurrency },
    { label: 'Open Tasks', value: kpis?.openTasks, icon: CheckSquare, format: String },
  ].filter((card) => isLoading || card.value !== null)

  const trend = data?.revenueTrend
  const attention = data?.attention ?? []

  return (
    <div>
      <PageHeader title="Dashboard" description="What needs your attention, and how the business is doing." />

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) =>
          isLoading ? (
            <Skeleton key={card.label} className="h-[104px]" />
          ) : (
            <StatCard key={card.label} label={card.label} value={card.format(card.value as number)} icon={card.icon} />
          ),
        )}
      </div>

      {trend && (
        <Card className="mt-4">
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
                <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={formatRupeeAxis} />
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} contentStyle={{ borderRadius: 8, borderColor: 'var(--color-border)', fontSize: 13 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" fill="url(#revenueFill)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="expense" stroke="var(--color-accent)" fill="url(#expenseFill)" strokeWidth={2} name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
