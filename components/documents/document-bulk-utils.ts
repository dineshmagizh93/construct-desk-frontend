import { parseCsv, escapeCell, normalizeHeaderKey } from "@/lib/utils/csv"

export const downloadDocumentBulkTemplate = () => {
  const headers = ["Project ID", "Project Name", "Name", "Type", "File URL", "File Name", "File Size (Bytes)", "Notes"]
  const sample = ["PRJ-1001", "Sample Project", "Site Plan", "Drawing", "https://example.com/site-plan.pdf", "site-plan.pdf", "1024576", "Initial drawing"]
  
  const csv = `${headers.map(escapeCell).join(",")}\n${sample.map(escapeCell).join(",")}\n`
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "documents-bulk-upload-template.csv"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const parseBulkDocumentsFromCsv = (text: string) => {
  const parsed = parseCsv(text)
  if (parsed.length === 0) return []

  const [headerRow, ...dataRows] = parsed
  const headerMap = new Map<string, number>()
  headerRow.forEach((h, idx) => headerMap.set(normalizeHeaderKey(h), idx))

  const required = ["projectid", "name", "fileurl"]
  const missing = required.filter((h) => !headerMap.has(h))
  if (missing.length > 0) {
    throw new Error(`Missing required CSV headers: ${missing.join(", ")}`)
  }

  const get = (row: string[], key: string) => {
    const idx = headerMap.get(key)
    if (idx === undefined) return ""
    return (row[idx] ?? "").trim()
  }

  const documents: any[] = []

  for (const row of dataRows) {
    const projectId = get(row, "projectid")
    const projectName = get(row, "projectname")
    const name = get(row, "name")
    const typeRaw = get(row, "type")
    const fileUrl = get(row, "fileurl")
    const fileName = get(row, "filename")
    const fileSizeStr = get(row, "filesize(bytes)") || get(row, "filesize")
    const notes = get(row, "notes")

    if (!projectId || !name || !fileUrl) {
      continue
    }

    let type = "Other"
    const typeLower = typeRaw.toLowerCase()
    if (typeLower.includes("agreement")) type = "Agreement"
    else if (typeLower.includes("drawing")) type = "Drawing"
    else if (typeLower.includes("bill")) type = "Bill"
    else if (typeLower.includes("invoice")) type = "Invoice"
    else if (typeLower.includes("approval")) type = "Approval"

    let fileSize = undefined
    if (fileSizeStr) {
      const parsedSize = parseInt(fileSizeStr, 10)
      if (!isNaN(parsedSize) && parsedSize >= 0) {
        fileSize = parsedSize
      }
    }

    documents.push({
      projectId,
      projectName,
      name,
      type,
      fileUrl,
      fileName: fileName || undefined,
      fileSize,
      notes: notes || undefined,
    })
  }

  return documents
}
