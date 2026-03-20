import { parseCsv, escapeCell, normalizeHeaderKey, normalizeDateToYmd } from "@/lib/utils/csv"

export const downloadPaymentBulkTemplate = () => {
  const headers = ["Project ID", "Project Name", "Milestone", "Amount", "Due Date", "Status", "Paid Date", "Notes"]
  const sample = ["PRJ-1001", "Sample Project", "Initial Deposit", "5000.00", "2024-01-15", "Pending", "", "First payment milestone"]
  
  const csv = `${headers.map(escapeCell).join(",")}\n${sample.map(escapeCell).join(",")}\n`
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "payments-bulk-upload-template.csv"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const parseBulkPaymentsFromCsv = (text: string) => {
  const parsed = parseCsv(text)
  if (parsed.length === 0) return []

  const [headerRow, ...dataRows] = parsed
  const headerMap = new Map<string, number>()
  headerRow.forEach((h, idx) => headerMap.set(normalizeHeaderKey(h), idx))

  const required = ["projectid", "milestone", "amount", "duedate"]
  const missing = required.filter((h) => !headerMap.has(h))
  if (missing.length > 0) {
    throw new Error(`Missing required CSV headers: ${missing.join(", ")}`)
  }

  const get = (row: string[], key: string) => {
    const idx = headerMap.get(key)
    if (idx === undefined) return ""
    return (row[idx] ?? "").trim()
  }

  const payments: any[] = []

  for (const row of dataRows) {
    const projectId = get(row, "projectid")
    const projectName = get(row, "projectname")
    const milestone = get(row, "milestone")
    const amountStr = get(row, "amount")
    const dueDateStr = normalizeDateToYmd(get(row, "duedate"))
    const statusRaw = get(row, "status")
    const paidDateStr = normalizeDateToYmd(get(row, "paiddate"))
    const notes = get(row, "notes")

    if (!projectId || !milestone || !amountStr || !dueDateStr) {
      continue
    }

    const amount = parseFloat(amountStr)
    if (isNaN(amount)) continue

    let status = "Pending"
    const statusLower = statusRaw.toLowerCase()
    if (statusLower.includes("paid")) status = "Paid"
    else if (statusLower.includes("overdue")) status = "Overdue"

    payments.push({
      projectId,
      projectName,
      milestone,
      amount,
      dueDate: dueDateStr,
      status,
      paidDate: paidDateStr || undefined,
      notes: notes || undefined,
    })
  }

  return payments
}
