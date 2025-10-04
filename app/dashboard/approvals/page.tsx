"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ApprovalQueue } from "@/components/approvals/approval-queue"
import { ApprovalHistory } from "@/components/approvals/approval-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ApprovalsPage() {
  const router = useRouter()
  const currentUser = useStore((state) => state.currentUser)

  useEffect(() => {
    if (!currentUser) {
      router.push("/")
    } else if (currentUser.role === "employee") {
      router.push("/dashboard")
    }
  }, [currentUser, router])

  if (!currentUser || currentUser.role === "employee") return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
          <p className="text-muted-foreground">Review and manage expense approvals</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="space-y-4">
            <ApprovalQueue />
          </TabsContent>
          <TabsContent value="history" className="space-y-4">
            <ApprovalHistory />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
