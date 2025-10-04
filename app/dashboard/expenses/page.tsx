"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ExpenseForm } from "@/components/expenses/expense-form"
import { ExpenseList } from "@/components/expenses/expense-list"
import { OCRScanner } from "@/components/expenses/ocr-scanner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ExpensesPage() {
  const router = useRouter()
  const currentUser = useStore((state) => state.currentUser)

  useEffect(() => {
    if (!currentUser) {
      router.push("/")
    }
  }, [currentUser, router])

  if (!currentUser) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Submit and manage your expense claims</p>
        </div>

        <Tabs defaultValue="submit" className="space-y-4">
          <TabsList>
            <TabsTrigger value="submit">Submit Expense</TabsTrigger>
            <TabsTrigger value="ocr">Scan Receipt</TabsTrigger>
            <TabsTrigger value="history">My Expenses</TabsTrigger>
          </TabsList>
          <TabsContent value="submit" className="space-y-4">
            <ExpenseForm />
          </TabsContent>
          <TabsContent value="ocr" className="space-y-4">
            <OCRScanner />
          </TabsContent>
          <TabsContent value="history" className="space-y-4">
            <ExpenseList />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
