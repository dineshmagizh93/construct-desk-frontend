import { describe, expect, it } from 'vitest'
import { buildIcs, escapeIcsText, foldLine, icsFileName } from './ics'
import type { MergedCalendarEvent } from './types'

const now = new Date('2026-10-08T05:30:15.123Z')
const ev = (id: string, title: string, date: string, source: MergedCalendarEvent['source'] = 'task'): MergedCalendarEvent => ({ id, title, date, source })

describe('escapeIcsText', () => {
  it('escapes backslashes, semicolons, commas and newlines', () => {
    expect(escapeIcsText('a, b; c\\d\ne')).toBe('a\\, b\\; c\\\\d\\ne')
  })
})

describe('foldLine', () => {
  it('leaves short lines alone', () => {
    expect(foldLine('SUMMARY:Short')).toBe('SUMMARY:Short')
  })

  it('splits long lines at 75 octets with a leading space on continuations', () => {
    const folded = foldLine(`SUMMARY:${'x'.repeat(200)}`)
    const parts = folded.split('\r\n')
    expect(parts.length).toBeGreaterThan(2)
    expect(new TextEncoder().encode(parts[0]).length).toBeLessThanOrEqual(75)
    for (const part of parts.slice(1)) {
      expect(part.startsWith(' ')).toBe(true)
      expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75)
    }
    // Unfolding gives the original back.
    expect(parts.map((p, i) => (i === 0 ? p : p.slice(1))).join('')).toBe(`SUMMARY:${'x'.repeat(200)}`)
  })

  it('never splits inside a multi-byte character', () => {
    const line = `SUMMARY:${'₹'.repeat(60)}`
    const unfolded = foldLine(line).split('\r\n').map((p, i) => (i === 0 ? p : p.slice(1))).join('')
    expect(unfolded).toBe(line)
  })
})

describe('buildIcs', () => {
  const ics = buildIcs([ev('task-1', 'Task: Pour slab, level 2', '2026-10-31T00:00:00.000Z'), ev('event-2', 'Site meeting', '2026-12-31', 'event')], now)

  it('is a well-formed calendar with CRLF line endings', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
    expect(ics.match(/END:VEVENT/g)).toHaveLength(2)
  })

  it('writes all-day events that end the next day, including across a year end', () => {
    expect(ics).toContain('DTSTART;VALUE=DATE:20261031\r\nDTEND;VALUE=DATE:20261101')
    expect(ics).toContain('DTSTART;VALUE=DATE:20261231\r\nDTEND;VALUE=DATE:20270101')
  })

  it('uses the Indian calendar day for timestamps', () => {
    // 20:00 UTC on the 7th is 01:30 on the 8th in India
    const late = buildIcs([ev('lead-1', 'Site Visit: Meera', '2026-10-07T20:00:00.000Z', 'lead')], now)
    expect(late).toContain('DTSTART;VALUE=DATE:20261008')
  })

  it('gives each event a stable UID, an escaped summary and a category', () => {
    expect(ics).toContain('UID:task-1@constructdesk')
    expect(ics).toContain('SUMMARY:Task: Pour slab\\, level 2')
    expect(ics).toContain('CATEGORIES:Task')
    expect(ics).toContain('CATEGORIES:Event')
  })

  it('stamps the export time in UTC', () => {
    expect(ics).toContain('DTSTAMP:20261008T053015Z')
  })

  it('leaves out events with an unreadable date and copes with none', () => {
    const out = buildIcs([ev('bad', 'Broken', 'not a date'), ev('empty', 'No date', '')], now)
    expect(out).not.toContain('BEGIN:VEVENT')
    expect(buildIcs([], now)).toContain('END:VCALENDAR')
  })
})

describe('icsFileName', () => {
  it('is dated', () => {
    expect(icsFileName(now)).toBe('constructdesk-calendar-2026-10-08.ics')
  })
})
