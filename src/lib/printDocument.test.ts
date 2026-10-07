import { describe, expect, it } from 'vitest'
import { documentShell, escapeHtml, letterheadHtml, lineItemsTableHtml, lineTotals, metaHtml, safeImageUrl, totalsHtml } from './printDocument'

const XSS = '<script>alert(1)</script><img src=x onerror=alert(2)>"\'&'

describe('escapeHtml', () => {
  it('escapes every HTML-significant character', () => {
    expect(escapeHtml('<b a="1" b=\'2\'>&')).toBe('&lt;b a=&quot;1&quot; b=&#39;2&#39;&gt;&amp;')
  })

  it('treats null and undefined as empty and numbers as text', () => {
    expect(escapeHtml(null)).toBe('')
    expect(escapeHtml(undefined)).toBe('')
    expect(escapeHtml(42)).toBe('42')
  })
})

describe('safeImageUrl', () => {
  it('accepts only http(s) URLs', () => {
    expect(safeImageUrl('https://cdn.example.com/logo.png')).toBe('https://cdn.example.com/logo.png')
    expect(safeImageUrl('  http://x.test/a.png ')).toBe('http://x.test/a.png')
    expect(safeImageUrl('javascript:alert(1)')).toBeNull()
    expect(safeImageUrl('data:image/svg+xml;base64,AAAA')).toBeNull()
    expect(safeImageUrl('')).toBeNull()
    expect(safeImageUrl(undefined)).toBeNull()
  })
})

describe('letterheadHtml', () => {
  it('shows the company name and only the details that exist', () => {
    const html = letterheadHtml({ name: 'Skyline Constructions', address: '12 MG Road, Bengaluru', gstNumber: '29ABCDE1234F1Z5' })
    expect(html).toContain('Skyline Constructions')
    expect(html).toContain('12 MG Road, Bengaluru')
    expect(html).toContain('GSTIN: 29ABCDE1234F1Z5')
    expect(html).not.toContain('<img')
  })

  it('leaves out blank details entirely', () => {
    const html = letterheadHtml({ name: 'Skyline', address: '  ', phone: '', email: null, gstNumber: undefined })
    expect(html).not.toContain('class="muted"')
    expect(html).not.toContain('GSTIN')
  })

  it('joins phone and email, and includes a safe logo', () => {
    const html = letterheadHtml({ name: 'S', phone: '98440 12345', email: 'a@b.co', logoUrl: 'https://cdn.example.com/l.png' })
    expect(html).toContain('98440 12345  ·  a@b.co')
    expect(html).toContain('<img class="logo" src="https://cdn.example.com/l.png"')
  })

  it('never lets markup or a hostile logo through', () => {
    const html = letterheadHtml({ name: XSS, address: XSS, phone: XSS, email: XSS, gstNumber: XSS, logoUrl: 'javascript:alert(3)' })
    expect(html).not.toContain('<script')
    expect(html).not.toContain('<img src=x')
    expect(html).not.toContain('<img') // the unsafe logo is dropped
    expect(html).toContain('&lt;script&gt;')
  })
})

describe('line items and totals', () => {
  const lines = [
    { description: 'Excavation', quantity: 100, unitPrice: 1000, taxPercent: 18 },
    { description: 'PCC', quantity: 10, unitPrice: 5000 },
  ]

  it('totals subtotal, GST and the grand total', () => {
    expect(lineTotals(lines)).toEqual({ subtotal: 150_000, tax: 18_000, total: 168_000 })
    expect(lineTotals([])).toEqual({ subtotal: 0, tax: 0, total: 0 })
  })

  it('renders one numbered row per line with GST-inclusive amounts', () => {
    const html = lineItemsTableHtml(lines)
    expect(html.match(/<tr>/g)).toHaveLength(3) // header + 2 rows
    expect(html).toContain('Excavation')
    expect(html).toContain('₹1,18,000')
    expect(html).toContain('18%')
    expect(html).toContain('0%') // a line with no tax rate shows 0%
  })

  it('escapes descriptions', () => {
    const html = lineItemsTableHtml([{ description: XSS, quantity: 1, unitPrice: 1 }])
    expect(html).not.toContain('<script')
    expect(html).toContain('&lt;script&gt;')
  })

  it('renders totals rows, marking negatives and strong rows', () => {
    const html = totalsHtml([{ label: 'Total', value: 1000, strong: true }, { label: 'Less retention', value: 50, negative: true }])
    expect(html).toContain('class="strong"')
    expect(html).toContain('− ₹50')
  })
})

describe('metaHtml / documentShell', () => {
  it('skips empty fields', () => {
    const html = metaHtml([['Invoice no.', 'INV-1'], ['Project', ''], ['Status', undefined], ['Billed to', null]])
    expect(html).toContain('INV-1')
    expect(html).not.toContain('Project')
    expect(html).not.toContain('Billed to')
  })

  it('builds a complete document and escapes the title', () => {
    const html = documentShell('Invoice <x>', '<p>body</p>')
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('<title>Invoice &lt;x&gt;</title>')
    expect(html).toContain('<p>body</p>')
    expect(html).toContain('@page')
  })
})
