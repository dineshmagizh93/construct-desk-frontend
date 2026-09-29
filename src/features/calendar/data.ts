import { useMemo } from 'react'
import { useTasks } from '@/features/tasks/api'
import { useProjects } from '@/features/projects/api'
import { useLeads } from '@/features/leads/api'
import { useCalendarEventRecords } from './api'
import type { MergedCalendarEvent } from './types'

/** Merges every real, live source of dated events into one calendar feed: task due dates, project
 * milestone due dates, leads currently at the "site visit" stage, and ad-hoc CalendarEvent rows. */
export function useMergedCalendarEvents(): { events: MergedCalendarEvent[]; isLoading: boolean } {
  const { data: tasks = [], isLoading: tasksLoading } = useTasks()
  const { data: projects = [], isLoading: projectsLoading } = useProjects()
  const { data: leads = [], isLoading: leadsLoading } = useLeads()
  const { data: calendarEvents = [], isLoading: eventsLoading } = useCalendarEventRecords()

  const events = useMemo<MergedCalendarEvent[]>(() => {
    const taskEvents: MergedCalendarEvent[] = tasks
      .filter((t) => t.dueDate)
      .map((t) => ({ id: `task-${t.id}`, title: `Task: ${t.title}`, date: t.dueDate, source: 'task' }))

    const milestoneEvents: MergedCalendarEvent[] = projects.flatMap((p) =>
      p.milestones
        .filter((m) => m.dueDate)
        .map((m) => ({ id: `milestone-${m.id}`, title: `Milestone: ${p.name} — ${m.label}`, date: m.dueDate, source: 'milestone' as const })),
    )

    const leadEvents: MergedCalendarEvent[] = leads
      .filter((l) => l.status === 'site_visit')
      .map((l) => ({
        id: `lead-${l.id}`,
        title: `Site Visit: ${l.name}`,
        date: l.followUps.at(-1)?.date ?? l.createdAt,
        source: 'lead',
      }))

    const realEvents: MergedCalendarEvent[] = calendarEvents.map((e) => ({ id: `event-${e.id}`, title: e.title, date: e.date, source: 'event' }))

    return [...taskEvents, ...milestoneEvents, ...leadEvents, ...realEvents]
  }, [tasks, projects, leads, calendarEvents])

  return { events, isLoading: tasksLoading || projectsLoading || leadsLoading || eventsLoading }
}
