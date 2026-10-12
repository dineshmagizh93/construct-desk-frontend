import type { ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupeeAxis } from '@/lib/formatAxis'
import { formatCurrency } from '@/lib/utils'
import type { BudgetBar, CostSlice, WorkforceBar, WorkloadBar } from '../api'

const TOOLTIP_STYLE = { borderRadius: 8, borderColor: 'var(--color-border)', fontSize: 13 }
const TICK = { fontSize: 12 }
const SLICE_COLORS = ['var(--color-primary)', 'var(--color-success)', 'var(--color-accent)', '#8b5cf6', 'var(--color-muted-foreground)']

function ChartCard({ title, className, empty, children }: { title: string; className?: string; empty?: string | false; children: ReactNode }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {empty ? <p className="flex h-56 items-center justify-center text-center text-sm text-muted-foreground">{empty}</p> : children}
      </CardContent>
    </Card>
  )
}

/** Budget against spend for the biggest projects. The axis shows project codes; hovering names the project. */
export function BudgetChart({ data }: { data: BudgetBar[] }) {
  return (
    <ChartCard title="Budget vs Spend — Top 5 Projects" empty={data.length === 0 && 'No projects with a budget yet.'}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="code" tickLine={false} axisLine={false} tick={TICK} />
            <YAxis tickLine={false} axisLine={false} tick={TICK} tickFormatter={formatRupeeAxis} width={64} />
            <Tooltip
              cursor={{ fill: 'var(--color-secondary)' }}
              labelFormatter={(_, payload) => (payload?.[0]?.payload as BudgetBar | undefined)?.name ?? ''}
              formatter={(value) => formatCurrency(Number(value ?? 0))}
              contentStyle={TOOLTIP_STYLE}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="budget" name="Budget" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="spent" name="Spent" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

/** Where the money went, as a donut plus the amounts, for the projects on screen. */
export function CostBreakdownChart({ data }: { data: CostSlice[] }) {
  return (
    <ChartCard title="Cost Breakdown" empty={data.length === 0 && 'No expenses recorded yet.'}>
      <div className="grid items-center gap-4 sm:grid-cols-2">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="amount" nameKey="category" innerRadius={50} outerRadius={78} paddingAngle={2} stroke="none">
                {data.map((slice, i) => (
                  <Cell key={slice.category} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2 text-sm">
          {data.map((slice, i) => (
            <li key={slice.category} className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }} />
              <span className="min-w-0 flex-1 truncate" title={slice.category}>{slice.category}</span>
              <span className="tabular-nums text-muted-foreground" title={formatCurrency(slice.amount)}>{formatRupeeAxis(slice.amount)}</span>
              <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">{slice.percent}%</span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}

/** Tasks per project: done, still to do, and past due. */
export function WorkloadChart({ data }: { data: WorkloadBar[] }) {
  return (
    <ChartCard title="Workload — Top 5 Projects" empty={data.length === 0 && 'No tasks yet.'}>
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
            <Bar dataKey="completed" name="Completed" stackId="tasks" fill="var(--color-success)" maxBarSize={22} />
            <Bar dataKey="remaining" name="Remaining" stackId="tasks" fill="var(--color-primary)" maxBarSize={22} />
            <Bar dataKey="overdue" name="Overdue" stackId="tasks" fill="var(--color-destructive)" maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

/** Workers on site, from each project's latest daily report. */
export function WorkforceChart({ data }: { data: WorkforceBar[] }) {
  return (
    <ChartCard title="Workers on Site — Top 5 Projects" empty={data.length === 0 && 'No daily site reports yet.'}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="code" tickLine={false} axisLine={false} tick={TICK} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={TICK} width={40} />
            <Tooltip
              cursor={{ fill: 'var(--color-secondary)' }}
              labelFormatter={(_, payload) => (payload?.[0]?.payload as WorkforceBar | undefined)?.name ?? ''}
              contentStyle={TOOLTIP_STYLE}
            />
            <Bar dataKey="workers" name="Workers on site" fill="var(--color-success)" radius={[4, 4, 0, 0]} maxBarSize={36} label={{ position: 'top', fontSize: 12 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
