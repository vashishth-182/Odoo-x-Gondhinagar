"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Receipt, Users, FileText, Settings, LogOut, LayoutDashboard, Bell } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentUser = useStore((state) => state.currentUser)
  const company = useStore((state) => state.company)
  const expenses = useStore((state) => state.expenses)
  const logout = useStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "employee"] },
    { name: "Expenses", href: "/dashboard/expenses", icon: FileText, roles: ["admin", "manager", "employee"] },
    { name: "Approvals", href: "/dashboard/approvals", icon: Receipt, roles: ["admin", "manager"] },
    { name: "Users", href: "/dashboard/users", icon: Users, roles: ["admin"] },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["admin"] },
  ]

  const filteredNavigation = navigation.filter((item) => currentUser && item.roles.includes(currentUser.role))

  const pendingApprovalsCount = expenses.filter(
    (e) => e.status === "pending" && e.currentApproverId === currentUser?.id,
  ).length

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="flex h-16 items-center gap-6 px-6">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-slate-900">ExpenseFlow</span>
          </Link>

          <nav className="flex items-center gap-1 ml-6">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "gap-2 h-9 px-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            {(currentUser?.role === "admin" || currentUser?.role === "manager") && pendingApprovalsCount > 0 && (
              <Link href="/dashboard/approvals">
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-5 w-5 text-slate-600" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium">
                    {pendingApprovalsCount}
                  </span>
                </Button>
              </Link>
            )}

            <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
              <div className="text-xs font-semibold text-slate-900">{company?.name}</div>
              <div className="text-xs text-slate-600">
                {company?.currency} • {company?.country}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full hover:ring-2 ring-slate-200 transition-all"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                      {currentUser && getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-semibold text-slate-900">{currentUser?.name}</p>
                    <p className="text-xs text-slate-600">{currentUser?.email}</p>
                    <Badge variant="secondary" className="w-fit mt-1 capitalize text-xs">
                      {currentUser?.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="p-6 animate-fade-in">{children}</main>
    </div>
  )
}
