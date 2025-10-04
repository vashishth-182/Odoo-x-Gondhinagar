"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { Receipt, TrendingUp, Shield, Zap, CheckCircle } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const currentUser = useStore((state) => state.currentUser)

  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard")
    }
  }, [currentUser, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">ExpenseFlow</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          <div className="space-y-10 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                Expense management
                <span className="block text-blue-600">made simple</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                Streamline approvals, track spending in real-time, and empower your team with intelligent expense
                management.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-sm card-hover">
                <div className="h-11 w-11 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900">Multi-level Approvals</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Configure complex approval workflows with conditional rules and automatic routing
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-sm card-hover">
                <div className="h-11 w-11 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900">Real-Time Currency Conversion</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Automatic conversion with live exchange rates for seamless global operations
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-sm card-hover">
                <div className="h-11 w-11 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-violet-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900">Smart OCR Scanning</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Snap a photo and let AI extract all expense details automatically
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Free to start</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto animate-scale-in">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-11 bg-slate-100 p-1">
                <TabsTrigger
                  value="login"
                  className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-6">
                <LoginForm />
              </TabsContent>
              <TabsContent value="signup" className="mt-6">
                <SignupForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
