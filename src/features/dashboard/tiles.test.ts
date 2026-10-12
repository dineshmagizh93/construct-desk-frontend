import { describe, expect, it } from 'vitest'
import type { MonitoringTotals } from './api'
import { monitoringTiles } from './tiles'

const totals = (over: Partial<MonitoringTotals> = {}): MonitoringTotals => ({
  budget: 30_000_000, spent: 7_000_000, utilizedPercent: 23.3, completionRate: 30, scheduleVariance: -6_000_000,
  schedulePerformanceIndex: 0.6, costVariance: 2_000_000, costPerformanceIndex: 1.29, estimateAtCompletion: 23_000_000, ...over,
})
const byKey = (t: MonitoringTotals) => Object.fromEntries(monitoringTiles(t).map((tile) => [tile.key, tile]))

describe('monitoringTiles', () => {
  it('reads behind-schedule but under-budget figures correctly', () => {
    const tiles = byKey(totals())
    expect(tiles.scheduleVariance).toMatchObject({ value: '-₹60L', hint: 'Behind plan', tone: 'bad' })
    expect(tiles.costVariance).toMatchObject({ value: '+₹20L', tone: 'good' })
    expect(tiles.completionRate.value).toBe('30%')
    expect(tiles.cpi).toMatchObject({ value: '1.29', tone: 'good' })
    expect(tiles.spi).toMatchObject({ value: '0.60', tone: 'bad' })
  })

  it('shows the forecast against the budget, red only when it is higher', () => {
    expect(byKey(totals()).eac).toMatchObject({ value: '₹2.3 Cr', hint: 'Budget ₹3 Cr', tone: 'neutral' })
    expect(byKey(totals({ estimateAtCompletion: 36_000_000 })).eac.tone).toBe('bad')
  })

  it('treats exactly on plan as good, not behind', () => {
    const tiles = byKey(totals({ scheduleVariance: 0, schedulePerformanceIndex: 1, costVariance: 0, costPerformanceIndex: 1 }))
    expect(tiles.scheduleVariance).toMatchObject({ value: '₹0', tone: 'good' })
    expect(tiles.cpi.tone).toBe('good')
    expect(tiles.spi.tone).toBe('good')
  })

  it('shows a dash and says why when there is nothing to measure', () => {
    const tiles = byKey(totals({ scheduleVariance: null, schedulePerformanceIndex: null, costVariance: null, costPerformanceIndex: null, estimateAtCompletion: null, completionRate: null }))
    expect(tiles.scheduleVariance).toMatchObject({ value: '—', hint: 'Needs project start and end dates', tone: 'neutral' })
    expect(tiles.costVariance).toMatchObject({ value: '—', hint: 'Nothing spent yet', tone: 'neutral' })
    expect(tiles.cpi.value).toBe('—')
    expect(tiles.spi.value).toBe('—')
    expect(tiles.eac).toMatchObject({ value: '—', tone: 'neutral' })
    expect(tiles.completionRate.value).toBe('—')
  })

  it('keeps the exact amount for a tooltip', () => {
    expect(byKey(totals()).costVariance.title).toBe('₹20,00,000')
    expect(byKey(totals({ costVariance: null })).costVariance.title).toBeUndefined()
  })
})
