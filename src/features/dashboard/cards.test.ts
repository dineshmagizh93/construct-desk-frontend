import { describe, expect, it } from 'vitest'
import type { DashboardCards } from './api'
import { dashboardCards } from './cards'

const full = (over: Partial<DashboardCards> = {}): DashboardCards => ({
  leads: { pipeline: 8, quiet: 8 },
  projects: { running: 4, onHold: 1, behind: 3, total: 9 },
  tasks: { open: 9, overdue: 9 },
  siteProgress: { reportsThisWeek: 0, lastReport: '2026-08-24T12:15:28.297Z' },
  invoices: { overdue: 6, overdueAmount: 24_622_500, toCollect: 24_622_500 },
  expenses: { awaitingApproval: 4 },
  stock: { low: 1, total: 12 },
  equipment: { dueForService: 8, total: 10 },
  ...over,
})
const byKey = (c: DashboardCards) => Object.fromEntries(dashboardCards(c).map((card) => [card.key, card]))

describe('dashboardCards', () => {
  it('offers one card per module, in order, each linking to its module', () => {
    const cards = dashboardCards(full())
    expect(cards.map((c) => [c.key, c.to])).toEqual([
      ['leads', '/leads'],
      ['projects', '/projects'],
      ['tasks', '/tasks'],
      ['site', '/site-progress'],
      ['invoices', '/payments'],
      ['expenses', '/expenses'],
      ['stock', '/inventory'],
      ['equipment', '/equipment'],
    ])
  })

  it('says in plain words what to look at, and colours what needs action', () => {
    const c = byKey(full())
    expect(c.leads).toMatchObject({ value: '8', hint: '8 leads not followed up in a week', tone: 'warn' })
    expect(c.projects).toMatchObject({ value: '4', hint: '3 behind schedule', tone: 'bad' })
    expect(c.tasks).toMatchObject({ value: '9', hint: '9 overdue', tone: 'bad' })
    expect(c.invoices).toMatchObject({ value: '6', hint: '₹2.5 Cr overdue', tone: 'bad' })
    expect(c.expenses).toMatchObject({ value: '4', hint: 'Waiting for your decision', tone: 'warn' })
    expect(c.stock).toMatchObject({ value: '1', hint: 'of 12 items', tone: 'warn' })
    expect(c.equipment).toMatchObject({ value: '8', hint: 'of 10 machines', tone: 'warn' })
  })

  it('shows the last site report date, or says there are none', () => {
    expect(byKey(full()).site.hint).toBe('Last report 24 Aug 2026')
    expect(byKey(full({ siteProgress: { reportsThisWeek: 3, lastReport: null } })).site.hint).toBe('No site reports yet')
  })

  it('reads well when everything is in order', () => {
    const c = byKey(full({
      leads: { pipeline: 5, quiet: 0 },
      projects: { running: 2, onHold: 0, behind: 0, total: 1 },
      tasks: { open: 3, overdue: 0 },
      invoices: { overdue: 0, overdueAmount: 0, toCollect: 1_500_000 },
      expenses: { awaitingApproval: 0 },
      stock: { low: 0, total: 1 },
      equipment: { dueForService: 0, total: 0 },
    }))
    expect(c.leads).toMatchObject({ hint: 'All followed up', tone: 'good' })
    expect(c.projects).toMatchObject({ hint: '1 project in total', tone: 'neutral' })
    expect(c.tasks).toMatchObject({ hint: 'None overdue', tone: 'good' })
    expect(c.invoices).toMatchObject({ value: '0', hint: '₹15L still to collect', tone: 'good' })
    expect(c.expenses).toMatchObject({ hint: 'Nothing waiting', tone: 'good' })
    expect(c.stock.hint).toBe('of 1 item')
    expect(c.equipment.hint).toBe('No equipment added yet')
  })

  it('says nothing is pending when there are no invoices to collect', () => {
    expect(byKey(full({ invoices: { overdue: 0, overdueAmount: 0, toCollect: 0 } })).invoices.hint).toBe('Nothing pending')
  })

  it('leaves out a card for a module the person cannot open', () => {
    const cards = dashboardCards(full({ invoices: null, expenses: null, stock: null, equipment: null, siteProgress: null }))
    expect(cards.map((c) => c.key)).toEqual(['leads', 'projects', 'tasks'])
  })

  it('has no cards at all for someone with access to none of the modules', () => {
    const none: DashboardCards = { leads: null, projects: null, tasks: null, siteProgress: null, invoices: null, expenses: null, stock: null, equipment: null }
    expect(dashboardCards(none)).toEqual([])
  })

  it('carries a money figure only on the invoices card', () => {
    const withRupee = dashboardCards(full()).filter((c) => /₹/.test(c.value + c.hint)).map((c) => c.key)
    expect(withRupee).toEqual(['invoices'])
  })
})
