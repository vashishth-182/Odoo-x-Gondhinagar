"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Eye, Calendar, DollarSign, Tag } from "lucide-react"
import { useState } from "react"
import type { Expense } from "@/lib/types"

export function ExpenseList() {
  const currentUser = useStore((state) => state.currentUser)
  const company = useStore((state) => state.company)
  const expenses = useStore((state) => state.expenses)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  const myExpenses = expenses.filter((e) => e.employeeId === currentUser?.id)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Expenses</CardTitle>
        <CardDescription>View and track your submitted expense claims</CardDescription>
      </CardHeader>
      <CardContent>
        {myExpenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No expenses submitted yet</p>
            <p className="text-sm text-muted-foreground mt-1">Submit your first expense above</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>
                    {expense.amount} {expense.currency}
                    {expense.currency !== company?.currency && (
                      <div className="text-xs text-muted-foreground">
                        ≈ {expense.amountInCompanyCurrency?.toFixed(2)} {company?.currency}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(expense.status)}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedExpense(expense)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Expense Details</DialogTitle>
                          <DialogDescription>Complete information about this expense claim</DialogDescription>
                        </DialogHeader>
                        {selectedExpense && (
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>Date</span>
                                </div>
                                <p className="font-medium">{formatDate(selectedExpense.date)}</p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <DollarSign className="h-4 w-4" />
                                  <span>Amount</span>
                                </div>
                                <p className="font-medium">
                                  {selectedExpense.amount} {selectedExpense.currency}
                                </p>
                                {selectedExpense.currency !== company?.currency && (
                                  <p className="text-sm text-muted-foreground">
                                    ≈ {selectedExpense.amountInCompanyCurrency?.toFixed(2)} {company?.currency}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Tag className="h-4 w-4" />
                                <span>Category</span>
                              </div>
                              <p className="font-medium">{selectedExpense.category}</p>
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">Description</p>
                              <p className="font-medium">{selectedExpense.description}</p>
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">Status</p>
                              {getStatusBadge(selectedExpense.status)}
                            </div>

                            {selectedExpense.approvalHistory.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Approval History</p>
                                <div className="space-y-2">
                                  {selectedExpense.approvalHistory.map((step, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                                    >
                                      <div>
                                        <p className="font-medium text-sm">{step.approverName}</p>
                                        {step.comments && (
                                          <p className="text-xs text-muted-foreground mt-1">{step.comments}</p>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        {getStatusBadge(step.status)}
                                        {step.timestamp && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {formatDate(step.timestamp)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
