import { VendorType } from '@/types/vendor'
import { parseCsv, normalizeHeaderKey } from '@/lib/utils/csv'

export const VENDOR_BULK_HEADERS = [
  'Name',
  'Type',
  'Contact Person',
  'Phone',
  'Email',
  'Address',
  'City',
  'State',
  'Country',
  'Notes',
  'Status'
]

export const generateVendorCsvTemplate = (): string => {
  return VENDOR_BULK_HEADERS.join(',') + '\n'
}

export const parseBulkVendorsFromCsv = (text: string) => {
  const rows = parseCsv(text)
  if (rows.length < 2) {
    throw new Error('CSV file must contain a header row and at least one data row.')
  }

  const rawHeaders = rows[0]
  const headers = rawHeaders.map(normalizeHeaderKey)

  const requiredMap = {
    name: false,
    type: false,
    phone: false,
  }

  headers.forEach(h => {
    if (h === 'name') requiredMap.name = true
    if (h === 'type') requiredMap.type = true
    if (h === 'phone') requiredMap.phone = true
  })

  if (!requiredMap.name || !requiredMap.type || !requiredMap.phone) {
    throw new Error('CSV is missing required headers. Please ensure "Name", "Type", and "Phone" columns exist.')
  }

  const nameIdx = headers.indexOf('name')
  const typeIdx = headers.indexOf('type')
  const phoneIdx = headers.indexOf('phone')
  const contactPersonIdx = headers.indexOf('contactperson')
  const emailIdx = headers.indexOf('email')
  const addressIdx = headers.indexOf('address')
  const cityIdx = headers.indexOf('city')
  const stateIdx = headers.indexOf('state')
  const countryIdx = headers.indexOf('country')
  const notesIdx = headers.indexOf('notes')
  const statusIdx = headers.indexOf('status')

  const parsedVendors = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row.every(cell => !cell)) continue

    const name = row[nameIdx]?.trim() || ''
    const rawType = row[typeIdx]?.trim() || ''
    const phone = row[phoneIdx]?.trim() || ''

    if (!name || !rawType || !phone) {
      throw new Error(`Row ${i + 1}: Name, Type, and Phone are required fields.`)
    }

    const mapType = (input: string): VendorType | 'Other' => {
      const t = input.toLowerCase()
      if (t.includes('material')) return 'Material Supplier'
      if (t.includes('contractor') || t.includes('subcontractor')) return 'Contractor'
      if (t.includes('electrician')) return 'Electrician'
      if (t.includes('plumber')) return 'Plumber'
      if (t.includes('transport')) return 'Transport'
      if (t.includes('equipment')) return 'Equipment Rental'
      return 'Other'
    }

    parsedVendors.push({
      name,
      type: mapType(rawType),
      phone,
      contactPerson: contactPersonIdx >= 0 ? row[contactPersonIdx]?.trim() || undefined : undefined,
      email: emailIdx >= 0 ? row[emailIdx]?.trim() || undefined : undefined,
      address: addressIdx >= 0 ? row[addressIdx]?.trim() || undefined : undefined,
      city: cityIdx >= 0 ? row[cityIdx]?.trim() || undefined : undefined,
      state: stateIdx >= 0 ? row[stateIdx]?.trim() || undefined : undefined,
      country: countryIdx >= 0 ? row[countryIdx]?.trim() || undefined : undefined,
      notes: notesIdx >= 0 ? row[notesIdx]?.trim() || undefined : undefined,
      status: statusIdx >= 0 ? (row[statusIdx]?.trim().toLowerCase() === 'inactive' ? 'Inactive' : 'Active') : 'Active'
    })
  }

  return parsedVendors
}
