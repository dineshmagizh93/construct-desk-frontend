import { parseCsv, escapeCell, normalizeHeaderKey, normalizeDateToYmd } from "@/lib/utils/csv"

export const downloadSiteProgressBulkTemplate = () => {
  const headers = ["Project ID", "Project Name", "Date", "Notes", "Photos (Comma Separated URLs)"]
  const sample = ["PRJ-1001", "Sample Project", "2024-01-15", "Site excavation completed", "https://example.com/photo1.jpg,https://example.com/photo2.jpg"]
  
  const csv = `${headers.map(escapeCell).join(",")}\n${sample.map(escapeCell).join(",")}\n`
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "site-progress-bulk-upload-template.csv"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const parseBulkSiteProgressFromCsv = (text: string) => {
  const parsed = parseCsv(text)
  if (parsed.length === 0) return []

  const [headerRow, ...dataRows] = parsed
  const headerMap = new Map<string, number>()
  headerRow.forEach((h, idx) => headerMap.set(normalizeHeaderKey(h), idx))

  const required = ["projectid", "date"]
  const missing = required.filter((h) => !headerMap.has(h))
  if (missing.length > 0) {
    throw new Error(`Missing required CSV headers: ${missing.join(", ")}`)
  }

  const get = (row: string[], key: string) => {
    const idx = headerMap.get(key)
    if (idx === undefined) return ""
    return (row[idx] ?? "").trim()
  }

  const progress: any[] = []

  for (const row of dataRows) {
    const projectId = get(row, "projectid")
    const projectName = get(row, "projectname")
    const dateStr = normalizeDateToYmd(get(row, "date"))
    const notes = get(row, "notes")
    const photosRaw = get(row, "photos(commaseparatedurls)") || get(row, "photos")

    if (!projectId || !dateStr) {
      continue
    }

    let photos: string[] = []
    if (photosRaw) {
      photos = photosRaw.split(",").map(p => p.trim()).filter(p => p.length > 0)
    }

    progress.push({
      projectId,
      projectName,
      date: dateStr,
      notes: notes || undefined,
      photos: photos.length > 0 ? photos : undefined,
    })
  }

  return progress
}
