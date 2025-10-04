"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Eye, Calendar, DollarSign, User, ArrowRight } from "lucide-react"
import type { Expense } from "@/lib/types"

export function ApprovalQueue() {
  const currentUser = useStore((state) => state.currentUser)
  const company = useStore((state) => state.company)
  const expenses = useStore((state) => state.expenses)
  const updateExpenseStatus = useStore((state) => state.updateExpenseStatus)

  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [comments, setComments] = useState("")
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)

  const pendingApprovals = expenses.filter((e) => e.status === "pending" && e.currentApproverId === currentUser?.id)

  const handleAction = (expense: Expense, action: "approve" | "reject") => {
    setSelectedExpense(expense)
    setActionType(action)
  }

  const confirmAction = () => {
    if (!selectedExpense || !actionType || !currentUser) return

    updateExpenseStatus(
      selectedExpense.id,
      actionType === "approve" ? "approved" : "rejected",
      currentUser.id,
      comments || undefined,
    )

    setSelectedExpense(null)
    setActionType(null)
    setComments("")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getCurrentStepInfo = (expense: Expense) => {
    const currentStep = expense.approvalHistory.find((s) => s.approverId === currentUser?.id && s.status === "pending")
    if (!currentStep) return null

    const totalSteps = expense.approvalHistory.length
    const currentStepNumber = currentStep.sequence + 1

    return {
      current: currentStepNumber,
      total: totalSteps,
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Review and approve expense claims awaiting your decision</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending approvals</p>
              <p className="text-sm text-muted-foreground mt-1">All caught up!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Step</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((expense) => {
                  const stepInfo = getCurrentStepInfo(expense)
                  return (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.employeeName}</TableCell>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {expense.amountInCompanyCurrency?.toFixed(2) || expense.amount} {company?.currency}
                        </div>
                        {expense.currency !== company?.currency && (
                          <div className="text-xs text-muted-foreground">
                            ({expense.amount} {expense.currency})
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {stepInfo && (
                          <Badge variant="secondary">
                            {stepInfo.current}/{stepInfo.total}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Expense Details</DialogTitle>
                                <DialogDescription>Review complete expense information</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <User className="h-4 w-4" />
                                      <span>Employee</span>
                                    </div>
                                    <p className="font-medium">{expense.employeeName}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar className="h-4 w-4" />
                                      <span>Date</span>
                                    </div>
                                    <p className="font-medium">{formatDate(expense.date)}</p>
                                  </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <DollarSign className="h-4 w-4" />
                                      <span>Amount</span>
                                    </div>
                                    <p className="font-medium">
                                      {expense.amount} {expense.currency}
                                    </p>
                                    {expense.currency !== company?.currency && (
                                      <p className="text-sm text-muted-foreground">
                                        ≈ {expense.amountInCompanyCurrency?.toFixed(2)} {company?.currency}
                                      </p>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Category</p>
                                    <Badge variant="outline">{expense.category}</Badge>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-sm text-muted-foreground">Description</p>
                                  <p className="font-medium">{expense.description}</p>
                                </div>

                                {expense.approvalHistory.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Approval Flow</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {expense.approvalHistory.map((step, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                          <div
                                            className={`px-3 py-2 rounded-lg text-sm ${
                                              step.status === "approved"
                                                ? "bg-green-100 text-green-700"
                                                : step.status === "rejected"
                                                  ? "bg-red-100 text-red-700"
                                                  : step.approverId === currentUser?.id
                                                    ? "bg-blue-100 text-blue-700 font-medium"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                          >
                                            {step.approverName}
                                            {step.approverId === currentUser?.id && " (You)"}
                                          </div>
                                          {index < expense.approvalHistory.length - 1 && (
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleAction(expense, "approve")}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleAction(expense, "reject")}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedExpense && !!actionType} onOpenChange={() => setSelectedExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve" : "Reject"} Expense</DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "This expense will move to the next approver or be marked as approved."
                : "This expense will be rejected and returned to the employee."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedExpense && (
              <div className="p-4 rounded-lg bg-muted space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Employee</span>
                  <span className="font-medium">{selectedExpense.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    {selectedExpense.amountInCompanyCurrency?.toFixed(2) || selectedExpense.amount} {company?.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Description</span>
                  <span className="font-medium">{selectedExpense.description}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any comments or notes..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedExpense(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
