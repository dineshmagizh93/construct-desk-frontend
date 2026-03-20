import { LeadType, LeadSource, LeadStatus } from '@/types/lead'
import { parseCsv, normalizeHeaderKey } from '@/lib/utils/csv'

export const LEAD_BULK_HEADERS = [
  'Name',
  'Phone',
  'Email',
  'Type',
  'Source',
  'Status',
  'Assigned To',
  'Notes'
]

export const generateLeadCsvTemplate = (): string => {
  return LEAD_BULK_HEADERS.join(',') + '\n'
}

export const parseBulkLeadsFromCsv = (text: string) => {
  const rows = parseCsv(text)
  if (rows.length < 2) {
    throw new Error('CSV file must contain a header row and at least one data row.')
  }

  const rawHeaders = rows[0]
  const headers = rawHeaders.map(normalizeHeaderKey)

  const requiredMap = {
    name: false,
    phone: false,
    source: false
  }

  headers.forEach(h => {
    if (h === 'name') requiredMap.name = true
    if (h === 'phone') requiredMap.phone = true
    if (h === 'source') requiredMap.source = true
  })

  if (!requiredMap.name || !requiredMap.phone || !requiredMap.source) {
    throw new Error('CSV is missing required headers. Please ensure "Name", "Phone", and "Source" columns exist.')
  }

  const nameIdx = headers.indexOf('name')
  const phoneIdx = headers.indexOf('phone')
  const emailIdx = headers.indexOf('email')
  const typeIdx = headers.indexOf('type')
  const sourceIdx = headers.indexOf('source')
  const statusIdx = headers.indexOf('status')
  const assignedToIdx = headers.indexOf('assignedto')
  const notesIdx = headers.indexOf('notes')

  const parsedLeads = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row.every(cell => !cell)) continue

    const name = row[nameIdx]?.trim() || ''
    const phone = row[phoneIdx]?.trim() || ''
    const rawSource = row[sourceIdx]?.trim() || ''

    if (!name || !phone || !rawSource) {
      throw new Error(`Row ${i + 1}: Name, Phone, and Source are required fields.`)
    }

    const mapSource = (input: string): LeadSource => {
      const s = input.toLowerCase()
      if (s.includes('broker')) return 'Broker'
      if (s.includes('portal')) return 'Portal'
      if (s.includes('referral')) return 'Referral'
      return 'Direct'
    }

    const mapStatus = (input: string): LeadStatus => {
      const s = input.toLowerCase()
      if (s.includes('contact')) return 'Contacted'
      if (s.includes('qualif')) return 'Qualified'
      if (s.includes('convert')) return 'Converted'
      if (s.includes('lost')) return 'Lost'
      return 'New'
    }

    const rawType = typeIdx >= 0 ? row[typeIdx]?.trim().toUpperCase() : 'LEAD'
    const type = rawType.includes('CLIENT') ? 'CLIENT' : 'LEAD'

    parsedLeads.push({
      name,
      phone,
      email: emailIdx >= 0 ? row[emailIdx]?.trim() || undefined : undefined,
      type,
      source: mapSource(rawSource),
      status: statusIdx >= 0 && row[statusIdx] ? mapStatus(row[statusIdx].trim()) : 'New',
      assignedTo: assignedToIdx >= 0 ? row[assignedToIdx]?.trim() || undefined : undefined,
      notes: notesIdx >= 0 ? row[notesIdx]?.trim() || undefined : undefined
    })
  }

  return parsedLeads
}
