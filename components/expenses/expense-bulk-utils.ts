import { parseCsv, escapeCell, normalizeHeaderKey, normalizeDateToYmd } from "@/lib/utils/csv"

export const downloadExpenseBulkTemplate = () => {
  const headers = ["Project ID", "Project Name", "Category", "Amount", "Date", "Paid To", "Notes"]
  const sample = ["PRJ-1001", "Sample Project", "Material", "150.50", "2024-01-01", "Home Depot", "Lumber purchase"]
  
  const csv = `${headers.map(escapeCell).join(",")}\n${sample.map(escapeCell).join(",")}\n`
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "expenses-bulk-upload-template.csv"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const parseBulkExpensesFromCsv = (text: string) => {
  const parsed = parseCsv(text)
  if (parsed.length === 0) return []

  const [headerRow, ...dataRows] = parsed
  const headerMap = new Map<string, number>()
  headerRow.forEach((h, idx) => headerMap.set(normalizeHeaderKey(h), idx))

  const required = ["projectid", "category", "amount", "date", "paidto"]
  const missing = required.filter((h) => !headerMap.has(h))
  if (missing.length > 0) {
    throw new Error(`Missing required CSV headers: ${missing.join(", ")}`)
  }

  const get = (row: string[], key: string) => {
    const idx = headerMap.get(key)
    if (idx === undefined) return ""
    return (row[idx] ?? "").trim()
  }

  const expenses: any[] = []

  for (const row of dataRows) {
    const projectId = get(row, "projectid")
    const projectName = get(row, "projectname")
    const categoryRaw = get(row, "category")
    const amountStr = get(row, "amount")
    const dateStr = normalizeDateToYmd(get(row, "date"))
    const paidTo = get(row, "paidto")
    const notes = get(row, "notes")

    if (!projectId || !categoryRaw || !amountStr || !dateStr || !paidTo) {
      continue
    }

    if (projectId.length > 100) throw new Error("Project ID must be 100 characters or less")
    if (paidTo.length > 80) throw new Error("Paid To must be 80 characters or less")
    if (notes && notes.length > 250) throw new Error("Notes must be 250 characters or less")

    const amount = parseFloat(amountStr)
    if (isNaN(amount)) continue

    let category = "Other"
    const catLower = categoryRaw.toLowerCase()
    if (catLower.includes("material")) category = "Material"
    else if (catLower.includes("labour") || catLower.includes("labor")) category = "Labour"
    else if (catLower.includes("transport")) category = "Transport"
    else if (catLower.includes("equipment")) category = "Equipment"

    expenses.push({
      projectId,
      projectName,
      category,
      amount,
      date: dateStr,
      paidTo,
      notes: notes || undefined,
    })
  }

  return expenses
}
