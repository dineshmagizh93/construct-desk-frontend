import { TASKS_SEED } from '@/features/tasks/data.mock'
import { PROJECTS_SEED } from '@/features/projects/data.mock'
import { LEADS_SEED } from '@/features/leads/data.mock'

export interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'task' | 'milestone' | 'lead'
}

export function getCalendarEvents(): CalendarEvent[] {
  const taskEvents: CalendarEvent[] = TASKS_SEED.map((t) => ({
    id: `evt-task-${t.id}`,
    title: `Task: ${t.title}`,
    date: t.dueDate,
    type: 'task',
  }))

  const milestoneEvents: CalendarEvent[] = PROJECTS_SEED.flatMap((p) =>
    p.milestones.map((m) => ({
      id: `evt-milestone-${p.id}-${m.id}`,
      title: `Milestone: ${p.name} — ${m.label}`,
      date: m.dueDate,
      type: 'milestone' as const,
    })),
  )

  const leadEvents: CalendarEvent[] = LEADS_SEED.filter((l) => l.status === 'site_visit').map((l) => ({
    id: `evt-lead-${l.id}`,
    title: `Site Visit: ${l.name}`,
    date: l.followUps.at(-1)?.date ?? l.createdAt,
    type: 'lead' as const,
  }))

  return [...taskEvents, ...milestoneEvents, ...leadEvents]
}
