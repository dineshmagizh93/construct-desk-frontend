export type ProjectDateHistoryField = "startDate" | "endDate"

export interface ProjectDateHistoryEntry {
  id: string
  field: ProjectDateHistoryField
  from: string
  to: string
  changedAt: string
}

const STORAGE_KEY = "project_date_history_v1"
const MAX_ENTRIES_PER_PROJECT = 30

type ProjectDateHistoryStore = Record<string, ProjectDateHistoryEntry[]>

const isBrowser = () => typeof window !== "undefined"

const readStore = (): ProjectDateHistoryStore => {
  if (!isBrowser()) return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as ProjectDateHistoryStore
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

const writeStore = (store: ProjectDateHistoryStore) => {
  if (!isBrowser()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

const normalizeDate = (value?: string | null) => {
  if (!value) return ""
  const dateOnlyMatch = value.match(/^\d{4}-\d{2}-\d{2}/)
  if (dateOnlyMatch) return dateOnlyMatch[0]

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toISOString().split("T")[0]
}

const createEntry = (
  field: ProjectDateHistoryField,
  from: string,
  to: string
): ProjectDateHistoryEntry => ({
  id: `${field}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  field,
  from,
  to,
  changedAt: new Date().toISOString(),
})

export const recordProjectDateHistory = (
  projectId: string,
  previousDates: { startDate?: string | null; endDate?: string | null },
  nextDates: { startDate?: string | null; endDate?: string | null }
) => {
  if (!projectId || !isBrowser()) return

  const prevStart = normalizeDate(previousDates.startDate)
  const prevEnd = normalizeDate(previousDates.endDate)
  const nextStart = normalizeDate(nextDates.startDate)
  const nextEnd = normalizeDate(nextDates.endDate)

  const changes: ProjectDateHistoryEntry[] = []

  if (prevStart !== nextStart) {
    changes.push(createEntry("startDate", prevStart || "Not set", nextStart || "Not set"))
  }
  if (prevEnd !== nextEnd) {
    changes.push(createEntry("endDate", prevEnd || "Not set", nextEnd || "Not set"))
  }

  if (changes.length === 0) return

  const store = readStore()
  const existing = store[projectId] || []
  const merged = [...changes, ...existing].slice(0, MAX_ENTRIES_PER_PROJECT)

  store[projectId] = merged
  writeStore(store)
}

export const getProjectDateHistory = (projectId: string): ProjectDateHistoryEntry[] => {
  if (!projectId) return []
  const store = readStore()
  return store[projectId] || []
}

