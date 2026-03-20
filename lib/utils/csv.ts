export function escapeCell(v: string): string {
  const needsQuotes = v.includes(",") || v.includes('"') || v.includes("\n") || v.includes("\r")
  const escaped = v.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cur = ""
  let inQuotes = false

  const pushField = () => {
    row.push(cur.trim())
    cur = ""
  }

  const pushRow = () => {
    // Ignore empty trailing rows
    const isAllEmpty = row.every((c) => c === "")
    if (!isAllEmpty) rows.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (ch === '"') {
      // Handle escaped quotes
      if (inQuotes && text[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && ch === ",") {
      pushField()
      continue
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && text[i + 1] === "\n") i++
      pushField()
      pushRow()
      continue
    }

    cur += ch
  }

  pushField()
  pushRow()
  return rows
}

export function normalizeHeaderKey(header: string): string {
  return header
    .trim()
    .toLowerCase()
    // keep letters/numbers only so "Project ID" == "projectId"
    .replace(/[^a-z0-9]/g, "")
}

export function normalizeDateToYmd(val: string): string {
  const v = val.trim()
  if (!v) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ""
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

