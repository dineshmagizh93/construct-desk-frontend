export type Recurrence = 'daily' | 'weekly' | 'monthly'

/** What the task form offers. "none" is the sentinel for "does not repeat" (a select cannot hold an empty value). */
export const RECURRENCE_OPTIONS = [
  { label: 'Does not repeat', value: 'none' },
  { label: 'Every day', value: 'daily' },
  { label: 'Every week', value: 'weekly' },
  { label: 'Every month', value: 'monthly' },
]

const LABELS: Record<Recurrence, string> = { daily: 'Repeats daily', weekly: 'Repeats weekly', monthly: 'Repeats monthly' }

/** "Repeats weekly", or null for a one-off task (or anything unrecognised). */
export function recurrenceLabel(recurrence: string | null | undefined): string | null {
  return recurrence && Object.prototype.hasOwnProperty.call(LABELS, recurrence) ? LABELS[recurrence as Recurrence] : null
}
