import { createRestApi } from '@/lib/createRestApi'
import { createEntityHooks } from '@/lib/createEntityHooks'
import type { CalendarEventRecord } from './types'

export const calendarEventsApi = createRestApi<CalendarEventRecord>('/calendar-events')
export const {
  useEntityList: useCalendarEventRecords,
  useEntityCreate: useCreateCalendarEvent,
} = createEntityHooks('calendar-events', calendarEventsApi)
