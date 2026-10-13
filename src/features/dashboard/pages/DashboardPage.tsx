import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  ClipboardCheck,
  Receipt,
  Target,
  Wallet,
  Wrench,
  PackageX,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency } from '@/lib/utils'
import { useDashboard, type AttentionItem } from '../api'
import { dashboardCards, type CardIcon, type CardTone, type DashboardCard } from '../cards'
import { LeadsByStageChart, ProjectsByStatusChart, TasksByProjectChart } from '../components/DashboardCharts'

const ICONS: Record<CardIcon, LucideIcon> = {
  leads: Target,
  projects: Building2,
  tasks: CheckSquare,
  site: ClipboardCheck,
  invoices: Receipt,
  expenses: Wallet,
  stock: PackageX,
  equipment: Wrench,
}

const VALUE_TONE: Record<CardTone, string> = {
  good: 'text-success',
  warn: 'text-warning',
  bad: 'text-destructive',
  neutral: 'text-foreground',
}

const ATTENTION_TONE: Record<AttentionItem['tone'], string> = {
  destructive: 'bg-destructive/10 text-destructive',
  warning: 'bg-warning/15 text-warning',
  info: 'bg-primary/10 text-primary',
}

/** A whole card is one link: click anywhere on it to open that module. */
function ModuleCard({ card }: { card: DashboardCard }) {
  const Icon = ICONS[card.icon]
  return (
    <Link to={card.to} aria-label={`${card.label}: ${card.value}. ${card.hint}. Open ${card.label}.`} className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
          </div>
          <p className={cn('mt-1 text-3xl font-semibold tracking-tight tabular-nums', VALUE_TONE[card.tone])}>{card.value}</p>
          <p className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{card.hint}</span>
            <ChevronRight className="size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </p>
        </CardContent>
      </Card>
    </Link>
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

/** What is happening across the business, module by module; every card opens the module behind it. */
export function DashboardPage() {
  const { data, isLoading } = useDashboard()
  const cards = data ? dashboardCards(data.cards) : []
  const charts = data?.charts

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" description="What is happening across your business. Click any card to open it." />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[112px]" />
          ))}
        </div>
      )}

      {cards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <ModuleCard key={card.key} card={card} />
          ))}
        </div>
      )}

      {charts && (charts.leadsByStage || charts.projectsByStatus || charts.tasksByProject) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {charts.leadsByStage && <LeadsByStageChart data={charts.leadsByStage} />}
          {charts.projectsByStatus && <ProjectsByStatusChart data={charts.projectsByStatus} />}
          {charts.tasksByProject && <TasksByProjectChart data={charts.tasksByProject} />}
        </div>
      )}

      {!isLoading && <AttentionCard items={data?.attention ?? []} />}
    </div>
  )
}
