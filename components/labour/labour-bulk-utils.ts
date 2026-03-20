import { parseCsv, escapeCell, normalizeHeaderKey, normalizeDateToYmd } from "@/lib/utils/csv"

export const downloadLabourBulkTemplate = () => {
  const headers = ["Project ID", "Project Name", "Category", "Headcount", "Cost Per Day", "Date", "Notes"]
  const sample = ["PRJ-1001", "Sample Project", "Mason", "5", "800.00", "2024-01-15", "Skilled workers"]
  
  const csv = `${headers.map(escapeCell).join(",")}\n${sample.map(escapeCell).join(",")}\n`
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "labour-bulk-upload-template.csv"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const parseBulkLabourFromCsv = (text: string) => {
  const parsed = parseCsv(text)
  if (parsed.length === 0) return []

  const [headerRow, ...dataRows] = parsed
  const headerMap = new Map<string, number>()
  headerRow.forEach((h, idx) => headerMap.set(normalizeHeaderKey(h), idx))

  const required = ["projectid", "category", "headcount", "costperday", "date"]
  const missing = required.filter((h) => !headerMap.has(h))
  if (missing.length > 0) {
    throw new Error(`Missing required CSV headers: ${missing.join(", ")}`)
  }

  const get = (row: string[], key: string) => {
    const idx = headerMap.get(key)
    if (idx === undefined) return ""
    return (row[idx] ?? "").trim()
  }

  const labour: any[] = []

  for (const row of dataRows) {
    const projectId = get(row, "projectid")
    const projectName = get(row, "projectname")
    const categoryRaw = get(row, "category")
    const headcountStr = get(row, "headcount")
    const costPerDayStr = get(row, "costperday")
    const dateStr = normalizeDateToYmd(get(row, "date"))
    const notes = get(row, "notes")

    if (!projectId || !categoryRaw || !headcountStr || !costPerDayStr || !dateStr) {
      continue
    }

    const headcount = parseInt(headcountStr, 10)
    if (isNaN(headcount) || headcount <= 0) continue

    const costPerDay = parseFloat(costPerDayStr)
    if (isNaN(costPerDay)) continue

    let category = "Other"
    const catLower = categoryRaw.toLowerCase()
    if (catLower.includes("mason")) category = "Mason"
    else if (catLower.includes("helper")) category = "Helper"
    else if (catLower.includes("carpenter")) category = "Carpenter"
    else if (catLower.includes("electrician")) category = "Electrician"
    else if (catLower.includes("plumber")) category = "Plumber"
    else if (catLower.includes("painter")) category = "Painter"

    labour.push({
      projectId,
      projectName,
      category,
      headcount,
      costPerDay,
      date: dateStr,
      notes: notes || undefined,
    })
  }

  return labour
}
