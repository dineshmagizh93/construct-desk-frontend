import { describe, expect, it } from 'vitest'
import { safeLink } from './link'

describe('safeLink', () => {
  it('accepts plain in-app paths', () => {
    expect(safeLink('/payments')).toBe('/payments')
    expect(safeLink('/projects/abc-123')).toBe('/projects/abc-123')
    expect(safeLink('/tasks?status=open')).toBe('/tasks?status=open')
  })

  it('has nothing for a missing link', () => {
    expect(safeLink(null)).toBeNull()
    expect(safeLink(undefined)).toBeNull()
    expect(safeLink('')).toBeNull()
  })

  it('refuses anything that could leave the app', () => {
    expect(safeLink('//evil.example.com')).toBeNull()
    expect(safeLink('https://evil.example.com')).toBeNull()
    expect(safeLink('javascript:alert(1)')).toBeNull()
    expect(safeLink('payments')).toBeNull()
    expect(safeLink('/\\evil.example.com')).toBeNull()
    expect(safeLink('/pay ments')).toBeNull()
  })
})
