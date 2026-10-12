import { formatRupeeAxis } from '@/lib/formatAxis'
import type { MonitoringTotals } from './api'

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

const EMPTY = '—'
const money = (n: number | null) => (n === null ? EMPTY : formatRupeeAxis(n))
const signedMoney = (n: number | null) => (n === null ? EMPTY : n > 0 ? `+${formatRupeeAxis(n)}` : formatRupeeAxis(n))
const exact = (n: number | null) => (n === null ? undefined : `₹${n.toLocaleString('en-IN')}`)

/** The index tiles, in the order shown: schedule and cost variance, completion, the two performance indexes, and the forecast. */
export function monitoringTiles(t: MonitoringTotals): Tile[] {
  const sv = t.scheduleVariance
  const cv = t.costVariance
  const spi = t.schedulePerformanceIndex
  const cpi = t.costPerformanceIndex
  const eac = t.estimateAtCompletion

  return [
    {
      key: 'scheduleVariance',
      label: 'Schedule Variance',
      value: signedMoney(sv),
      hint: sv === null ? 'Needs project start and end dates' : sv >= 0 ? 'Ahead of plan' : 'Behind plan',
      tone: sv === null ? 'neutral' : sv >= 0 ? 'good' : 'bad',
      title: exact(sv),
    },
    {
      key: 'costVariance',
      label: 'Cost Variance',
      value: signedMoney(cv),
      hint: cv === null ? 'Nothing spent yet' : cv >= 0 ? 'Under budget for the work done' : 'Over budget for the work done',
      tone: cv === null ? 'neutral' : cv >= 0 ? 'good' : 'bad',
      title: exact(cv),
    },
    {
      key: 'completionRate',
      label: 'Project Completion Rate',
      value: t.completionRate === null ? EMPTY : `${t.completionRate}%`,
      hint: 'Weighted by project budget',
      tone: 'neutral',
    },
    {
      key: 'cpi',
      label: 'Cost Performance Index',
      value: cpi === null ? EMPTY : cpi.toFixed(2),
      hint: cpi === null ? 'Nothing spent yet' : cpi >= 1 ? 'Work is costing less than planned' : 'Work is costing more than planned',
      tone: cpi === null ? 'neutral' : cpi >= 1 ? 'good' : 'bad',
    },
    {
      key: 'spi',
      label: 'Schedule Performance Index',
      value: spi === null ? EMPTY : spi.toFixed(2),
      hint: spi === null ? 'Needs project start and end dates' : spi >= 1 ? 'Progress is ahead of the timeline' : 'Progress is behind the timeline',
      tone: spi === null ? 'neutral' : spi >= 1 ? 'good' : 'bad',
    },
    {
      key: 'eac',
      label: 'Estimate at Completion',
      value: money(eac),
      hint: eac === null ? 'Needs project budgets' : `Budget ${money(t.budget)}`,
      tone: eac === null ? 'neutral' : eac > t.budget ? 'bad' : 'neutral',
      title: exact(eac),
    },
  ]
}
