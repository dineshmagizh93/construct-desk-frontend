/** GST state codes (the first two digits of a GSTIN) and the state each one stands for. */
export const GST_STATES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli and Daman & Diu',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (old)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
}

// 2-digit state code, 5 letters, 4 digits, 1 letter, 1 alphanumeric, "Z", 1 alphanumeric.
const GSTIN_FORMAT = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/

/** The state code of a well-formed GSTIN, or null when the text is not one (blank, wrong length, unknown state). */
export function stateCodeOf(gstin: string | null | undefined): string | null {
  const value = gstin?.trim().toUpperCase()
  if (!value || !GSTIN_FORMAT.test(value)) return null
  const code = value.slice(0, 2)
  return GST_STATES[code] ? code : null
}

export const stateNameOf = (gstin: string | null | undefined): string | null => {
  const code = stateCodeOf(gstin)
  return code ? `${code} – ${GST_STATES[code]}` : null
}

export type GstSplit =
  | { kind: 'intra'; cgst: number; sgst: number }
  | { kind: 'inter'; igst: number }
  /** One or both GSTINs are missing or malformed, so the split cannot be decided. */
  | { kind: 'unknown'; gst: number }

/**
 * How the tax on an invoice is split. A supply inside one state (supplier and customer share a state code)
 * carries CGST and SGST, half each; a supply between states carries IGST. If either GSTIN is missing the
 * split is unknown and the tax stays a single GST figure. The two halves always add up to the tax exactly.
 */
export function gstSplit(tax: number, supplierGstin: string | null | undefined, customerGstin: string | null | undefined): GstSplit {
  const from = stateCodeOf(supplierGstin)
  const to = stateCodeOf(customerGstin)
  if (!from || !to) return { kind: 'unknown', gst: tax }
  if (from !== to) return { kind: 'inter', igst: tax }
  const cgst = Math.round(tax / 2)
  return { kind: 'intra', cgst, sgst: tax - cgst }
}
