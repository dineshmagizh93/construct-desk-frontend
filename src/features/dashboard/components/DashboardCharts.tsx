import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { StageCount, WorkloadBar } from '../api'

const TOOLTIP_STYLE = { borderRadius: 8, borderColor: 'var(--color-border)', fontSize: 13 }
const TICK = { fontSize: 12 }

const LEAD_STAGE_LABEL: Record<string, string> = { new: 'New', contacted: 'Contacted', site_visit: 'Site visit', quoted: 'Quoted', won: 'Won', lost: 'Lost' }
const LEAD_STAGE_COLOR: Record<string, string> = {
  new: 'var(--color-primary)',
  contacted: 'var(--color-primary)',
  site_visit: 'var(--color-primary)',
  quoted: 'var(--color-primary)',
  won: 'var(--color-success)',
  lost: 'var(--color-muted-foreground)',
}

const PROJECT_STATUS_LABEL: Record<string, string> = { planning: 'Planning', in_progress: 'In progress', on_hold: 'On hold', completed: 'Completed' }
const PROJECT_STATUS_COLOR: Record<string, string> = {
  planning: 'var(--color-muted-foreground)',
  in_progress: 'var(--color-primary)',
  on_hold: 'var(--color-accent)',
  completed: 'var(--color-success)',
}

function ChartCard({ title, to, empty, children }: { title: string; to: string; empty?: string | false; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        <Link to={to} className="inline-flex items-center gap-1 rounded text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
          View all <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {empty ? <p className="flex h-56 items-center justify-center text-center text-sm text-muted-foreground">{empty}</p> : children}
      </CardContent>
    </Card>
  )
}

/** How many leads sit at each stage of the sales pipeline. */
export function LeadsByStageChart({ data }: { data: StageCount[] }) {
  const rows = data.map((d) => ({ ...d, label: LEAD_STAGE_LABEL[d.status] ?? d.status }))
  return (
    <ChartCard title="Leads by Stage" to="/leads" empty={rows.every((r) => r.count === 0) && 'No leads yet.'}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={TICK} interval={0} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={TICK} width={32} />
            <Tooltip cursor={{ fill: 'var(--color-secondary)' }} contentStyle={TOOLTIP_STYLE} formatter={(value) => [String(value), 'Leads']} />
            <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]} maxBarSize={36} label={{ position: 'top', fontSize: 12 }}>
              {rows.map((r) => (
                <Cell key={r.status} fill={LEAD_STAGE_COLOR[r.status] ?? 'var(--color-primary)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

/** Projects by life-cycle status, as a donut with the counts beside it. */
export function ProjectsByStatusChart({ data }: { data: StageCount[] }) {
  const rows = data.map((d) => ({ ...d, label: PROJECT_STATUS_LABEL[d.status] ?? d.status }))
  const total = rows.reduce((sum, r) => sum + r.count, 0)
  return (
    <ChartCard title="Projects by Status" to="/projects" empty={total === 0 && 'No projects yet.'}>
      <div className="grid items-center gap-4 sm:grid-cols-2">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rows.filter((r) => r.count > 0)} dataKey="count" nameKey="label" innerRadius={50} outerRadius={78} paddingAngle={2} stroke="none">
                {rows
                  .filter((r) => r.count > 0)
                  .map((r) => (
                    <Cell key={r.status} fill={PROJECT_STATUS_COLOR[r.status] ?? 'var(--color-border)'} />
                  ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2 text-sm">
          {rows.map((r) => (
            <li key={r.status} className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: PROJECT_STATUS_COLOR[r.status] ?? 'var(--color-border)' }} />
              <span className="flex-1">{r.label}</span>
              <span className="font-medium tabular-nums">{r.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}

/** Tasks per project: done, still to do, and past due. */
export function TasksByProjectChart({ data }: { data: WorkloadBar[] }) {
  return (
    <ChartCard title="Tasks by Project" to="/tasks" empty={data.length === 0 && 'No tasks yet.'}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={TICK} />
            <YAxis type="category" dataKey="code" tickLine={false} axisLine={false} tick={TICK} width={72} />
            <Tooltip
              cursor={{ fill: 'var(--color-secondary)' }}
              labelFormatter={(_, payload) => (payload?.[0]?.payload as WorkloadBar | undefined)?.name ?? ''}
              contentStyle={TOOLTIP_STYLE}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="completed" name="Done" stackId="tasks" fill="var(--color-success)" maxBarSize={22} />
            <Bar dataKey="remaining" name="To do" stackId="tasks" fill="var(--color-primary)" maxBarSize={22} />
            <Bar dataKey="overdue" name="Overdue" stackId="tasks" fill="var(--color-destructive)" maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
