export function formatCurrency(amount: number, currencyCode: string = "NZD"): string {
  try {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is invalid
    return `$${amount.toLocaleString()}`;
  }
}
