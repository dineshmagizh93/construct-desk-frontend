import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjects } from '@/features/projects/api'
import { usePermission } from '@/lib/permissions'
import { formatRupeeAxis } from '@/lib/formatAxis'
import { cn, formatCurrency } from '@/lib/utils'
import { DEFAULT_FILTERS, useDashboard, type AttentionItem, type DashboardFilters, type MonitoringTotals } from '../api'
import { BudgetChart, CostBreakdownChart, WorkforceChart, WorkloadChart } from '../components/MonitoringCharts'
import { monitoringTiles, type Tile, type TileTone } from '../tiles'

const ATTENTION_TONE: Record<AttentionItem['tone'], string> = {
  destructive: 'bg-destructive/10 text-destructive',
  warning: 'bg-warning/15 text-warning',
  info: 'bg-primary/10 text-primary',
}

const TILE_TONE: Record<TileTone, string> = { good: 'text-success', bad: 'text-destructive', neutral: 'text-foreground' }

const STATUS_OPTIONS = [
  { value: 'all', label: 'All (except cancelled)' },
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function FilterCard({ filters, onChange }: { filters: DashboardFilters; onChange: (next: DashboardFilters) => void }) {
  const { data: projects = [] } = useProjects()
  const sorted = [...projects].sort((a, b) => a.name.localeCompare(b.name))
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">Project</p>
          <Select value={filters.projectId} onValueChange={(projectId) => onChange({ ...filters, projectId })}>
            <SelectTrigger aria-label="Project">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {sorted.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">Status</p>
          <Select value={filters.status} onValueChange={(status) => onChange({ ...filters, status })}>
            <SelectTrigger aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

function KpiTile({ tile }: { tile: Tile }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{tile.label}</p>
        <p className={cn('mt-1 text-2xl font-semibold tracking-tight tabular-nums', TILE_TONE[tile.tone])} title={tile.title}>
          {tile.value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{tile.hint}</p>
      </CardContent>
    </Card>
  )
}

function UtilizedBudgetTile({ totals }: { totals: MonitoringTotals }) {
  const percent = totals.utilizedPercent
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">Utilized Budget</p>
        <p className={cn('mt-1 text-2xl font-semibold tracking-tight tabular-nums', percent !== null && percent > 100 && 'text-destructive')}>
          {percent === null ? '—' : `${percent}%`}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={Math.min(100, percent ?? 0)} aria-valuemin={0} aria-valuemax={100}>
          <div className={cn('h-full rounded-full', percent !== null && percent > 100 ? 'bg-destructive' : 'bg-primary')} style={{ width: `${Math.min(100, percent ?? 0)}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground" title={`${formatCurrency(totals.spent)} of ${formatCurrency(totals.budget)}`}>
          Spent {formatRupeeAxis(totals.spent)} of {formatRupeeAxis(totals.budget)}
        </p>
      </CardContent>
    </Card>
  )
}

function AttentionCard({ items }: { items: AttentionItem[] }) {
  const navigate = useNavigate()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {items.length > 0 ? <AlertTriangle className="size-4 text-warning" /> : <CheckCircle2 className="size-4 text-success" />}
          Needs your attention
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">You're all caught up — nothing is waiting on you right now.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.to)}
                className="flex items-center gap-3 rounded-md border border-border p-3 text-left transition-colors hover:bg-secondary/60"
              >
                <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums', ATTENTION_TONE[item.tone])}>
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
  )
}

/** Project monitoring: budget, schedule, cost and workload for the projects chosen, then what needs action. */
export function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS)
  const { data, isLoading } = useDashboard(filters)
  const canViewProjects = usePermission('projects', 'view')
  const monitoring = data?.monitoring ?? null
  const tiles = monitoring ? monitoringTiles(monitoring.totals) : []
  const [scheduleVariance, costVariance, ...indexes] = tiles

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" description="How your projects are doing against budget and schedule, and what needs action." />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px]" />
          ))}
        </div>
      )}

      {monitoring && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {canViewProjects && <FilterCard filters={filters} onChange={setFilters} />}
            <KpiTile tile={scheduleVariance} />
            <KpiTile tile={costVariance} />
            <UtilizedBudgetTile totals={monitoring.totals} />
            {indexes.map((tile) => (
              <KpiTile key={tile.key} tile={tile} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BudgetChart data={monitoring.budgetByProject} />
            {monitoring.costBreakdown && <CostBreakdownChart data={monitoring.costBreakdown} />}
            {monitoring.workload && <WorkloadChart data={monitoring.workload} />}
            {monitoring.workforce && <WorkforceChart data={monitoring.workforce} />}
          </div>
        </>
      )}

      {!isLoading && <AttentionCard items={data?.attention ?? []} />}
    </div>
  )
}
