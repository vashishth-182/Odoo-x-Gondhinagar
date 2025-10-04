"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ApprovalHistory() {
  const currentUser = useStore((state) => state.currentUser)
  const company = useStore((state) => state.company)
  const expenses = useStore((state) => state.expenses)

  const myApprovals = expenses.filter((e) =>
    e.approvalHistory.some((step) => step.approverId === currentUser?.id && step.status !== "pending"),
  )

  const approved = myApprovals.filter((e) =>
    e.approvalHistory.some((step) => step.approverId === currentUser?.id && step.status === "approved"),
  )

  const rejected = myApprovals.filter((e) =>
    e.approvalHistory.some((step) => step.approverId === currentUser?.id && step.status === "rejected"),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getMyComment = (expense: any) => {
    const myStep = expense.approvalHistory.find((step: any) => step.approverId === currentUser?.id)
    return myStep?.comments || "-"
  }

  const getMyActionDate = (expense: any) => {
    const myStep = expense.approvalHistory.find((step: any) => step.approverId === currentUser?.id)
    return myStep?.timestamp ? formatDate(myStep.timestamp) : "-"
  }

  const ExpenseTable = ({ expenses }: { expenses: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>My Action</TableHead>
          <TableHead>Comments</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No expenses found
            </TableCell>
          </TableRow>
        ) : (
          expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">{expense.employeeName}</TableCell>
              <TableCell>{formatDate(expense.date)}</TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>
                {expense.amountInCompanyCurrency?.toFixed(2) || expense.amount} {company?.currency}
              </TableCell>
              <TableCell>{getMyActionDate(expense)}</TableCell>
              <TableCell className="max-w-xs truncate">{getMyComment(expense)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval History</CardTitle>
        <CardDescription>View your past approval decisions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              All <Badge className="ml-2">{myApprovals.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved <Badge className="ml-2">{approved.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected <Badge className="ml-2">{rejected.length}</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <ExpenseTable expenses={myApprovals} />
          </TabsContent>
          <TabsContent value="approved">
            <ExpenseTable expenses={approved} />
          </TabsContent>
          <TabsContent value="rejected">
            <ExpenseTable expenses={rejected} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
