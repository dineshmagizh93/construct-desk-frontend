/** Rounds to at most one decimal and drops a trailing ".0" (8 not 8.0, 2.5 stays 2.5). */
const trim = (n: number) => String(Math.round(n * 10) / 10)

/**
 * A rupee amount as a short chart-axis label in the Indian system: ₹0, ₹500, ₹25K, ₹8L, ₹2.5 Cr.
 * Plain Lakh figures like "₹800L" are hard to read once the amounts reach crores.
 */
export function formatRupeeAxis(value: number): string {
  const sign = value < 0 ? '-' : ''
  const n = Math.abs(value)
  if (n >= 10_000_000) return `${sign}₹${trim(n / 10_000_000)} Cr`
  if (n >= 100_000) return `${sign}₹${trim(n / 100_000)}L`
  if (n >= 1_000) return `${sign}₹${trim(n / 1_000)}K`
  return `${sign}₹${Math.round(n)}`
}
