"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ApprovalRules } from "@/components/settings/approval-rules"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const router = useRouter()
  const currentUser = useStore((state) => state.currentUser)
  const company = useStore((state) => state.company)

  useEffect(() => {
    if (!currentUser) {
      router.push("/")
    } else if (currentUser.role !== "admin") {
      router.push("/dashboard")
    }
  }, [currentUser, router])

  if (!currentUser || currentUser.role !== "admin") return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your company settings and approval workflows</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Your company details and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-medium">{company?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-medium">{company?.country}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Default Currency</p>
                <p className="font-medium">
                  <Badge variant="outline">{company?.currency}</Badge>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {company?.createdAt &&
                    new Date(company.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ApprovalRules />
      </div>
    </DashboardLayout>
  )
}
