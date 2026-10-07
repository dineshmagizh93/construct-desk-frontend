import { describe, expect, it } from 'vitest'
import { gstSplit, stateCodeOf, stateNameOf } from './gst'

const KARNATAKA = '29ABCDE1234F1Z5'
const KARNATAKA_2 = '29AAAAA0000A1Z5'
const MAHARASHTRA = '27ABCDE1234F1Z5'

describe('stateCodeOf', () => {
  it('reads the state from a well-formed GSTIN, ignoring case and spaces', () => {
    expect(stateCodeOf(KARNATAKA)).toBe('29')
    expect(stateCodeOf(' 27abcde1234f1z5 ')).toBe('27')
  })

  it('has nothing for blank, malformed or unknown-state numbers', () => {
    expect(stateCodeOf(null)).toBeNull()
    expect(stateCodeOf('')).toBeNull()
    expect(stateCodeOf('29ABCDE1234F1Z')).toBeNull() // too short
    expect(stateCodeOf('ABCDE1234F1Z529')).toBeNull() // wrong shape
    expect(stateCodeOf('99ABCDE1234F1Z5')).toBeNull() // no such state
  })
})

describe('stateNameOf', () => {
  it('writes the place of supply as "code – state"', () => {
    expect(stateNameOf(KARNATAKA)).toBe('29 – Karnataka')
    expect(stateNameOf(MAHARASHTRA)).toBe('27 – Maharashtra')
    expect(stateNameOf('nope')).toBeNull()
  })
})

describe('gstSplit', () => {
  it('splits a same-state supply into equal CGST and SGST', () => {
    expect(gstSplit(18000, KARNATAKA, KARNATAKA_2)).toEqual({ kind: 'intra', cgst: 9000, sgst: 9000 })
  })

  it('keeps the halves adding up to the tax when it is odd', () => {
    const split = gstSplit(1001, KARNATAKA, KARNATAKA_2)
    expect(split.kind).toBe('intra')
    if (split.kind === 'intra') expect(split.cgst + split.sgst).toBe(1001)
  })

  it('charges IGST between states', () => {
    expect(gstSplit(18000, KARNATAKA, MAHARASHTRA)).toEqual({ kind: 'inter', igst: 18000 })
  })

  it('leaves the tax as one figure when either GSTIN is missing or invalid', () => {
    expect(gstSplit(18000, KARNATAKA, null)).toEqual({ kind: 'unknown', gst: 18000 })
    expect(gstSplit(18000, '', KARNATAKA)).toEqual({ kind: 'unknown', gst: 18000 })
    expect(gstSplit(18000, KARNATAKA, 'garbage')).toEqual({ kind: 'unknown', gst: 18000 })
  })
})
