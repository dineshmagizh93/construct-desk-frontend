import { formatRupeeAxis } from '@/lib/formatAxis'
import { formatDate } from '@/lib/utils'
import type { DashboardCards } from './api'

/** good = fine, warn = needs doing soon, bad = overdue or late, neutral = just information. */
export type CardTone = 'good' | 'warn' | 'bad' | 'neutral'
export type CardIcon = 'leads' | 'projects' | 'tasks' | 'site' | 'invoices' | 'expenses' | 'stock' | 'equipment'

export interface DashboardCard {
  key: string
  label: string
  value: string
  hint: string
  tone: CardTone
  /** The module this card opens when clicked. */
  to: string
  icon: CardIcon
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/**
 * The module cards, in the order shown. Each is a count taken from a module's own records, says in a few plain words what
 * to look at, and links to that module. A card for a module the person cannot open is left out. Only the invoices card
 * carries a money figure: what is owed is the one amount a manager needs at a glance.
 */
export function dashboardCards(c: DashboardCards): DashboardCard[] {
  const cards: DashboardCard[] = []

  if (c.leads) {
    cards.push({
      key: 'leads',
      label: 'Leads in Pipeline',
      value: String(c.leads.pipeline),
      hint: c.leads.quiet > 0 ? `${plural(c.leads.quiet, 'lead')} not followed up in a week` : 'All followed up',
      tone: c.leads.quiet > 0 ? 'warn' : 'good',
      to: '/leads',
      icon: 'leads',
    })
  }

  if (c.projects) {
    cards.push({
      key: 'projects',
      label: 'Running Projects',
      value: String(c.projects.running),
      hint: c.projects.behind > 0 ? `${c.projects.behind} behind schedule` : c.projects.total === 0 ? 'No projects yet' : `${plural(c.projects.total, 'project')} in total`,
      tone: c.projects.behind > 0 ? 'bad' : 'neutral',
      to: '/projects',
      icon: 'projects',
    })
  }

  if (c.tasks) {
    cards.push({
      key: 'tasks',
      label: 'Open Tasks',
      value: String(c.tasks.open),
      hint: c.tasks.overdue > 0 ? `${c.tasks.overdue} overdue` : 'None overdue',
      tone: c.tasks.overdue > 0 ? 'bad' : 'good',
      to: '/tasks',
      icon: 'tasks',
    })
  }

  if (c.siteProgress) {
    cards.push({
      key: 'site',
      label: 'Site Reports This Week',
      value: String(c.siteProgress.reportsThisWeek),
      hint: c.siteProgress.lastReport ? `Last report ${formatDate(c.siteProgress.lastReport)}` : 'No site reports yet',
      tone: 'neutral',
      to: '/site-progress',
      icon: 'site',
    })
  }

  if (c.invoices) {
    cards.push({
      key: 'invoices',
      label: 'Overdue Invoices',
      value: String(c.invoices.overdue),
      hint:
        c.invoices.overdue > 0
          ? `${formatRupeeAxis(c.invoices.overdueAmount)} overdue`
          : c.invoices.toCollect > 0
            ? `${formatRupeeAxis(c.invoices.toCollect)} still to collect`
            : 'Nothing pending',
      tone: c.invoices.overdue > 0 ? 'bad' : 'good',
      to: '/payments',
      icon: 'invoices',
    })
  }

  if (c.expenses) {
    cards.push({
      key: 'expenses',
      label: 'Expenses to Approve',
      value: String(c.expenses.awaitingApproval),
      hint: c.expenses.awaitingApproval > 0 ? 'Waiting for your decision' : 'Nothing waiting',
      tone: c.expenses.awaitingApproval > 0 ? 'warn' : 'good',
      to: '/expenses',
      icon: 'expenses',
    })
  }

  if (c.stock) {
    cards.push({
      key: 'stock',
      label: 'Low Stock Items',
      value: String(c.stock.low),
      hint: c.stock.total === 0 ? 'No materials added yet' : `of ${plural(c.stock.total, 'item')}`,
      tone: c.stock.low > 0 ? 'warn' : 'good',
      to: '/inventory',
      icon: 'stock',
    })
  }

  if (c.equipment) {
    cards.push({
      key: 'equipment',
      label: 'Equipment Due for Service',
      value: String(c.equipment.dueForService),
      hint: c.equipment.total === 0 ? 'No equipment added yet' : `of ${plural(c.equipment.total, 'machine')}`,
      tone: c.equipment.dueForService > 0 ? 'warn' : 'good',
      to: '/equipment',
      icon: 'equipment',
    })
  }

  return cards
}
