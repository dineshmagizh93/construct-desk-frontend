export type SearchKind = 'project' | 'client' | 'lead' | 'task' | 'invoice' | 'vendor' | 'contract'

/** A record boiled down to what search needs: what to show, where it lives, and the text to match. */
export interface SearchRecord {
  kind: SearchKind
  id: string
  label: string
  sublabel?: string
  to: string
  /** Extra text that should match too (codes, phone numbers, emails…). */
  keywords: (string | null | undefined)[]
}

export interface SearchHit extends SearchRecord {
  /** Lower is better: 0 = label starts with the query, 1 = label contains it, 2 = only another field matches. */
  rank: number
}

export const KIND_LABEL: Record<SearchKind, string> = {
  project: 'Projects',
  client: 'Clients',
  lead: 'Leads',
  task: 'Tasks',
  invoice: 'Invoices',
  vendor: 'Vendors',
  contract: 'Contracts',
}

/** Order the groups appear in the results. */
export const KIND_ORDER: SearchKind[] = ['project', 'client', 'lead', 'task', 'invoice', 'contract', 'vendor']

export const MIN_QUERY_LENGTH = 2

const norm = (text: string | null | undefined) => (text ?? '').toLowerCase().trim()

/**
 * Finds records matching `query` (case-insensitive, substring) in their label or keywords. Results are
 * grouped by kind in KIND_ORDER, best matches first within a group, at most `perKind` of each. A query
 * shorter than MIN_QUERY_LENGTH returns nothing, so typing one letter does not dump the whole database.
 */
export function searchRecords(records: SearchRecord[], query: string, perKind = 5): SearchHit[] {
  const q = norm(query)
  if (q.length < MIN_QUERY_LENGTH) return []

  const hits: SearchHit[] = []
  for (const record of records) {
    const label = norm(record.label)
    const rank = label.startsWith(q) ? 0 : label.includes(q) ? 1 : [record.sublabel, ...record.keywords].some((k) => norm(k).includes(q)) ? 2 : -1
    if (rank >= 0) hits.push({ ...record, rank })
  }

  const out: SearchHit[] = []
  for (const kind of KIND_ORDER) {
    out.push(
      ...hits
        .filter((h) => h.kind === kind)
        .sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label))
        .slice(0, perKind),
    )
  }
  return out
}
