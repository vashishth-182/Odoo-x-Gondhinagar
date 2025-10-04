export interface OCRResult {
  amount?: number
  currency?: string
  date?: string
  merchantName?: string
  category?: string
  description?: string
  items?: Array<{
    name: string
    amount: number
  }>
}

// Simulated OCR service - In production, this would call a real OCR API
export async function processReceiptImage(imageFile: File): Promise<OCRResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Simulate OCR extraction
  // In production, you would use services like:
  // - Google Cloud Vision API
  // - AWS Textract
  // - Azure Computer Vision
  // - Tesseract.js (client-side)

  const mockResults: OCRResult[] = [
    {
      amount: 45.99,
      currency: "USD",
      date: new Date().toISOString().split("T")[0],
      merchantName: "Starbucks Coffee",
      category: "Meals & Entertainment",
      description: "Coffee meeting with client",
      items: [
        { name: "Latte", amount: 5.5 },
        { name: "Cappuccino", amount: 5.5 },
        { name: "Croissant", amount: 3.99 },
      ],
    },
    {
      amount: 125.5,
      currency: "USD",
      date: new Date().toISOString().split("T")[0],
      merchantName: "Office Depot",
      category: "Office Supplies",
      description: "Office supplies for team",
      items: [
        { name: "Paper Reams", amount: 45.0 },
        { name: "Pens", amount: 15.5 },
        { name: "Notebooks", amount: 25.0 },
      ],
    },
    {
      amount: 89.99,
      currency: "USD",
      date: new Date().toISOString().split("T")[0],
      merchantName: "Uber",
      category: "Transportation",
      description: "Ride to client meeting",
    },
    {
      amount: 250.0,
      currency: "USD",
      date: new Date().toISOString().split("T")[0],
      merchantName: "Hilton Hotel",
      category: "Accommodation",
      description: "Business trip accommodation",
    },
  ]

  // Return a random mock result
  return mockResults[Math.floor(Math.random() * mockResults.length)]
}

export function validateOCRResult(result: OCRResult): boolean {
  return !!(result.amount && result.amount > 0)
}
