import { describe, expect, it } from 'vitest'
import type { Payment } from '@/features/payments/types'
import { clientBilling } from './billing'

const inv = (id: string, projectId: string, amount: number, status: Payment['status'], dueDate: string, retentionPercent = 0): Payment => ({
  id,
  invoiceNumber: id,
  clientName: 'X',
  projectId,
  amount,
  dueDate,
  status,
  lineItems: [],
  retentionPercent,
})

describe('clientBilling', () => {
  const payments = [
    inv('c', 'p1', 300, 'unpaid', '2026-12-01'),
    inv('a', 'p1', 1000, 'paid', '2026-10-01', 10),
    inv('other', 'p9', 99999, 'overdue', '2026-01-01'),
    inv('b', 'p2', 500, 'overdue', '2026-11-01'),
    inv('nodate', 'p2', 50, 'unpaid', ''),
  ]

  it('keeps only invoices on the client\'s projects, soonest due first and undated last', () => {
    expect(clientBilling(payments, ['p1', 'p2']).invoices.map((p) => p.id)).toEqual(['a', 'b', 'c', 'nodate'])
  })

  it('totals them with the retention-aware definitions', () => {
    expect(clientBilling(payments, ['p1', 'p2']).summary).toEqual({
      outstanding: 850, // 300 + 500 + 50
      overdueCount: 1,
      overdueAmount: 500,
      collected: 900, // 1000 paid, less 10% retention still held
      retentionHeld: 100,
    })
  })

  it('has nothing for a client with no linked projects', () => {
    const empty = clientBilling(payments, [])
    expect(empty.invoices).toEqual([])
    expect(empty.summary.outstanding).toBe(0)
  })
})
