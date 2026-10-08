import { describe, expect, it } from 'vitest'
import { withCategory } from './preferences'

describe('withCategory', () => {
  it('mutes a category when switched off', () => {
    expect(withCategory([], 'finance', false)).toEqual(['finance'])
    expect(withCategory(['stock'], 'finance', false)).toEqual(['stock', 'finance'])
  })

  it('unmutes a category when switched on', () => {
    expect(withCategory(['stock', 'finance'], 'stock', true)).toEqual(['finance'])
    expect(withCategory([], 'stock', true)).toEqual([])
  })

  it('never lists a category twice', () => {
    expect(withCategory(['finance'], 'finance', false)).toEqual(['finance'])
  })

  it('does not change the list it was given', () => {
    const original = ['stock']
    withCategory(original, 'finance', false)
    expect(original).toEqual(['stock'])
  })
})
