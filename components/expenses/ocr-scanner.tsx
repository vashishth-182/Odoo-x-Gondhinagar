"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { processReceiptImage, validateOCRResult, type OCRResult } from "@/lib/ocr-service"
import { Camera, Upload, Loader2, CheckCircle, XCircle, Scan } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

export function OCRScanner() {
  const currentUser = useStore((state) => state.currentUser)
  const company = useStore((state) => state.company)
  const createExpense = useStore((state) => state.createExpense)

  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [ocrData, setOcrData] = useState<OCRResult | null>(null)
  const [formData, setFormData] = useState({
    amount: "",
    currency: company?.currency || "USD",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    merchantName: "",
  })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    setError("")
    setScanning(true)
    setScanned(false)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      // Process with OCR
      const result = await processReceiptImage(file)

      if (validateOCRResult(result)) {
        setOcrData(result)
        setFormData({
          amount: result.amount?.toString() || "",
          currency: result.currency || company?.currency || "USD",
          category: result.category || "",
          description: result.description || "",
          date: result.date || new Date().toISOString().split("T")[0],
          merchantName: result.merchantName || "",
        })
        setScanned(true)
      } else {
        setError("Could not extract expense data from receipt. Please enter manually.")
      }
    } catch (err) {
      setError("Failed to process receipt. Please try again.")
    } finally {
      setScanning(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !company) return

    createExpense({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      amount: Number.parseFloat(formData.amount),
      currency: formData.currency,
      amountInCompanyCurrency: Number.parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      receiptUrl: preview || undefined,
    })

    // Reset form
    setFormData({
      amount: "",
      currency: company.currency,
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      merchantName: "",
    })
    setPreview(null)
    setOcrData(null)
    setScanned(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleReset = () => {
    setFormData({
      amount: "",
      currency: company?.currency || "USD",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      merchantName: "",
    })
    setPreview(null)
    setOcrData(null)
    setScanned(false)
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          OCR Receipt Scanner
        </CardTitle>
        <CardDescription>Upload a receipt image to automatically extract expense details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 hover:border-primary transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="receipt-upload"
              />

              {preview ? (
                <div className="space-y-4 w-full">
                  <div className="relative max-w-md mx-auto">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt="Receipt preview"
                      className="rounded-lg w-full h-auto"
                    />
                    {scanning && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <p className="text-sm">Scanning receipt...</p>
                        </div>
                      </div>
                    )}
                    {scanned && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <Button variant="outline" onClick={handleReset} className="w-full bg-transparent">
                    Upload Different Receipt
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <Label htmlFor="receipt-upload" className="cursor-pointer">
                    <Button type="button" asChild>
                      <span>
                        <Camera className="mr-2 h-4 w-4" />
                        Upload Receipt
                      </span>
                    </Button>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-2">PNG, JPG up to 5MB</p>
                </>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {scanned && ocrData && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Receipt scanned successfully! Review and edit the extracted details below.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Extracted Data Form */}
          {(scanned || preview) && (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Extracted Details</h3>

              {formData.merchantName && (
                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant Name</Label>
                  <Input
                    id="merchant"
                    value={formData.merchantName}
                    onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                    placeholder="Merchant name"
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ocr-amount">Amount *</Label>
                  <Input
                    id="ocr-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ocr-currency">Currency *</Label>
                  <Input
                    id="ocr-currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ocr-category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger id="ocr-category">
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
                  <Label htmlFor="ocr-date">Date *</Label>
                  <Input
                    id="ocr-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    max={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ocr-description">Description *</Label>
                <Textarea
                  id="ocr-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your expense..."
                  rows={3}
                  required
                />
              </div>

              {ocrData?.items && ocrData.items.length > 0 && (
                <div className="space-y-2">
                  <Label>Expense Items</Label>
                  <div className="border rounded-lg p-3 space-y-2 bg-muted/50">
                    {ocrData.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="font-medium">
                          ${item.amount.toFixed(2)} {formData.currency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Cancel
                </Button>
                <Button type="submit">Submit Expense</Button>
              </div>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
