// Matches the backend's CalendarEvent Prisma model (mounted at /calendar-events).
export interface CalendarEventRecord {
  id: string
  title: string
  date: string
  type: string
}

export type MergedEventSource = 'task' | 'milestone' | 'lead' | 'event'

export interface MergedCalendarEvent {
  id: string
  title: string
  date: string
  source: MergedEventSource
}
