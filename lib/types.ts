export type UserRole = "admin" | "manager" | "employee"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  companyId: string
  managerId?: string
  createdAt: string
}

export interface Company {
  id: string
  name: string
  currency: string
  country: string
  createdAt: string
}

export interface Expense {
  id: string
  employeeId: string
  employeeName: string
  amount: number
  currency: string
  amountInCompanyCurrency?: number
  category: string
  description: string
  date: string
  status: "pending" | "approved" | "rejected"
  receiptUrl?: string
  currentApproverId?: string
  approvalHistory: ApprovalStep[]
  createdAt: string
}

export interface ApprovalStep {
  approverId: string
  approverName: string
  status: "pending" | "approved" | "rejected"
  comments?: string
  timestamp?: string
  sequence: number
}

export interface ApprovalRule {
  id: string
  companyId: string
  name: string
  type: "sequential" | "percentage" | "specific" | "hybrid"
  isManagerApprover: boolean
  approvers: ApproverConfig[]
  percentageThreshold?: number
  specificApproverId?: string
  createdAt: string
}

export interface ApproverConfig {
  userId: string
  userName: string
  sequence: number
}

export interface Currency {
  code: string
  name: string
  symbol: string
}

export interface Country {
  name: string
  currencies: Record<string, Currency>
}
