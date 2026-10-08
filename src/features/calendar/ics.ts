import type { MergedCalendarEvent } from './types'

const CATEGORY: Record<MergedCalendarEvent['source'], string> = {
  task: 'Task',
  milestone: 'Milestone',
  lead: 'Site visit',
  event: 'Event',
}

/** iCalendar text values escape backslash, semicolon, comma and newlines. */
export function escapeIcsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Lines may not exceed 75 octets: longer ones are split, each continuation starting with one space. Splits fall between
 * characters, never inside a multi-byte one, so Indian-language text and ₹ survive. */
export function foldLine(line: string): string {
  const encoder = new TextEncoder()
  if (encoder.encode(line).length <= 75) return line
  const parts: string[] = []
  let current = ''
  let size = 0
  for (const char of line) {
    const bytes = encoder.encode(char).length
    // The first line holds 75 octets; continuation lines hold 74 (their leading space counts).
    const limit = parts.length === 0 ? 75 : 74
    if (size + bytes > limit) {
      parts.push(current)
      current = ''
      size = 0
    }
    current += char
    size += bytes
  }
  parts.push(current)
  return parts.join('\r\n ')
}

/** Indian company: the calendar day is the day in IST (UTC+5:30), so a late-evening UTC timestamp lands on the next day, as it does on screen. Empty when unreadable. */
function compactDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '')
}

/** The day after a yyyymmdd date, as yyyymmdd (an all-day event ends the next day in iCalendar). */
function nextDay(yyyymmdd: string): string {
  const date = new Date(Date.UTC(Number(yyyymmdd.slice(0, 4)), Number(yyyymmdd.slice(4, 6)) - 1, Number(yyyymmdd.slice(6, 8)) + 1))
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}

const stamp = (now: Date) => now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

/**
 * An iCalendar (.ics) file of all-day events that Google Calendar, Outlook and Apple Calendar can import.
 * Events with an unreadable date are left out. Each event keeps a stable UID so re-importing updates
 * rather than duplicates.
 */
export function buildIcs(events: MergedCalendarEvent[], now: Date, calendarName = 'ConstructDesk'): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ConstructDesk//Calendar//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', `X-WR-CALNAME:${escapeIcsText(calendarName)}`]
  for (const event of events) {
    const date = compactDate(event.date)
    if (!date) continue
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@constructdesk`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART;VALUE=DATE:${date}`,
      `DTEND;VALUE=DATE:${nextDay(date)}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `CATEGORIES:${CATEGORY[event.source]}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

export const icsFileName = (now: Date) => `constructdesk-calendar-${now.toISOString().slice(0, 10)}.ics`

export function downloadIcs(text: string, fileName: string): void {
  const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
