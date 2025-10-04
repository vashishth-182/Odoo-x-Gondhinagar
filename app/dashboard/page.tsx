"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Receipt, Users, CheckCircle, Clock, TrendingUp, ArrowRight, DollarSign, Plus } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const currentUser = useStore((state) => state.currentUser)
  const company = useStore((state) => state.company)
  const users = useStore((state) => state.users)
  const expenses = useStore((state) => state.expenses)

  useEffect(() => {
    if (!currentUser) {
      router.push("/")
    }
  }, [currentUser, router])

  if (!currentUser) return null

  const myExpenses = expenses.filter((e) => e.employeeId === currentUser.id)
  const pendingApprovals = expenses.filter((e) => e.status === "pending" && e.currentApproverId === currentUser.id)
  const approvedExpenses = expenses.filter((e) => e.status === "approved")
  const totalExpenseAmount = expenses
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + (e.amountInCompanyCurrency || e.amount), 0)

  const stats = [
    {
      title: "Total Expenses",
      value: expenses.length,
      icon: Receipt,
      description: "All submitted",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
    },
    {
      title: "Pending Approvals",
      value: pendingApprovals.length,
      icon: Clock,
      description: "Awaiting review",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      change: pendingApprovals.length > 0 ? "Action needed" : "All clear",
    },
    {
      title: "Approved",
      value: approvedExpenses.length,
      icon: CheckCircle,
      description: `${totalExpenseAmount.toFixed(0)} ${company?.currency}`,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: "+8%",
    },
    {
      title: "Team Members",
      value: users.length,
      icon: Users,
      description: "Active users",
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      change: "All roles",
    },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {currentUser.name.split(" ")[0]}
            </h1>
            <p className="text-slate-600">Here's an overview of your expense activity</p>
          </div>
          <Link href="/dashboard/expenses">
            <Button size="lg" className="gap-2 h-11 bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Plus className="h-4 w-4" />
              New Expense
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.title}
                className="border-slate-200 card-hover animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                  <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                  <p className="text-xs text-slate-600">{stat.description}</p>
                  <div className="flex items-center gap-1 pt-1">
                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                    <span className="text-xs text-slate-600">{stat.change}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  <CardDescription>Latest expense submissions</CardDescription>
                </div>
                <Link href="/dashboard/expenses">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expenses.slice(0, 5).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3.5 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          expense.status === "approved"
                            ? "bg-emerald-100"
                            : expense.status === "rejected"
                              ? "bg-red-100"
                              : "bg-amber-100"
                        }`}
                      >
                        <DollarSign
                          className={`h-5 w-5 ${
                            expense.status === "approved"
                              ? "text-emerald-600"
                              : expense.status === "rejected"
                                ? "text-red-600"
                                : "text-amber-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{expense.description}</p>
                        <p className="text-xs text-slate-500">
                          {expense.employeeName} • {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {expense.amount} {expense.currency}
                      </p>
                      <Badge
                        variant={
                          expense.status === "approved"
                            ? "default"
                            : expense.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                        className="mt-1 text-xs"
                      >
                        {expense.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <div className="text-center py-12">
                    <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-900">No expenses yet</p>
                    <p className="text-xs text-slate-500 mt-1">Submit your first expense to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Your Overview</CardTitle>
              <CardDescription>Personal expense statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">My Expenses</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">{myExpenses.length}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">Pending Review</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">
                    {myExpenses.filter((e) => e.status === "pending").length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">Approved</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">
                    {myExpenses.filter((e) => e.status === "approved").length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">Rejected</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">
                    {myExpenses.filter((e) => e.status === "rejected").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
