import { http } from '@/lib/http'

export interface CompanyExport {
  version: number
  exportedAt: string
  company: { name: string }
  /** How many records of each kind the file holds. */
  counts: Record<string, number>
  data: Record<string, unknown[]>
}

/** "lead" counts as one word each: leads -> "Leads", siteProgress -> "Site progress". */
export function countLabel(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Only the kinds that actually hold something, largest first, as "Leads 12 · Payments 8". */
export function describeCounts(counts: Record<string, number>): string {
  return Object.entries(counts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, n]) => `${countLabel(key)} ${n}`)
    .join(' · ')
}

export const exportFileName = (now: Date) => `constructdesk-data-${now.toISOString().slice(0, 10)}.json`

/** Fetches the company's full export and saves it as a JSON file. Returns what was downloaded. */
export async function downloadCompanyData(): Promise<CompanyExport> {
  const data = await http<CompanyExport>('/companies/me/export')
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = exportFileName(new Date())
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  return data
}
