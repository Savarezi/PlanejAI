/**
 * Utility functions for currency masking, formatting, and numeric operations.
 */

/**
 * Formats a number directly as a Brazilian Real (R$) currency string.
 */
export function formatCurrencyValue(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Parses and formats raw keypad input into standard BRL currency format.
 * Automatically keeps track of units and cents.
 */
export function parseBRLInput(inputValue: string): { numericValue: number; formattedString: string } {
  // Extract all digits
  const cleanDigits = inputValue.replace(/\D/g, "");
  
  if (!cleanDigits) {
    return { numericValue: 0, formattedString: "" };
  }

  const cents = parseInt(cleanDigits, 10);
  const numericValue = cents / 100;

  const formattedString = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);

  return { numericValue, formattedString };
}

/**
 * Basic number to simple string format (for months etc)
 */
export function formatMonths(months: number): string {
  return months === 1 ? "1 mês" : `${months} meses`;
}

/**
 * Generate unique IDs for simulations
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}
