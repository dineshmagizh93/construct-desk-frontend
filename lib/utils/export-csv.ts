export function downloadCsv(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function objectsToCsv(data: Record<string, any>[], columns: { key: string; label: string }[]): string {
  const header = columns.map((c) => c.label).join(",")
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key]
      if (val === null || val === undefined) return ""
      const str = String(val).replace(/"/g, '""')
      return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str
    }).join(",")
  )
  return [header, ...rows].join("\n")
}
