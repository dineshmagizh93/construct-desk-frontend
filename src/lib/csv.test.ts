import { describe, expect, it } from 'vitest'
import { csvCell, toCsv } from './csv'

describe('csvCell', () => {
  it('leaves plain text alone', () => {
    expect(csvCell('Cement')).toBe('Cement')
  })

  it('quotes fields containing commas, quotes or newlines, doubling inner quotes', () => {
    expect(csvCell('Shakti, Steel')).toBe('"Shakti, Steel"')
    expect(csvCell('12" pipe')).toBe('"12"" pipe"')
    expect(csvCell('line1\nline2')).toBe('"line1\nline2"')
  })

  it('writes null and undefined as empty', () => {
    expect(csvCell(null)).toBe('')
    expect(csvCell(undefined)).toBe('')
  })

  it('keeps zero, false and negative numbers as they are', () => {
    expect(csvCell(0)).toBe('0')
    expect(csvCell(false)).toBe('false')
    expect(csvCell(-500)).toBe('-500')
  })

  it('neutralises text a spreadsheet would run as a formula', () => {
    expect(csvCell('=SUM(A1:A9)')).toBe("'=SUM(A1:A9)")
    expect(csvCell('+91 98440')).toBe("'+91 98440")
    expect(csvCell('-cmd')).toBe("'-cmd")
    expect(csvCell('@import')).toBe("'@import")
  })

  it('quotes after neutralising when the text also needs quoting', () => {
    expect(csvCell('=A1,B1')).toBe('"\'=A1,B1"')
  })

  it('preserves the rupee sign', () => {
    expect(csvCell('₹5,000')).toBe('"₹5,000"')
  })
})

describe('toCsv', () => {
  it('joins headers and rows with CRLF', () => {
    expect(toCsv(['A', 'B'], [[1, 'x,y'], [2, '']])).toBe('A,B\r\n1,"x,y"\r\n2,')
  })

  it('writes just the header row when there is no data', () => {
    expect(toCsv(['A', 'B'], [])).toBe('A,B')
  })
})
