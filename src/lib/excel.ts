import ExcelJS from 'exceljs'
import type { ImportColumn } from '@/components/shared/types'

export async function downloadTemplate(columns: ImportColumn[], fileName: string) {
  const workbook = new ExcelJS.Workbook()

  const dataSheet = workbook.addWorksheet('Data')
  dataSheet.columns = columns.map((col) => ({ header: col.header, key: col.key, width: Math.max(18, col.header.length + 4) }))
  dataSheet.getRow(1).font = { bold: true }
  const exampleRow: Record<string, unknown> = {}
  columns.forEach((col) => {
    exampleRow[col.key] = col.example
  })
  dataSheet.addRow(exampleRow)

  const instructionsSheet = workbook.addWorksheet('Instructions')
  instructionsSheet.columns = [
    { header: 'Field', key: 'field', width: 22 },
    { header: 'Required', key: 'required', width: 12 },
    { header: 'Notes', key: 'notes', width: 70 },
  ]
  instructionsSheet.getRow(1).font = { bold: true }
  columns.forEach((col) => {
    instructionsSheet.addRow({
      field: col.header,
      required: col.required ? 'Yes' : 'No',
      notes: col.hint ?? '',
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function parseExcelFile(file: File): Promise<Record<string, unknown>[]> {
  const workbook = new ExcelJS.Workbook()
  const buffer = await file.arrayBuffer()
  await workbook.xlsx.load(buffer)

  const worksheet = workbook.worksheets[0]
  if (!worksheet) return []

  const headers: string[] = []
  worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = String(cell.value ?? '').trim()
  })

  const rows: Record<string, unknown>[] = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const record: Record<string, unknown> = {}
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber]
      if (!header) return
      let value: unknown = cell.value
      if (value && typeof value === 'object' && 'result' in (value as Record<string, unknown>)) {
        value = (value as { result: unknown }).result
      }
      if (value instanceof Date) {
        value = value.toISOString().slice(0, 10)
      }
      record[header] = value
    })
    const hasContent = Object.values(record).some((v) => v !== null && v !== undefined && String(v).trim() !== '')
    if (hasContent) rows.push(record)
  })

  return rows
}
