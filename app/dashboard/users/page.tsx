"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UserManagement } from "@/components/admin/user-management"

export default function UsersPage() {
  const router = useRouter()
  const currentUser = useStore((state) => state.currentUser)

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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage your team members and their roles</p>
        </div>

        <UserManagement />
      </div>
    </DashboardLayout>
  )
}
