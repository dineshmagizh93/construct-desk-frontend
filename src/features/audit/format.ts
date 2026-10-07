/** Turns raw audit rows into text a person can read at a glance. */

const ACTION_PHRASE: Record<string, string> = {
  create: 'created',
  update: 'edited',
  delete: 'deleted',
  approve: 'approved',
  reject: 'rejected',
  'mark-paid': 'marked as paid',
  'raise-invoice': 'raised an invoice on',
  'release-retention': 'released retention on',
  convert: 'converted',
  'create-contract': 'created a contract from',
  'create-po': 'created a purchase order for',
  receive: 'received',
  'payment-added': 'recorded a payment on',
  export: 'downloaded a full data export of',
  'payment-removed': 'removed a payment from',
}

// Changes to nested things are recorded as "<thing>-added|changed|removed" against the record they belong to.
const CHILD_NOUN: Record<string, string> = {
  attendance: 'an attendance entry',
  'contact-note': 'a contact note',
  'follow-up': 'a follow-up',
  'stock-movement': 'a stock movement',
  'service-log': 'a service log entry',
  'line-item': 'a line item',
}
const CHILD_ACTION = /^(.+)-(added|changed|removed)$/
const CHILD_VERB = { added: ['added', 'to'], changed: ['edited', 'on'], removed: ['removed', 'from'] } as const

function childNoun(child: string): string {
  const named = CHILD_NOUN[child]
  if (named) return named
  const words = child.replace(/-/g, ' ')
  return `${/^[aeiou]/.test(words) ? 'an' : 'a'} ${words}`
}

/** "mark-paid" with no entry in the table still reads sensibly. */
export function actionPhrase(action: string): string {
  const known = ACTION_PHRASE[action]
  if (known) return known
  const child = CHILD_ACTION.exec(action)
  if (child) {
    const [verb, preposition] = CHILD_VERB[child[2] as keyof typeof CHILD_VERB]
    return `${verb} ${childNoun(child[1])} ${preposition}`
  }
  return action.replace(/-/g, ' ')
}

/** "PurchaseRequest" -> "purchase request". */
export function entityName(entity: string): string {
  return entity
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .trim()
}

/** "paidTo" -> "Paid to". */
export function fieldName(field: string): string {
  const spaced = field.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/

/** A value as it should appear in a change: dashes for empty, short dates, numbers grouped Indian-style. */
export function formatChangeValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'number') return value.toLocaleString('en-IN')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  const text = String(value)
  if (ISO_DATE.test(text)) {
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(text))
  }
  return text.replace(/_/g, ' ')
}

export type ChangeMap = Record<string, [unknown, unknown]>

/** "Amount: 1,000 → 1,500" lines for an update. */
export function describeChanges(changes: ChangeMap | null | undefined): string[] {
  if (!changes) return []
  return Object.entries(changes).map(([field, [before, after]]) => `${fieldName(field)}: ${formatChangeValue(before)} → ${formatChangeValue(after)}`)
}
