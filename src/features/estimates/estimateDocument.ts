import { escapeHtml, letterheadHtml, lineItemsTableHtml, lineTotals, metaHtml, totalsHtml, type PrintCompany } from '@/lib/printDocument'
import { rupeesInWords } from '@/lib/numberToWords'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Estimate } from './types'

/** The printable estimate / quotation: letterhead, who it is for and until when it is valid, the BOQ
 * with GST and the total — or just the total when the estimate has no itemised BOQ. */
export function estimateBodyHtml(estimate: Estimate, company: PrintCompany): string {
  const lines = estimate.lineItems.map((li) => ({ description: li.description, quantity: li.quantity, unitPrice: li.unitPrice, taxPercent: li.taxPercent }))
  const hasLines = lines.length > 0
  const totals = lineTotals(lines)
  const total = hasLines ? totals.total : estimate.totalAmount

  return [
    letterheadHtml(company),
    '<h1>Estimate / Quotation</h1>',
    metaHtml([
      ['Estimate', estimate.title],
      ['Prepared for', estimate.clientName],
      ['Project type', estimate.projectType],
      ['Valid until', estimate.validUntil ? formatDate(estimate.validUntil) : null],
      ['Date', estimate.createdAt ? formatDate(estimate.createdAt) : null],
      ['Status', estimate.status],
    ]),
    hasLines
      ? lineItemsTableHtml(lines)
      : `<table><thead><tr><th>Description</th><th class="num">Amount</th></tr></thead><tbody><tr><td>${escapeHtml(estimate.title)}</td><td class="num">${escapeHtml(formatCurrency(total))}</td></tr></tbody></table>`,
    totalsHtml(
      hasLines
        ? [
            { label: 'Subtotal', value: totals.subtotal },
            { label: 'GST', value: totals.tax },
            { label: 'Estimated total', value: total, strong: true },
          ]
        : [{ label: 'Estimated total', value: total, strong: true }],
    ),
    `<p class="words">${escapeHtml(rupeesInWords(total))}</p>`,
    '<p class="note">This is an estimate, not a tax invoice.</p>',
  ].join('')
}
