import { describe, expect, it } from 'vitest'
import { invoiceBodyHtml } from './invoiceDocument'
import type { Payment } from './types'

const company = { name: 'Skyline Constructions', address: '12 MG Road, Bengaluru', gstNumber: '29ABCDE1234F1Z5' }

const invoice = (over: Partial<Payment> = {}): Payment => ({
  id: 'p1',
  invoiceNumber: 'INV-2026-007',
  clientName: 'Acme Developers',
  projectId: 'proj',
  amount: 0,
  dueDate: '2026-11-06T00:00:00.000Z',
  status: 'unpaid',
  lineItems: [],
  retentionPercent: 0,
  ...over,
})

describe('invoiceBodyHtml', () => {
  it('shows letterhead, number, client, project and due date', () => {
    const html = invoiceBodyHtml(invoice({ amount: 50_000 }), company, 'Prestige Towers')
    expect(html).toContain('Skyline Constructions')
    expect(html).toContain('GSTIN: 29ABCDE1234F1Z5')
    expect(html).toContain('INV-2026-007')
    expect(html).toContain('Acme Developers')
    expect(html).toContain('Prestige Towers')
    expect(html).toContain('06 Nov 2026')
  })

  it('prints a flat invoice as a single amount with the amount in words', () => {
    const html = invoiceBodyHtml(invoice({ amount: 45_250 }), company)
    expect(html).toContain('₹45,250')
    expect(html).toContain('Rupees Forty Five Thousand Two Hundred Fifty Only')
    expect(html).not.toContain('<th>GST')
  })

  it('prints itemised invoices with subtotal, GST and total from the lines', () => {
    const html = invoiceBodyHtml(
      invoice({ amount: 999, lineItems: [{ id: 'l1', description: 'Excavation', quantity: 100, unitPrice: 1000, taxPercent: 18 }] }),
      company,
    )
    expect(html).toContain('Subtotal')
    expect(html).toContain('₹1,00,000')
    expect(html).toContain('₹18,000')
    expect(html).toContain('₹1,18,000')
    // The lines are the source of truth — the stale flat amount must not leak in.
    expect(html).not.toContain('₹999')
    expect(html).toContain('Rupees One Lakh Eighteen Thousand Only')
  })

  it('shows retention held and the net payable now', () => {
    const html = invoiceBodyHtml(invoice({ amount: 1_000_000, retentionPercent: 5 }), company)
    expect(html).toContain('Less retention held (5%)')
    expect(html).toContain('− ₹50,000')
    expect(html).toContain('Net payable now')
    expect(html).toContain('₹9,50,000')
    expect(html).toContain('until the defects liability period ends')
  })

  it('notes when retention has been released', () => {
    const html = invoiceBodyHtml(invoice({ amount: 1_000_000, retentionPercent: 5, retentionReleasedAt: '2026-12-01T00:00:00.000Z' }), company)
    expect(html).toContain('was released on 01 Dec 2026')
  })

  it('has no retention lines on an ordinary invoice', () => {
    const html = invoiceBodyHtml(invoice({ amount: 1000 }), company)
    expect(html).not.toContain('retention')
    expect(html).not.toContain('Net payable')
  })

  it('escapes every user-entered field', () => {
    const evil = '<script>alert(1)</script>'
    const html = invoiceBodyHtml(
      invoice({ amount: 1, clientName: evil, invoiceNumber: evil, paymentMethod: evil, lineItems: [{ id: 'l', description: evil, quantity: 1, unitPrice: 1, taxPercent: 0 }] }),
      { name: evil, address: evil },
      evil,
    )
    expect(html).not.toContain('<script')
    expect(html).toContain('&lt;script&gt;')
  })
})
