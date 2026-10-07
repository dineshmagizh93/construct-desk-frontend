export type CsvCell = string | number | boolean | null | undefined

/**
 * One CSV field. Text that starts with = + - @ (or a tab/CR) is prefixed with an apostrophe so a
 * spreadsheet shows it as text instead of running it as a formula — vendor names, notes and the
 * like are user-entered and exported to files people open in Excel. Real numbers are left alone,
 * so negative amounts stay numeric.
 */
export function csvCell(value: CsvCell): string {
  if (value === null || value === undefined) return ''
  let text = String(value)
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(headers: string[], rows: CsvCell[][]): string {
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
}

/** Triggers a browser download. The BOM makes Excel read the file as UTF-8 (₹ and Indian names survive). */
export function downloadCsv(fileName: string, headers: string[], rows: CsvCell[][]): void {
  const blob = new Blob(['﻿', toCsv(headers, rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
