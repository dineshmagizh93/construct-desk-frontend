import { describe, expect, it } from 'vitest'
import type { Monitoring } from './api'
import { dashboardTiles } from './tiles'

const monitoring = (over: Partial<Monitoring> = {}): Monitoring => ({
  summary: { projectCount: 9, budget: 220_150_000, spent: 2_026_000, utilizedPercent: 0.9, completionRate: 29.9, behindSchedule: 3, overBudget: 0 },
  tasks: { open: 9, overdue: 9 },
  money: { pendingPayments: 24_622_500, overdueInvoices: 6, overdueAmount: 24_622_500, revenueThisMonth: 0 },
  trend: [],
  budgetByProject: [],
  costBreakdown: [],
  workload: [],
  ...over,
})
const byKey = (m: Monitoring) => Object.fromEntries(dashboardTiles(m).map((t) => [t.key, t]))

describe('dashboardTiles', () => {
  it('says things in plain words with the right colours', () => {
    const t = byKey(monitoring())
    expect(t.completion).toMatchObject({ value: '29.9%', hint: 'Across 9 projects', tone: 'neutral' })
    expect(t.pending).toMatchObject({ value: '₹2.5 Cr', hint: '6 invoices overdue', tone: 'bad', title: '₹2,46,22,500' })
    expect(t.revenue).toMatchObject({ value: '₹0', hint: 'Collected from clients' })
    expect(t.tasks).toMatchObject({ value: '9', hint: '9 overdue', tone: 'bad' })
    expect(t.behind).toMatchObject({ value: '3', hint: '3 projects well behind plan', tone: 'bad' })
    expect(t.over).toMatchObject({ value: '0', hint: 'No project over budget', tone: 'good' })
  })

  it('reads well when everything is fine', () => {
    const t = byKey(monitoring({
      summary: { projectCount: 1, budget: 100, spent: 10, utilizedPercent: 10, completionRate: 50, behindSchedule: 0, overBudget: 0 },
      tasks: { open: 2, overdue: 0 },
      money: { pendingPayments: 0, overdueInvoices: 0, overdueAmount: 0, revenueThisMonth: 1_500_000 },
    }))
    expect(t.completion.hint).toBe('Across 1 project')
    expect(t.pending).toMatchObject({ value: '₹0', hint: 'Nothing overdue', tone: 'neutral' })
    expect(t.revenue.value).toBe('₹15L')
    expect(t.tasks).toMatchObject({ hint: 'None overdue', tone: 'good' })
    expect(t.behind).toMatchObject({ hint: 'All projects on track', tone: 'good' })
  })

  it('uses singular wording for one overdue invoice or one project', () => {
    const t = byKey(monitoring({
      summary: { projectCount: 3, budget: 1, spent: 2, utilizedPercent: 200, completionRate: 10, behindSchedule: 1, overBudget: 1 },
      money: { pendingPayments: 5000, overdueInvoices: 1, overdueAmount: 5000, revenueThisMonth: 0 },
    }))
    expect(t.pending.hint).toBe('1 invoice overdue')
    expect(t.behind.hint).toBe('1 project well behind plan')
    expect(t.over.hint).toBe('1 project spending past budget')
  })

  it('leaves out what the person may not see', () => {
    const keys = dashboardTiles(monitoring({ money: null, tasks: null })).map((t) => t.key)
    expect(keys).toEqual(['completion', 'behind', 'over'])
  })

  it('shows a dash and says so when no project matches', () => {
    const t = byKey(monitoring({ summary: { projectCount: 0, budget: 0, spent: 0, utilizedPercent: null, completionRate: null, behindSchedule: 0, overBudget: 0 } }))
    expect(t.completion).toMatchObject({ value: '—', hint: 'No projects match' })
  })
})
