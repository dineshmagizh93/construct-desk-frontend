import { describe, expect, it } from 'vitest'
import { countLabel, describeCounts, exportFileName } from './exportData'

describe('countLabel', () => {
  it('turns a key into a readable name', () => {
    expect(countLabel('leads')).toBe('Leads')
    expect(countLabel('siteProgress')).toBe('Site progress')
    expect(countLabel('purchaseRequests')).toBe('Purchase requests')
  })
})

describe('describeCounts', () => {
  it('lists only kinds that hold something, largest first', () => {
    expect(describeCounts({ leads: 12, tasks: 0, payments: 8, siteProgress: 12 })).toBe('Leads 12 · Site progress 12 · Payments 8')
  })

  it('is empty when nothing was exported', () => {
    expect(describeCounts({ leads: 0 })).toBe('')
    expect(describeCounts({})).toBe('')
  })
})

describe('exportFileName', () => {
  it('is dated', () => {
    expect(exportFileName(new Date('2026-10-07T09:00:00Z'))).toBe('constructdesk-data-2026-10-07.json')
  })
})
