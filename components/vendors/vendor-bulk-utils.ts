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

    if (name.length > 100) throw new Error(`Row ${i + 1}: Vendor name must be 100 characters or less.`)
    if (phone.length > 20) throw new Error(`Row ${i + 1}: Phone must be 20 characters or less.`)

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

    const contactPerson = contactPersonIdx >= 0 ? row[contactPersonIdx]?.trim() || undefined : undefined
    const email = emailIdx >= 0 ? row[emailIdx]?.trim() || undefined : undefined
    const address = addressIdx >= 0 ? row[addressIdx]?.trim() || undefined : undefined
    const city = cityIdx >= 0 ? row[cityIdx]?.trim() || undefined : undefined
    const state = stateIdx >= 0 ? row[stateIdx]?.trim() || undefined : undefined
    const country = countryIdx >= 0 ? row[countryIdx]?.trim() || undefined : undefined
    const notes = notesIdx >= 0 ? row[notesIdx]?.trim() || undefined : undefined

    if (contactPerson && contactPerson.length > 100) throw new Error(`Row ${i + 1}: Contact person must be 100 characters or less.`)
    if (email && email.length > 100) throw new Error(`Row ${i + 1}: Email must be 100 characters or less.`)
    if (address && address.length > 150) throw new Error(`Row ${i + 1}: Address must be 150 characters or less.`)
    if (city && city.length > 60) throw new Error(`Row ${i + 1}: City must be 60 characters or less.`)
    if (state && state.length > 60) throw new Error(`Row ${i + 1}: State must be 60 characters or less.`)
    if (country && country.length > 60) throw new Error(`Row ${i + 1}: Country must be 60 characters or less.`)
    if (notes && notes.length > 250) throw new Error(`Row ${i + 1}: Notes must be 250 characters or less.`)

    parsedVendors.push({
      name,
      type: mapType(rawType),
      phone,
      contactPerson,
      email,
      address,
      city,
      state,
      country,
      notes,
      status: statusIdx >= 0 ? (row[statusIdx]?.trim().toLowerCase() === 'inactive' ? 'Inactive' : 'Active') : 'Active'
    })
  }

  return parsedVendors
}
