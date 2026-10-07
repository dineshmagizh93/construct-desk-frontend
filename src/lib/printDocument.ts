import { formatCurrency, formatRate } from './utils'

/** Every value that ends up in a printed document is user-entered text (client names, descriptions…),
 * and the document is written into a window that shares this app's origin — so it is escaped, always. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface PrintCompany {
  name: string
  address?: string | null
  phone?: string | null
  email?: string | null
  gstNumber?: string | null
  logoUrl?: string | null
}

/** Only plain http(s) images — never a javascript: or data: URL smuggled into the logo field. */
export function safeImageUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim()
  return trimmed && /^https?:\/\//i.test(trimmed) ? trimmed : null
}

/** The letterhead: the company's own name plus whichever details it has filled in (blank ones are left out). */
export function letterheadHtml(company: PrintCompany): string {
  const logo = safeImageUrl(company.logoUrl)
  const lines = [company.address, [company.phone, company.email].filter(Boolean).join('  ·  '), company.gstNumber ? `GSTIN: ${company.gstNumber}` : '']
    .filter((line): line is string => !!line && line.trim().length > 0)
    .map((line) => `<div class="muted">${escapeHtml(line)}</div>`)
    .join('')
  return `<header class="letterhead">${logo ? `<img class="logo" src="${escapeHtml(logo)}" alt="" />` : ''}<div><div class="company">${escapeHtml(company.name)}</div>${lines}</div></header>`
}

export interface PrintLine {
  description: string
  quantity: number
  unitPrice: number
  taxPercent?: number
}

export const lineAmount = (line: PrintLine) => line.quantity * line.unitPrice * (1 + (line.taxPercent ?? 0) / 100)

/** Item table with a GST column; totals are computed from the lines. */
export function lineItemsTableHtml(lines: PrintLine[]): string {
  const rows = lines
    .map(
      (line, i) =>
        `<tr><td>${i + 1}</td><td>${escapeHtml(line.description)}</td><td class="num">${escapeHtml(line.quantity)}</td><td class="num">${escapeHtml(formatRate(line.unitPrice))}</td><td class="num">${escapeHtml(line.taxPercent ?? 0)}%</td><td class="num">${escapeHtml(formatCurrency(Math.round(lineAmount(line))))}</td></tr>`,
    )
    .join('')
  return `<table><thead><tr><th>#</th><th>Description</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">GST</th><th class="num">Amount</th></tr></thead><tbody>${rows}</tbody></table>`
}

export function lineTotals(lines: PrintLine[]) {
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0)
  const tax = lines.reduce((s, l) => s + l.quantity * l.unitPrice * ((l.taxPercent ?? 0) / 100), 0)
  return { subtotal: Math.round(subtotal), tax: Math.round(tax), total: Math.round(subtotal + tax) }
}

export function totalsHtml(rows: { label: string; value: number; strong?: boolean; negative?: boolean }[]): string {
  return `<table class="totals">${rows
    .map((r) => `<tr class="${r.strong ? 'strong' : ''}"><td>${escapeHtml(r.label)}</td><td class="num">${r.negative ? '− ' : ''}${escapeHtml(formatCurrency(r.value))}</td></tr>`)
    .join('')}</table>`
}

export function metaHtml(pairs: [string, string | null | undefined][]): string {
  return `<dl class="meta">${pairs
    .filter(([, value]) => value && value.trim().length > 0)
    .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join('')}</dl>`
}

const STYLES = `
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; color: #111; font-size: 12px; line-height: 1.45; margin: 0; padding: 24px; }
  .letterhead { display: flex; align-items: center; gap: 14px; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 18px; }
  .logo { max-height: 56px; max-width: 120px; object-fit: contain; }
  .company { font-size: 20px; font-weight: 700; }
  .muted { color: #555; }
  h1 { font-size: 18px; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 12px; }
  .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 16px; margin: 0 0 16px; }
  .meta dt { color: #555; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; }
  .meta dd { margin: 0; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th, td { border-bottom: 1px solid #ddd; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f4f4f4; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
  .num { text-align: right; white-space: nowrap; }
  .totals { width: 320px; margin-left: auto; }
  .totals td { border: 0; padding: 3px 8px; }
  .totals .strong td { border-top: 1px solid #111; font-weight: 700; font-size: 13px; }
  .words { margin: 8px 0 16px; font-weight: 600; }
  .note { color: #555; font-size: 11px; margin-top: 18px; }
  @media print { body { padding: 0; } }
`

export function documentShell(title: string, body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title><style>${STYLES}</style></head><body>${body}</body></html>`
}

/** Opens the document in a new tab and starts the browser's print dialog (which can also save as PDF).
 * Must be called straight from a click handler or the popup blocker will stop it. */
export function openPrintWindow(title: string, bodyHtml: string): boolean {
  const win = window.open('', '_blank')
  if (!win) return false
  win.document.open()
  win.document.write(documentShell(title, bodyHtml))
  win.document.close()
  win.focus()
  // Give images (the logo) a moment to load before the dialog opens — but only ever open it once.
  let printed = false
  const printOnce = () => {
    if (printed || win.closed) return
    printed = true
    win.print()
  }
  win.addEventListener('load', printOnce)
  setTimeout(printOnce, 600)
  return true
}
