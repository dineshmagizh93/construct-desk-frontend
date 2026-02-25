export type Currency = "USD" | "INR"

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  INR: "₹",
}

export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: "US Dollar",
  INR: "Indian Rupee",
}

export const CURRENCY_LOCALES: Record<Currency, string> = {
  USD: "en-US",
  INR: "en-IN",
}

/**
 * Get the current currency from user's company
 * First checks localStorage, then falls back to default
 */
export function getCurrency(): Currency {
  if (typeof window === "undefined") return "USD"
  
  // Try to get from localStorage first (for client-side)
  const stored = localStorage.getItem("company_currency")
  if (stored === "USD" || stored === "INR") {
    return stored
  }
  
  return "USD" // Default
}

/**
 * Get currency from auth context (user's company)
 * This should be used in components that have access to useAuth
 */
export function getCurrencyFromAuth(user: any): Currency {
  if (user?.company?.currency === "USD" || user?.company?.currency === "INR") {
    return user.company.currency
  }
  return getCurrency()
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
  // First try to get from user's company
  if (user?.company?.currency === "USD" || user?.company?.currency === "INR") {
    return user.company.currency
  }
  
  // Fallback to localStorage
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("company_currency")
    if (stored === "USD" || stored === "INR") {
      return stored
    }
  }
  
  return "USD"
}

/**
 * Set currency preference
 */
export function setCurrency(currency: Currency): void {
  if (typeof window === "undefined") return
  localStorage.setItem("company_currency", currency)
}

