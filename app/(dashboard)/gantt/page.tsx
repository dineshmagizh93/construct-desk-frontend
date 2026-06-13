"use client"

import { useState, useEffect } from "react"
import { GanttChartSquare, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { apiClient } from "@/lib/api/client"
import { projectsApi } from "@/lib/api/projects"
import { addDays, format, differenceInDays, startOfWeek, endOfWeek, parseISO, isValid } from "date-fns"

interface GanttTask {
  id: string
  title: string
  projectId: string
  projectName: string
  status: string
  priority: string
  dueDate?: string
  startDate?: string
  assigneeName?: string
}

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-slate-300",
  in_progress: "bg-blue-500",
  done: "bg-green-500",
  blocked: "bg-red-400",
  review: "bg-amber-400",
}

const PRIORITY_BORDER: Record<string, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-400",
  medium: "border-l-blue-400",
  low: "border-l-slate-300",
}

function parseDate(val?: string): Date | null {
  if (!val) return null
  const d = parseISO(val)
  return isValid(d) ? d : null
}

export default function GanttPage() {
  const [tasks, setTasks] = useState<GanttTask[]>([])
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [viewStart, setViewStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [daysToShow, setDaysToShow] = useState(28)

  const viewEnd = addDays(viewStart, daysToShow - 1)

  useEffect(() => {
    projectsApi.getAll().then((data: any[]) => {
      const list = Array.isArray(data) ? data : (data as any).items || []
      setProjects(list.map((p: any) => ({ id: p.id, name: p.name })))
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = selectedProject ? `?projectId=${selectedProject}` : ""
    apiClient
      .get<any>(`/projects/gantt${params}`)
      .then((data) => {
        const list: GanttTask[] = Array.isArray(data) ? data : data.tasks || []
        setTasks(list)
      })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
  }, [selectedProject])

  const days = Array.from({ length: daysToShow }, (_, i) => addDays(viewStart, i))
  const today = new Date()
  const todayOffset = differenceInDays(today, viewStart)

  const getBarStyle = (task: GanttTask) => {
    const start = parseDate(task.startDate) || parseDate(task.dueDate)
    const end = parseDate(task.dueDate)
    if (!start || !end) return null

    const left = differenceInDays(start, viewStart)
    const width = Math.max(1, differenceInDays(end, start) + 1)

    if (left + width < 0 || left > daysToShow) return null

    const clampedLeft = Math.max(0, left)
    const clampedWidth = Math.min(width, daysToShow - clampedLeft)

    return {
      left: `${(clampedLeft / daysToShow) * 100}%`,
      width: `${(clampedWidth / daysToShow) * 100}%`,
    }
  }

  const groupedByProject = tasks.reduce<Record<string, GanttTask[]>>((acc, t) => {
    const key = t.projectName || t.projectId || "Unknown"
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <GanttChartSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-800">Gantt Chart</h1>
            <p className="text-[13px] text-slate-500">
              {format(viewStart, "MMM d")} – {format(viewEnd, "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-[180px] text-[13px]"
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
          <Select
            value={String(daysToShow)}
            onChange={(e) => setDaysToShow(Number(e.target.value))}
            className="w-[110px] text-[13px]"
          >
            <option value="14">2 weeks</option>
            <option value="28">4 weeks</option>
            <option value="56">8 weeks</option>
            <option value="84">3 months</option>
          </Select>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setViewStart((d) => addDays(d, -daysToShow))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewStart((d) => addDays(d, daysToShow))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Left panel — task names */}
        <div className="w-[260px] flex-shrink-0 overflow-y-auto border-r border-slate-200">
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-slate-500">
            Task
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <GanttChartSquare className="mb-2 h-8 w-8 text-slate-200" />
              <p className="text-[13px] text-slate-400">No tasks with dates found</p>
            </div>
          ) : (
            Object.entries(groupedByProject).map(([projectName, projectTasks]) => (
              <div key={projectName}>
                <div className="border-b border-slate-100 bg-blue-50/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                  {projectName}
                </div>
                {projectTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center border-b border-slate-50 px-4 py-2.5 border-l-2 ${
                      PRIORITY_BORDER[task.priority] || "border-l-slate-200"
                    }`}
                    style={{ minHeight: 40 }}
                  >
                    <div>
                      <p className="text-[12px] font-medium text-slate-700 leading-tight">{task.title}</p>
                      {task.assigneeName && (
                        <p className="text-[11px] text-slate-400">{task.assigneeName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Right panel — timeline */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="relative" style={{ minWidth: daysToShow * 36 }}>
            {/* Header row — dates */}
            <div className="sticky top-0 z-10 flex border-b border-slate-200 bg-slate-50">
              {days.map((day, i) => {
                const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
                const isMonday = day.getDay() === 1
                return (
                  <div
                    key={i}
                    className={`flex-shrink-0 border-r border-slate-100 px-1 py-2 text-center text-[10px] font-medium ${
                      isToday ? "bg-blue-50 text-blue-600" : "text-slate-400"
                    } ${isMonday ? "text-slate-600" : ""}`}
                    style={{ width: 36 }}
                  >
                    {isMonday || i === 0 ? format(day, "d MMM") : format(day, "d")}
                  </div>
                )
              })}
            </div>

            {/* Task bar rows */}
            {!loading &&
              Object.entries(groupedByProject).map(([projectName, projectTasks]) => (
                <div key={projectName}>
                  {/* Project group row */}
                  <div className="flex border-b border-slate-100 bg-blue-50/40" style={{ height: 33 }}>
                    {days.map((_, i) => (
                      <div key={i} className="flex-shrink-0 border-r border-slate-100" style={{ width: 36 }} />
                    ))}
                  </div>
                  {projectTasks.map((task) => {
                    const bar = getBarStyle(task)
                    return (
                      <div
                        key={task.id}
                        className="relative flex border-b border-slate-50"
                        style={{ height: 40 }}
                      >
                        {/* Today line */}
                        {todayOffset >= 0 && todayOffset < daysToShow && (
                          <div
                            className="absolute top-0 bottom-0 w-px bg-blue-400/50 z-10"
                            style={{ left: `${(todayOffset / daysToShow) * 100}%` }}
                          />
                        )}
                        {/* Grid columns */}
                        {days.map((day, i) => (
                          <div
                            key={i}
                            className={`flex-shrink-0 border-r border-slate-100 ${
                              day.getDay() === 0 || day.getDay() === 6 ? "bg-slate-50/60" : ""
                            }`}
                            style={{ width: 36 }}
                          />
                        ))}
                        {/* Bar */}
                        {bar && (
                          <div
                            title={`${task.title} — ${task.status}`}
                            className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-sm ${
                              STATUS_COLORS[task.status] || "bg-slate-300"
                            } opacity-90 hover:opacity-100 cursor-pointer transition-opacity`}
                            style={{ left: bar.left, width: bar.width, minWidth: 8 }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
            <span className="capitalize">{status.replace("_", " ")}</span>
          </div>
        ))}
        <div className="ml-4 flex items-center gap-1.5">
          <span className="h-3 w-px bg-blue-400" />
          <span>Today</span>
        </div>
      </div>
    </div>
  )
}
