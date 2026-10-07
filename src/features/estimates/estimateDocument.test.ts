import { describe, expect, it } from 'vitest'
import { estimateBodyHtml } from './estimateDocument'
import type { Estimate } from './types'

const company = { name: 'Skyline Constructions', phone: '98440 12345' }

const estimate = (over: Partial<Estimate> = {}): Estimate => ({
  id: 'e1',
  title: 'Warehouse — Phase 1',
  clientName: 'Acme Logistics',
  projectType: 'Industrial',
  totalAmount: 0,
  status: 'approved',
  validUntil: '2026-12-31T00:00:00.000Z',
  createdAt: '2026-10-07T00:00:00.000Z',
  lineItems: [],
  ...over,
})

describe('estimateBodyHtml', () => {
  it('shows letterhead, title, client, validity and status', () => {
    const html = estimateBodyHtml(estimate({ totalAmount: 500_000 }), company)
    expect(html).toContain('Estimate / Quotation')
    expect(html).toContain('Skyline Constructions')
    expect(html).toContain('Warehouse — Phase 1')
    expect(html).toContain('Acme Logistics')
    expect(html).toContain('31 Dec 2026')
    expect(html).toContain('approved')
  })

  it('prints a flat estimate as one total with words', () => {
    const html = estimateBodyHtml(estimate({ totalAmount: 4_50_00_000 }), company)
    expect(html).toContain('₹4,50,00,000')
    expect(html).toContain('Rupees Four Crore Fifty Lakh Only')
  })

  it('prints the BOQ with GST and uses the lines, not the stored total, when itemised', () => {
    const html = estimateBodyHtml(
      estimate({ totalAmount: 1, lineItems: [{ id: 'l1', description: 'Steel structure', quantity: 50, unitPrice: 20_000, taxPercent: 18 }] }),
      company,
    )
    expect(html).toContain('Steel structure')
    expect(html).toContain('₹10,00,000')
    expect(html).toContain('₹1,80,000')
    expect(html).toContain('₹11,80,000')
    expect(html).toContain('Estimated total')
  })

  it('says it is not a tax invoice', () => {
    expect(estimateBodyHtml(estimate({ totalAmount: 1 }), company)).toContain('not a tax invoice')
  })

  it('omits blank fields and escapes user text', () => {
    const evil = '<img src=x onerror=alert(1)>'
    const html = estimateBodyHtml(estimate({ title: evil, clientName: evil, projectType: '', validUntil: '', totalAmount: 1 }), { name: evil })
    expect(html).not.toContain('<img')
    expect(html).not.toContain('Project type')
    expect(html).not.toContain('Valid until')
  })
})
