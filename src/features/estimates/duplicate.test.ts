import { describe, expect, it } from 'vitest'
import { estimateCopy } from './duplicate'
import type { Estimate } from './types'

const now = new Date('2026-10-09T04:30:00Z') // 10:00 in India

const estimate = (over: Partial<Estimate> = {}): Estimate => ({
  id: 'e1',
  title: 'Tower B structure',
  clientName: 'Acme Developers',
  projectId: 'proj-1',
  projectType: 'Commercial',
  totalAmount: 5_000_000,
  status: 'approved',
  validUntil: '2026-08-01T00:00:00.000Z',
  createdAt: '2026-07-01T00:00:00.000Z',
  contractId: 'contract-1',
  lineItems: [
    { id: 'l1', description: 'Excavation', quantity: 100, unitPrice: 1000, taxPercent: 18 },
    { id: 'l2', description: 'Steel', quantity: 3, unitPrice: 62.75, taxPercent: 18 },
  ],
  ...over,
})

describe('estimateCopy', () => {
  it('copies the client, project, type and line items as a new draft', () => {
    const copy = estimateCopy(estimate(), now)
    expect(copy.estimate).toMatchObject({ title: 'Copy of Tower B structure', clientName: 'Acme Developers', projectId: 'proj-1', projectType: 'Commercial', status: 'draft' })
    expect(copy.lines).toEqual([
      { description: 'Excavation', quantity: 100, unitPrice: 1000, taxPercent: 18 },
      { description: 'Steel', quantity: 3, unitPrice: 62.75, taxPercent: 18 },
    ])
  })

  it('leaves the total to the line items, but keeps a flat estimate\'s amount', () => {
    expect(estimateCopy(estimate(), now).estimate.totalAmount).toBe(0)
    expect(estimateCopy(estimate({ lineItems: [] }), now).estimate.totalAmount).toBe(5_000_000)
  })

  it('does not carry over the contract link, the old status or the old validity', () => {
    const copy = estimateCopy(estimate(), now)
    expect(copy.estimate).not.toHaveProperty('contractId')
    expect(copy.estimate.status).toBe('draft')
    expect(copy.estimate.validUntil).toBe('2026-11-08T00:00:00.000Z') // 30 days from 9 Oct
  })

  it('does not stack "Copy of" prefixes', () => {
    expect(estimateCopy(estimate({ title: 'Copy of Tower B structure' }), now).estimate.title).toBe('Copy of Tower B structure')
  })

  it('counts the 30 days from the Indian date, not the UTC one', () => {
    // 20:00 UTC on the 9th is already the 10th in India
    expect(estimateCopy(estimate(), new Date('2026-10-09T20:00:00Z')).estimate.validUntil).toBe('2026-11-09T00:00:00.000Z')
  })

  it('copes with missing optional details', () => {
    const copy = estimateCopy(estimate({ clientName: '', projectId: undefined, projectType: '', lineItems: undefined as never }), now)
    expect(copy.estimate.clientName).toBeUndefined()
    expect(copy.estimate.projectId).toBeUndefined()
    expect(copy.lines).toEqual([])
  })
})
