export const REVENUE_TREND = [
  { month: 'Feb', revenue: 2840000, expense: 1920000 },
  { month: 'Mar', revenue: 3120000, expense: 2100000 },
  { month: 'Apr', revenue: 2960000, expense: 2350000 },
  { month: 'May', revenue: 3480000, expense: 2280000 },
  { month: 'Jun', revenue: 3760000, expense: 2600000 },
  { month: 'Jul', revenue: 4020000, expense: 2740000 },
]

export const PROJECT_STATUS_BREAKDOWN = [
  { name: 'In Progress', value: 8, color: 'var(--color-warning)' },
  { name: 'Planning', value: 3, color: 'var(--color-muted-foreground)' },
  { name: 'Completed', value: 12, color: 'var(--color-success)' },
  { name: 'On Hold', value: 2, color: 'var(--color-destructive)' },
]

export interface ActivityEvent {
  id: string
  title: string
  description: string
  timestamp: string
  type: 'lead' | 'payment' | 'task' | 'site' | 'contract'
}

export const RECENT_ACTIVITY: ActivityEvent[] = [
  {
    id: 'act-1',
    title: 'New lead captured',
    description: 'Vikram Singh — 3BHK Villa Construction',
    timestamp: '2026-07-04T08:30:00.000Z',
    type: 'lead',
  },
  {
    id: 'act-2',
    title: 'Payment received',
    description: '₹4,50,000 from Greenfield Developers',
    timestamp: '2026-07-03T15:10:00.000Z',
    type: 'payment',
  },
  {
    id: 'act-3',
    title: 'Site progress updated',
    description: 'Riverside Towers — Block C at 68% completion',
    timestamp: '2026-07-03T12:05:00.000Z',
    type: 'site',
  },
  {
    id: 'act-4',
    title: 'Task completed',
    description: 'Electrical rough-in — Sunrise Residency',
    timestamp: '2026-07-02T17:40:00.000Z',
    type: 'task',
  },
  {
    id: 'act-5',
    title: 'Contract signed',
    description: 'PO-2091 approved for steel rebar supply',
    timestamp: '2026-07-01T11:20:00.000Z',
    type: 'contract',
  },
]

export const DASHBOARD_KPIS = {
  activeProjects: 11,
  activeProjectsTrend: '+2 this month',
  totalRevenue: 40200000,
  revenueTrend: '+6.9% vs last month',
  pendingPayments: 6850000,
  pendingPaymentsTrend: '-3.2% vs last month',
  openTasks: 47,
  openTasksTrend: '+5 this week',
  leadsInPipeline: 23,
  leadsInPipelineTrend: '+4 new this week',
  lowStockItems: 3,
  lowStockItemsTrend: 'Needs attention',
}
