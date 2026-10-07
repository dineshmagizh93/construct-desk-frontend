import { describe, expect, it } from 'vitest'
import { searchRecords, type SearchRecord } from './search'

const rec = (kind: SearchRecord['kind'], id: string, label: string, keywords: string[] = [], sublabel?: string): SearchRecord => ({
  kind,
  id,
  label,
  sublabel,
  to: `/${kind}/${id}`,
  keywords,
})

const records = [
  rec('project', 'p1', 'Skyline Tower', ['PRJ-0001', 'Prestige Developers']),
  rec('project', 'p2', 'Lakeview Villas', ['PRJ-0002']),
  rec('client', 'c1', 'Prestige Developers', ['arvind@prestige.in', '+91 98440 11111']),
  rec('lead', 'l1', 'Meera Rao', ['meera@example.com']),
  rec('task', 't1', 'Order skyline glazing'),
  rec('invoice', 'i1', 'INV-2026-004', ['Prestige Developers']),
  rec('vendor', 'v1', 'Bengaluru Steel Traders', ['sales@blrsteel.in']),
]

describe('searchRecords', () => {
  it('ignores queries that are too short', () => {
    expect(searchRecords(records, '')).toEqual([])
    expect(searchRecords(records, 's')).toEqual([])
    expect(searchRecords(records, '  ')).toEqual([])
  })

  it('matches case-insensitively on the label', () => {
    expect(searchRecords(records, 'VILLAS').map((h) => h.id)).toEqual(['p2'])
  })

  it('matches on codes, emails and phone numbers too', () => {
    expect(searchRecords(records, 'prj-0002').map((h) => h.id)).toEqual(['p2'])
    expect(searchRecords(records, 'blrsteel').map((h) => h.id)).toEqual(['v1'])
    expect(searchRecords(records, '98440').map((h) => h.id)).toEqual(['c1'])
  })

  it('groups by kind in a fixed order, with label-prefix matches before the rest', () => {
    const hits = searchRecords(records, 'sky')
    // project "Skyline Tower" starts with sky (rank 0); task "Order skyline glazing" only contains it (rank 1)
    expect(hits.map((h) => [h.kind, h.id, h.rank])).toEqual([
      ['project', 'p1', 0],
      ['task', 't1', 1],
    ])
  })

  it('finds a client name across kinds (projects by keyword, client and invoice by label/keyword)', () => {
    const hits = searchRecords(records, 'prestige')
    expect(hits.map((h) => h.kind)).toEqual(['project', 'client', 'invoice'])
    expect(hits.find((h) => h.kind === 'client')?.rank).toBe(0)
  })

  it('caps each kind', () => {
    const many = Array.from({ length: 12 }, (_, i) => rec('lead', `l${i}`, `Rao ${String(i).padStart(2, '0')}`))
    expect(searchRecords(many, 'rao', 5)).toHaveLength(5)
    expect(searchRecords(many, 'rao', 5).map((h) => h.id)).toEqual(['l0', 'l1', 'l2', 'l3', 'l4'])
  })
})
