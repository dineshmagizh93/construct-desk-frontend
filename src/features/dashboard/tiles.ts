import { formatRupeeAxis } from '@/lib/formatAxis'
import type { Monitoring } from './api'

export type TileTone = 'good' | 'bad' | 'neutral'

export interface Tile {
  key: string
  label: string
  value: string
  hint: string
  tone: TileTone
  /** The exact figure, for a hover tooltip, when the value is shortened. */
  title?: string
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
const exact = (n: number) => `₹${n.toLocaleString('en-IN')}`

/**
 * The headline figures after the budget tile, in plain words: how much work is done, what is owed and earned, and how many
 * tasks and projects are late or over budget. A figure the person may not see (no access to payments or tasks) is left out.
 */
export function dashboardTiles(m: Monitoring): Tile[] {
  const { summary, money, tasks } = m
  const tiles: Tile[] = []

  tiles.push({
    key: 'completion',
    label: 'Work Completed',
    value: summary.completionRate === null ? '—' : `${summary.completionRate}%`,
    hint: summary.projectCount === 0 ? 'No projects match' : `Across ${plural(summary.projectCount, 'project')}`,
    tone: 'neutral',
  })

  if (money) {
    tiles.push({
      key: 'pending',
      label: 'Pending Payments',
      value: formatRupeeAxis(money.pendingPayments),
      hint: money.overdueInvoices > 0 ? `${plural(money.overdueInvoices, 'invoice')} overdue` : 'Nothing overdue',
      tone: money.overdueInvoices > 0 ? 'bad' : 'neutral',
      title: exact(money.pendingPayments),
    })
    tiles.push({
      key: 'revenue',
      label: 'Revenue This Month',
      value: formatRupeeAxis(money.revenueThisMonth),
      hint: 'Collected from clients',
      tone: 'neutral',
      title: exact(money.revenueThisMonth),
    })
  }

  if (tasks) {
    tiles.push({
      key: 'tasks',
      label: 'Open Tasks',
      value: String(tasks.open),
      hint: tasks.overdue > 0 ? `${tasks.overdue} overdue` : 'None overdue',
      tone: tasks.overdue > 0 ? 'bad' : 'good',
    })
  }

  tiles.push({
    key: 'behind',
    label: 'Behind Schedule',
    value: String(summary.behindSchedule),
    hint: summary.behindSchedule === 0 ? 'All projects on track' : `${plural(summary.behindSchedule, 'project')} well behind plan`,
    tone: summary.behindSchedule > 0 ? 'bad' : 'good',
  })
  tiles.push({
    key: 'over',
    label: 'Over Budget',
    value: String(summary.overBudget),
    hint: summary.overBudget === 0 ? 'No project over budget' : `${plural(summary.overBudget, 'project')} spending past budget`,
    tone: summary.overBudget > 0 ? 'bad' : 'good',
  })

  return tiles
}
