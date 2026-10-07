export type DueTone = 'overdue' | 'soon' | 'normal'

export interface DueLabel {
  text: string
  tone: DueTone
}

const DAY_MS = 24 * 60 * 60 * 1000
/** Indian company: "today" is the calendar day in IST (UTC+5:30), whatever the browser's own time zone. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

/** Whole days from today (IST) to the due date's calendar day; negative once it has passed. NaN for an unreadable date. */
function daysUntil(dueDate: string, now: Date): number {
  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return Number.NaN
  const dueDay = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate())
  const ist = new Date(now.getTime() + IST_OFFSET_MS)
  const today = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate())
  return Math.round((dueDay - today) / DAY_MS)
}

const SHORT_DATE = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', timeZone: 'UTC' })

/**
 * How a task's due date reads on a board card: "Overdue 3 days", "Due today", "Due tomorrow", or the
 * date. A finished task is never overdue; a task with no date has no label.
 */
export function dueLabel(dueDate: string | null | undefined, done: boolean, now: Date): DueLabel | null {
  if (!dueDate) return null
  const days = daysUntil(dueDate, now)
  if (Number.isNaN(days)) return null
  const date = SHORT_DATE.format(new Date(dueDate))
  if (done) return { text: `Due ${date}`, tone: 'normal' }
  if (days < 0) return { text: `Overdue ${-days} day${days === -1 ? '' : 's'}`, tone: 'overdue' }
  if (days === 0) return { text: 'Due today', tone: 'soon' }
  if (days === 1) return { text: 'Due tomorrow', tone: 'soon' }
  return { text: `Due ${date}`, tone: 'normal' }
}
