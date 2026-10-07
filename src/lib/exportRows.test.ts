import { describe, expect, it } from 'vitest'
import { exportCell, rowsForExport } from './exportRows'

describe('exportCell', () => {
  it('passes text and numbers through', () => {
    expect(exportCell('Skyline Tower')).toBe('Skyline Tower')
    expect(exportCell(1500000)).toBe(1500000)
    expect(exportCell(0)).toBe(0)
  })

  it('turns date-times into the calendar day, and leaves other text alone', () => {
    expect(exportCell('2026-10-07T00:00:00.000Z')).toBe('2026-10-07')
    expect(exportCell('2026-10-07')).toBe('2026-10-07')
    expect(exportCell('in_progress')).toBe('in_progress')
  })

  it('writes booleans as Yes/No and lists as their length', () => {
    expect(exportCell(true)).toBe('Yes')
    expect(exportCell(false)).toBe('No')
    expect(exportCell([1, 2, 3])).toBe(3)
    expect(exportCell([])).toBe(0)
  })

  it('leaves missing values and nested objects blank', () => {
    expect(exportCell(null)).toBe('')
    expect(exportCell(undefined)).toBe('')
    expect(exportCell({ id: 'x' })).toBe('')
  })
})

describe('rowsForExport', () => {
  it('takes each column from the row field with the same key, in column order', () => {
    const columns = [
      { key: 'name', header: 'Name' },
      { key: 'budget', header: 'Budget' },
      { key: 'photos', header: 'Photos' },
      { key: 'missing', header: 'Nothing' },
    ]
    const rows = [{ name: 'Tower', budget: 100, photos: [1, 2], ignored: 'x' }]
    expect(rowsForExport(columns, rows)).toEqual({ headers: ['Name', 'Budget', 'Photos', 'Nothing'], rows: [['Tower', 100, 2, '']] })
  })
})
