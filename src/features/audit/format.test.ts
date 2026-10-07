import { describe, expect, it } from 'vitest'
import { actionPhrase, describeChanges, entityName, fieldName, formatChangeValue } from './format'

describe('actionPhrase', () => {
  it('has plain-English phrases for every action the backend records', () => {
    expect(actionPhrase('create')).toBe('created')
    expect(actionPhrase('update')).toBe('edited')
    expect(actionPhrase('delete')).toBe('deleted')
    expect(actionPhrase('approve')).toBe('approved')
    expect(actionPhrase('mark-paid')).toBe('marked as paid')
    expect(actionPhrase('raise-invoice')).toBe('raised an invoice on')
    expect(actionPhrase('release-retention')).toBe('released retention on')
    expect(actionPhrase('create-po')).toBe('created a purchase order for')
    expect(actionPhrase('payment-added')).toBe('recorded a payment on')
    expect(actionPhrase('export')).toBe('downloaded a full data export of')
  })

  it('words changes to nested items against their parent', () => {
    expect(actionPhrase('line-item-added')).toBe('added a line item to')
    expect(actionPhrase('line-item-changed')).toBe('edited a line item on')
    expect(actionPhrase('photo-removed')).toBe('removed a photo from')
    expect(actionPhrase('attendance-added')).toBe('added an attendance entry to')
    expect(actionPhrase('item-added')).toBe('added an item to')
    expect(actionPhrase('measurement-added')).toBe('added a measurement to')
  })

  it('falls back to a readable version of an unknown action', () => {
    expect(actionPhrase('do-something-new')).toBe('do something new')
  })
})

describe('entityName / fieldName', () => {
  it('splits CamelCase into words', () => {
    expect(entityName('PurchaseRequest')).toBe('purchase request')
    expect(entityName('Expense')).toBe('expense')
    expect(entityName('InventoryItem')).toBe('inventory item')
    expect(fieldName('paidTo')).toBe('Paid to')
    expect(fieldName('amount')).toBe('Amount')
    expect(fieldName('estimatedBudget')).toBe('Estimated budget')
  })
})

describe('formatChangeValue', () => {
  it('shows a dash for empty values', () => {
    expect(formatChangeValue(null)).toBe('—')
    expect(formatChangeValue(undefined)).toBe('—')
    expect(formatChangeValue('')).toBe('—')
  })

  it('groups numbers the Indian way and keeps zero', () => {
    expect(formatChangeValue(1500000)).toBe('15,00,000')
    expect(formatChangeValue(0)).toBe('0')
  })

  it('writes booleans as Yes / No', () => {
    expect(formatChangeValue(true)).toBe('Yes')
    expect(formatChangeValue(false)).toBe('No')
  })

  it('shortens ISO dates without drifting a day for any time zone', () => {
    expect(formatChangeValue('2026-10-07T00:00:00.000Z')).toBe('07 Oct 2026')
    expect(formatChangeValue('2026-12-31T23:59:59Z')).toBe('31 Dec 2026')
  })

  it('turns status codes into words and leaves other text alone', () => {
    expect(formatChangeValue('in_progress')).toBe('in progress')
    expect(formatChangeValue('Acme Developers')).toBe('Acme Developers')
  })
})

describe('describeChanges', () => {
  it('writes one line per changed field', () => {
    expect(describeChanges({ amount: [1000, 1500], paidTo: [null, 'Acme'], status: ['pending', 'approved'] })).toEqual([
      'Amount: 1,000 → 1,500',
      'Paid to: — → Acme',
      'Status: pending → approved',
    ])
  })

  it('returns nothing for no changes', () => {
    expect(describeChanges(null)).toEqual([])
    expect(describeChanges(undefined)).toEqual([])
    expect(describeChanges({})).toEqual([])
  })
})
