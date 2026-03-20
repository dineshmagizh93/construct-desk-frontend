import { parseCsv, escapeCell, normalizeHeaderKey, normalizeDateToYmd } from "@/lib/utils/csv"

export const downloadTaskBulkTemplate = () => {
  const headers = ["Project ID", "Project Name", "Title", "Description", "Status", "Priority", "Due Date", "Estimated Hours", "Labels"]
  const sample = ["PRJ-1001", "Sample Project", "Initial Setup", "Setup the DB", "To Do", "High", "2024-01-15", "4.5", "backend,setup"]
  
  const csv = `${headers.map(escapeCell).join(",")}\n${sample.map(escapeCell).join(",")}\n`
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "tasks-bulk-upload-template.csv"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const parseBulkTasksFromCsv = (text: string) => {
  const parsed = parseCsv(text)
  if (parsed.length === 0) return []

  const [headerRow, ...dataRows] = parsed
  const headerMap = new Map<string, number>()
  headerRow.forEach((h, idx) => headerMap.set(normalizeHeaderKey(h), idx))

  const required = ["projectid", "title", "status"]
  const missing = required.filter((h) => !headerMap.has(h))
  if (missing.length > 0) {
    throw new Error(`Missing required CSV headers: ${missing.join(", ")}`)
  }

  const get = (row: string[], key: string) => {
    const idx = headerMap.get(key)
    if (idx === undefined) return ""
    return (row[idx] ?? "").trim()
  }

  const tasks: any[] = []

  for (const row of dataRows) {
    const projectId = get(row, "projectid")
    const projectName = get(row, "projectname")
    const title = get(row, "title")
    const description = get(row, "description")
    const statusRaw = get(row, "status")
    const priorityRaw = get(row, "priority")
    const dueDateStr = normalizeDateToYmd(get(row, "duedate"))
    const estHoursStr = get(row, "estimatedhours")
    const labels = get(row, "labels")

    if (!projectId || !title) {
      continue
    }

    let status = "To Do"
    const statusLower = statusRaw.toLowerCase()
    if (statusLower.includes("progress")) status = "In Progress"
    else if (statusLower.includes("review")) status = "Review"
    else if (statusLower.includes("done")) status = "Done"
    else if (statusLower.includes("block")) status = "Blocked"

    let priority = "Medium"
    const priorityLower = priorityRaw.toLowerCase()
    if (priorityLower.includes("low")) priority = "Low"
    else if (priorityLower.includes("high")) priority = "High"
    else if (priorityLower.includes("urgent")) priority = "Urgent"

    let estimatedHours = undefined
    if (estHoursStr) {
      const parsedHours = parseFloat(estHoursStr)
      if (!isNaN(parsedHours) && parsedHours >= 0) {
        estimatedHours = parsedHours
      }
    }

    tasks.push({
      projectId,
      projectName,
      title,
      description: description || undefined,
      status,
      priority,
      dueDate: dueDateStr || undefined,
      estimatedHours,
      labels: labels || undefined,
    })
  }

  return tasks
}
