import type { CsvCell } from './csv'

export interface ExportColumn {
  key: string
  header: string
}

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/

/**
 * One cell of an export, from whatever a row holds under a column's key: text and numbers as they are,
 * a date-time as its calendar day, booleans as Yes/No, a list (photos, line items…) as how many it has,
 * and anything else (nested objects, nothing) as blank.
 */
export function exportCell(value: unknown): CsvCell {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value
  if (typeof value === 'string') return ISO_DATE_TIME.test(value) ? value.slice(0, 10) : value
  if (Array.isArray(value)) return value.length
  return ''
}

/** Headers and rows ready for downloadCsv, taking each column's value from the row field of the same key. */
export function rowsForExport<T extends object>(columns: ExportColumn[], rows: T[]): { headers: string[]; rows: CsvCell[][] } {
  return {
    headers: columns.map((c) => c.header),
    rows: rows.map((row) => columns.map((c) => exportCell((row as Record<string, unknown>)[c.key]))),
  }
}
