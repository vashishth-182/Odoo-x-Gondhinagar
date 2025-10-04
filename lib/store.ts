"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Company, Expense, ApprovalRule } from "./types"

interface AppState {
  currentUser: User | null
  company: Company | null
  users: User[]
  expenses: Expense[]
  approvalRules: ApprovalRule[]

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>
  signup: (
    email: string,
    password: string,
    name: string,
    companyName: string,
    country: string,
    currency: string,
  ) => Promise<boolean>
  logout: () => void

  // User management
  createUser: (user: Omit<User, "id" | "createdAt">) => void
  updateUser: (userId: string, updates: Partial<User>) => void
  deleteUser: (userId: string) => void

  // Expense management
  createExpense: (expense: Omit<Expense, "id" | "createdAt" | "status" | "approvalHistory">) => void
  updateExpenseStatus: (
    expenseId: string,
    status: "approved" | "rejected",
    approverId: string,
    comments?: string,
  ) => void

  // Approval rules
  createApprovalRule: (rule: Omit<ApprovalRule, "id" | "createdAt">) => void
  updateApprovalRule: (ruleId: string, updates: Partial<ApprovalRule>) => void
  deleteApprovalRule: (ruleId: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      company: null,
      users: [],
      expenses: [],
      approvalRules: [],

      login: async (email: string, password: string) => {
        const users = get().users
        const user = users.find((u) => u.email === email)

        if (user) {
          set({ currentUser: user })
          return true
        }
        return false
      },

      signup: async (
        email: string,
        password: string,
        name: string,
        companyName: string,
        country: string,
        currency: string,
      ) => {
        const companyId = `company_${Date.now()}`
        const userId = `user_${Date.now()}`

        const newCompany: Company = {
          id: companyId,
          name: companyName,
          currency,
          country,
          createdAt: new Date().toISOString(),
        }

        const newUser: User = {
          id: userId,
          email,
          name,
          role: "admin",
          companyId,
          createdAt: new Date().toISOString(),
        }

        set({
          company: newCompany,
          currentUser: newUser,
          users: [newUser],
        })

        return true
      },

      logout: () => {
        set({ currentUser: null })
      },

      createUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: `user_${Date.now()}`,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ users: [...state.users, newUser] }))
      },

      updateUser: (userId, updates) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
        }))
      },

      deleteUser: (userId) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
        }))
      },

      createExpense: (expenseData) => {
        const state = get()
        const defaultRule = state.approvalRules[0]

        const approvalHistory: any[] = []

        if (defaultRule) {
          if (defaultRule.isManagerApprover) {
            const employee = state.users.find((u) => u.id === expenseData.employeeId)
            if (employee?.managerId) {
              const manager = state.users.find((u) => u.id === employee.managerId)
              if (manager) {
                approvalHistory.push({
                  approverId: manager.id,
                  approverName: manager.name,
                  status: "pending",
                  sequence: 0,
                })
              }
            }
          }

          defaultRule.approvers.forEach((approver) => {
            approvalHistory.push({
              approverId: approver.userId,
              approverName: approver.userName,
              status: "pending",
              sequence: approver.sequence + (defaultRule.isManagerApprover ? 1 : 0),
            })
          })
        }

        const newExpense: Expense = {
          ...expenseData,
          id: `expense_${Date.now()}`,
          status: "pending",
          approvalHistory,
          currentApproverId: approvalHistory[0]?.approverId,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({ expenses: [...state.expenses, newExpense] }))
      },

      updateExpenseStatus: (expenseId, status, approverId, comments) => {
        set((state) => {
          const expense = state.expenses.find((e) => e.id === expenseId)
          if (!expense) return state

          const updatedHistory = expense.approvalHistory.map((step) => {
            if (step.approverId === approverId && step.status === "pending") {
              return {
                ...step,
                status,
                comments,
                timestamp: new Date().toISOString(),
              }
            }
            return step
          })

          const currentStepIndex = updatedHistory.findIndex((s) => s.approverId === approverId)
          const nextStep = updatedHistory[currentStepIndex + 1]

          let finalStatus: "pending" | "approved" | "rejected" = "pending"

          if (status === "rejected") {
            finalStatus = "rejected"
          } else if (!nextStep) {
            finalStatus = "approved"
          }

          return {
            expenses: state.expenses.map((e) =>
              e.id === expenseId
                ? {
                    ...e,
                    approvalHistory: updatedHistory,
                    currentApproverId: nextStep?.approverId,
                    status: finalStatus,
                  }
                : e,
            ),
          }
        })
      },

      createApprovalRule: (ruleData) => {
        const newRule: ApprovalRule = {
          ...ruleData,
          id: `rule_${Date.now()}`,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ approvalRules: [...state.approvalRules, newRule] }))
      },

      updateApprovalRule: (ruleId, updates) => {
        set((state) => ({
          approvalRules: state.approvalRules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)),
        }))
      },

      deleteApprovalRule: (ruleId) => {
        set((state) => ({
          approvalRules: state.approvalRules.filter((r) => r.id !== ruleId),
        }))
      },
    }),
    {
      name: "expense-management-storage",
    },
  ),
)
