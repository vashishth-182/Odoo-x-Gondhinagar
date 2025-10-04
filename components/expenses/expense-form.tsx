"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchCountries, fetchExchangeRates, convertCurrency, type CountryData } from "@/lib/currency-api"
import { Upload, Loader2 } from "lucide-react"

const EXPENSE_CATEGORIES = [
  "Travel",
  "Meals & Entertainment",
  "Office Supplies",
  "Software & Subscriptions",
  "Transportation",
  "Accommodation",
  "Training & Education",
  "Marketing",
  "Other",
]

interface ExpenseFormProps {
  onSuccess?: () => void
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const currentUser = useStore((state) => state.currentUser)
  const company = useStore((state) => state.company)
  const createExpense = useStore((state) => state.createExpense)

  const [countries, setCountries] = useState<CountryData[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    amount: "",
    currency: company?.currency || "USD",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    receiptUrl: "",
  })

  useEffect(() => {
    const loadCountries = async () => {
      const data = await fetchCountries()
      const filtered = data.filter((c) => c.currencies && Object.keys(c.currencies).length > 0)
      setCountries(filtered)
      setLoadingCountries(false)
    }
    loadCountries()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !company) return

    setSubmitting(true)

    let amountInCompanyCurrency = Number.parseFloat(formData.amount)

    // Convert currency if different from company currency
    if (formData.currency !== company.currency) {
      const rates = await fetchExchangeRates(company.currency)
      if (rates) {
        amountInCompanyCurrency = convertCurrency(
          Number.parseFloat(formData.amount),
          formData.currency,
          company.currency,
          rates.rates,
        )
      }
    }

    createExpense({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      amount: Number.parseFloat(formData.amount),
      currency: formData.currency,
      amountInCompanyCurrency,
      category: formData.category,
      description: formData.description,
      date: formData.date,
      receiptUrl: formData.receiptUrl || undefined,
    })

    setFormData({
      amount: "",
      currency: company.currency,
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      receiptUrl: "",
    })

    setSubmitting(false)
    onSuccess?.()
  }

  const allCurrencies = countries.reduce(
    (acc, country) => {
      if (country.currencies) {
        Object.entries(country.currencies).forEach(([code, currency]) => {
          if (!acc[code]) {
            acc[code] = currency
          }
        })
      }
      return acc
    },
    {} as Record<string, { name: string; symbol: string }>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Expense</CardTitle>
        <CardDescription>Fill in the details of your expense claim</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
                disabled={loadingCountries}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder={loadingCountries ? "Loading..." : "Select currency"} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(allCurrencies).map(([code, currency]) => (
                    <SelectItem key={code} value={code}>
                      {code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your expense..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt URL (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="receipt"
                type="url"
                value={formData.receiptUrl}
                onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                placeholder="https://..."
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">You can also scan a receipt using OCR in the next section</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({
                  amount: "",
                  currency: company?.currency || "USD",
                  category: "",
                  description: "",
                  date: new Date().toISOString().split("T")[0],
                  receiptUrl: "",
                })
              }
            >
              Clear
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Expense"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
