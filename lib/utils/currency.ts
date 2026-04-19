export type Currency = "INR"

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: "₹",
}

export const CURRENCY_NAMES: Record<Currency, string> = {
  INR: "Indian Rupee",
}

export const CURRENCY_LOCALES: Record<Currency, string> = {
  INR: "en-IN",
}

/**
 * Get the current currency from user's company
 * First checks localStorage, then falls back to default
 */
export function getCurrency(): Currency {
  return "INR"
}

/**
 * Get currency from auth context (user's company)
 * This should be used in components that have access to useAuth
 */
export function getCurrencyFromAuth(user: any): Currency {
  return "INR"
}

/**
 * Format a number as currency based on the selected currency
 */
export function formatCurrency(amount: number, currency?: Currency): string {
  const selectedCurrency = currency || getCurrency()
  const locale = CURRENCY_LOCALES[selectedCurrency]
  
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: selectedCurrency,
  }).format(amount)
}

/**
 * Format currency with custom options
 */
export function formatCurrencyCustom(
  amount: number,
  options?: {
    currency?: Currency
    maximumFractionDigits?: number
    minimumFractionDigits?: number
  }
): string {
  const selectedCurrency = options?.currency || getCurrency()
  const locale = CURRENCY_LOCALES[selectedCurrency]
  
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: selectedCurrency,
    maximumFractionDigits: options?.maximumFractionDigits,
    minimumFractionDigits: options?.minimumFractionDigits,
  }).format(amount)
}

/**
 * Hook to get currency from auth context
 * Use this in components that have access to useAuth
 */
export function useCurrency(user?: any): Currency {
  return "INR"
}

/**
 * Set currency preference
 */
export function setCurrency(currency: Currency): void {
  if (typeof window === "undefined") return
  localStorage.setItem("company_currency", "INR")
}

