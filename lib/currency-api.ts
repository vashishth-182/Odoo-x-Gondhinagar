export interface CountryData {
  name: {
    common: string
    official: string
  }
  currencies: Record<
    string,
    {
      name: string
      symbol: string
    }
  >
}

export interface ExchangeRates {
  base: string
  rates: Record<string, number>
}

export async function fetchCountries(): Promise<CountryData[]> {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies")
    if (!response.ok) throw new Error("Failed to fetch countries")
    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching countries:", error)
    return []
  }
}

export async function fetchExchangeRates(baseCurrency: string): Promise<ExchangeRates | null> {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
    if (!response.ok) throw new Error("Failed to fetch exchange rates")
    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching exchange rates:", error)
    return null
  }
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>,
): number {
  if (fromCurrency === toCurrency) return amount

  // Convert to base currency first, then to target currency
  const amountInBase = amount / rates[fromCurrency]
  return amountInBase * rates[toCurrency]
}
