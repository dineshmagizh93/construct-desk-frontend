import { escapeHtml, letterheadHtml, lineItemsTableHtml, lineTotals, metaHtml, totalsHtml, type PrintCompany } from '@/lib/printDocument'
import { gstSplit, stateNameOf } from '@/lib/gst'
import { rupeesInWords } from '@/lib/numberToWords'
import { formatCurrency, formatDate } from '@/lib/utils'
import { netDue, retentionAmount } from './retention'
import type { Payment } from './types'

/** The printable invoice body: letterhead, bill-to and dates, items with GST, totals, amount in words
 * and — when the bill carries retention — what is held back and what is payable now. */
export function invoiceBodyHtml(payment: Payment, company: PrintCompany, projectName?: string, customerGstin?: string | null): string {
  const lines = payment.lineItems.map((li) => ({ description: li.description, quantity: li.quantity, unitPrice: li.unitPrice, taxPercent: li.taxPercent }))
  const hasLines = lines.length > 0
  const totals = lineTotals(lines)
  // With items the lines are the source of truth; a flat invoice is just its amount.
  const gross = hasLines ? totals.total : payment.amount
  const retention = retentionAmount({ amount: gross, retentionPercent: payment.retentionPercent })

  // Same state as the client: CGST + SGST. Different state: IGST. Either GSTIN unknown: one GST line.
  const split = gstSplit(totals.tax, company.gstNumber, customerGstin)
  const taxRows =
    split.kind === 'intra'
      ? [
          { label: 'CGST', value: split.cgst },
          { label: 'SGST', value: split.sgst },
        ]
      : split.kind === 'inter'
        ? [{ label: 'IGST', value: split.igst }]
        : [{ label: 'GST', value: split.gst }]
  const totalRows: { label: string; value: number; strong?: boolean; negative?: boolean }[] = hasLines
    ? [{ label: 'Subtotal', value: totals.subtotal }, ...taxRows, { label: 'Total', value: gross, strong: true }]
    : [{ label: 'Total', value: gross, strong: true }]
  if (payment.retentionPercent > 0) {
    totalRows.push({ label: `Less retention held (${payment.retentionPercent}%)`, value: retention, negative: true })
    totalRows.push({ label: 'Net payable now', value: netDue({ amount: gross, retentionPercent: payment.retentionPercent }), strong: true })
  }

  return [
    letterheadHtml(company),
    '<h1>Invoice</h1>',
    metaHtml([
      ['Invoice no.', payment.invoiceNumber],
      ['Due date', payment.dueDate ? formatDate(payment.dueDate) : null],
      ['Status', payment.status],
      ['Billed to', payment.clientName],
      ['Client GSTIN', customerGstin?.trim() || null],
      ['Place of supply', stateNameOf(customerGstin)],
      ['Project', projectName],
      ['Payment method', payment.paymentMethod],
    ]),
    hasLines
      ? lineItemsTableHtml(lines)
      : `<table><thead><tr><th>Description</th><th class="num">Amount</th></tr></thead><tbody><tr><td>${escapeHtml(projectName ? `Invoice for ${projectName}` : 'Invoice')}</td><td class="num">${escapeHtml(formatCurrency(gross))}</td></tr></tbody></table>`,
    totalsHtml(totalRows),
    `<p class="words">${escapeHtml(rupeesInWords(gross))}</p>`,
    payment.retentionPercent > 0
      ? `<p class="note">${escapeHtml(formatCurrency(retention))} is withheld as retention${payment.retentionReleasedAt ? ` and was released on ${formatDate(payment.retentionReleasedAt)}` : ' until the defects liability period ends'}.</p>`
      : '',
  ].join('')
}
