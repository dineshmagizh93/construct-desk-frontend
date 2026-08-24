import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight, CheckSquare, Flag, Target } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getCalendarEvents } from '../data'

const EVENT_ICON = { task: CheckSquare, milestone: Flag, lead: Target }
const EVENT_COLOR = {
  task: 'bg-primary/10 text-primary',
  milestone: 'bg-warning/15 text-warning',
  lead: 'bg-accent/20 text-accent-foreground',
}

export function CalendarPage() {
  const [cursor, setCursor] = useState(() => new Date('2026-07-04'))
  const events = useMemo(() => getCalendarEvents(), [])

  const monthStart = startOfMonth(cursor)
  const monthEnd = endOfMonth(cursor)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const eventsForDay = (day: Date) => events.filter((e) => isSameDay(new Date(e.date), day))

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Tasks, milestones, and site visits — all in one schedule."
        actions={
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => setCursor((d) => subMonths(d, 1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="w-32 text-center text-sm font-medium">{format(cursor, 'MMMM yyyy')}</span>
            <Button variant="outline" size="icon" onClick={() => setCursor((d) => addMonths(d, 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-2 sm:p-4">
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border border-border bg-border text-center text-xs font-medium text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-secondary py-2">
                {d}
              </div>
            ))}
            {days.map((day) => {
              const dayEvents = eventsForDay(day)
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-24 space-y-1 bg-card p-1.5 text-left',
                    !isSameMonth(day, cursor) && 'bg-secondary/30 text-muted-foreground/50',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex size-5 items-center justify-center rounded-full text-xs',
                      isToday(day) && 'bg-primary text-primary-foreground font-semibold',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => {
                      const Icon = EVENT_ICON[event.type]
                      return (
                        <div
                          key={event.id}
                          className={cn('flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px]', EVENT_COLOR[event.type])}
                          title={event.title}
                        >
                          <Icon className="size-3 shrink-0" />
                          <span className="truncate">{event.title}</span>
                        </div>
                      )
                    })}
                    {dayEvents.length > 2 && (
                      <p className="px-1 text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
