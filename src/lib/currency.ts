/**
 * Standardized Currency Formatter for Mines Casino (MineCoin / MC)
 */

export function formatCurrency(amount: number, options?: { showSign?: boolean; decimals?: number }): string {
  const { showSign = false, decimals = 2 } = options || {}
  const absAmount = Math.abs(amount)
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  const sign = amount > 0 && showSign ? '+' : amount < 0 ? '-' : ''
  return `${sign}${formatted} MC`
}

export function formatShortCurrency(amount: number): string {
  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''

  if (absAmount >= 1_000_000) {
    return `${sign}${(absAmount / 1_000_000).toFixed(2)}M MC`
  }
  if (absAmount >= 1_000) {
    return `${sign}${(absAmount / 1_000).toFixed(2)}K MC`
  }
  return formatCurrency(amount)
}
