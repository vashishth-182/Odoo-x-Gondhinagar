"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, ArrowUp, ArrowDown, Settings2 } from "lucide-react"
import type { ApproverConfig } from "@/lib/types"

export function ApprovalRules() {
  const company = useStore((state) => state.company)
  const users = useStore((state) => state.users)
  const approvalRules = useStore((state) => state.approvalRules)
  const createApprovalRule = useStore((state) => state.createApprovalRule)
  const updateApprovalRule = useStore((state) => state.updateApprovalRule)
  const deleteApprovalRule = useStore((state) => state.deleteApprovalRule)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "sequential" as "sequential" | "percentage" | "specific" | "hybrid",
    isManagerApprover: true,
    approvers: [] as ApproverConfig[],
    percentageThreshold: 60,
    specificApproverId: "",
  })

  const managers = users.filter((u) => u.role === "manager" || u.role === "admin")

  const handleAddApprover = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    const newApprover: ApproverConfig = {
      userId: user.id,
      userName: user.name,
      sequence: formData.approvers.length,
    }

    setFormData({
      ...formData,
      approvers: [...formData.approvers, newApprover],
    })
  }

  const handleRemoveApprover = (index: number) => {
    const newApprovers = formData.approvers.filter((_, i) => i !== index)
    // Resequence
    const resequenced = newApprovers.map((a, i) => ({ ...a, sequence: i }))
    setFormData({ ...formData, approvers: resequenced })
  }

  const handleMoveApprover = (index: number, direction: "up" | "down") => {
    const newApprovers = [...formData.approvers]
    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newApprovers.length) return
    ;[newApprovers[index], newApprovers[targetIndex]] = [newApprovers[targetIndex], newApprovers[index]]

    // Resequence
    const resequenced = newApprovers.map((a, i) => ({ ...a, sequence: i }))
    setFormData({ ...formData, approvers: resequenced })
  }

  const handleCreate = () => {
    if (!company) return

    createApprovalRule({
      companyId: company.id,
      name: formData.name,
      type: formData.type,
      isManagerApprover: formData.isManagerApprover,
      approvers: formData.approvers,
      percentageThreshold:
        formData.type === "percentage" || formData.type === "hybrid" ? formData.percentageThreshold : undefined,
      specificApproverId:
        formData.type === "specific" || formData.type === "hybrid" ? formData.specificApproverId : undefined,
    })

    setFormData({
      name: "",
      type: "sequential",
      isManagerApprover: true,
      approvers: [],
      percentageThreshold: 60,
      specificApproverId: "",
    })
    setIsCreateOpen(false)
  }

  const handleDelete = (ruleId: string) => {
    if (confirm("Are you sure you want to delete this approval rule?")) {
      deleteApprovalRule(ruleId)
    }
  }

  const getRuleTypeBadge = (type: string) => {
    switch (type) {
      case "sequential":
        return <Badge variant="default">Sequential</Badge>
      case "percentage":
        return <Badge variant="secondary">Percentage</Badge>
      case "specific":
        return <Badge className="bg-purple-100 text-purple-700">Specific Approver</Badge>
      case "hybrid":
        return <Badge className="bg-amber-100 text-amber-700">Hybrid</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Approval Rules</CardTitle>
            <CardDescription>Configure approval workflows and conditions</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Approval Rule</DialogTitle>
                <DialogDescription>Define how expenses should be approved</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Standard Approval Flow"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-type">Rule Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="rule-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential - Each approver in order</SelectItem>
                      <SelectItem value="percentage">Percentage - X% must approve</SelectItem>
                      <SelectItem value="specific">Specific Approver - One person auto-approves</SelectItem>
                      <SelectItem value="hybrid">Hybrid - Combine percentage + specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label>Manager Approval First</Label>
                    <p className="text-sm text-muted-foreground">
                      Require employee's manager to approve before other approvers
                    </p>
                  </div>
                  <Switch
                    checked={formData.isManagerApprover}
                    onCheckedChange={(checked) => setFormData({ ...formData, isManagerApprover: checked })}
                  />
                </div>

                {(formData.type === "percentage" || formData.type === "hybrid") && (
                  <div className="space-y-2">
                    <Label htmlFor="percentage">Approval Percentage Threshold</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="percentage"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.percentageThreshold}
                        onChange={(e) =>
                          setFormData({ ...formData, percentageThreshold: Number.parseInt(e.target.value) })
                        }
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Expense is approved when this percentage of approvers approve
                    </p>
                  </div>
                )}

                {(formData.type === "specific" || formData.type === "hybrid") && (
                  <div className="space-y-2">
                    <Label htmlFor="specific-approver">Specific Approver (Auto-Approve)</Label>
                    <Select
                      value={formData.specificApproverId}
                      onValueChange={(value) => setFormData({ ...formData, specificApproverId: value })}
                    >
                      <SelectTrigger id="specific-approver">
                        <SelectValue placeholder="Select approver" />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name} ({manager.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      If this person approves, expense is automatically approved
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Approvers Sequence</Label>
                  <div className="space-y-2">
                    {formData.approvers.map((approver, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 rounded-lg border">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="flex-1 font-medium">{approver.userName}</span>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveApprover(index, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveApprover(index, "down")}
                            disabled={index === formData.approvers.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveApprover(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Select onValueChange={handleAddApprover}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add approver" />
                    </SelectTrigger>
                    <SelectContent>
                      {managers
                        .filter((m) => !formData.approvers.some((a) => a.userId === m.id))
                        .map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name} ({manager.role})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!formData.name || formData.approvers.length === 0}>
                  Create Rule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {approvalRules.length === 0 ? (
          <div className="text-center py-12">
            <Settings2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No approval rules configured</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first rule to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvalRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        {getRuleTypeBadge(rule.type)}
                      </div>
                      <CardDescription>
                        {rule.isManagerApprover && "Manager approval required • "}
                        {rule.approvers.length} approver{rule.approvers.length !== 1 ? "s" : ""}
                        {rule.percentageThreshold && ` • ${rule.percentageThreshold}% threshold`}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rule.isManagerApprover && (
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">0</Badge>
                        <span className="text-muted-foreground">Employee's Manager</span>
                      </div>
                    )}
                    {rule.approvers.map((approver, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{approver.sequence + (rule.isManagerApprover ? 1 : 0)}</Badge>
                        <span className="font-medium">{approver.userName}</span>
                        {rule.specificApproverId === approver.userId && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">Auto-Approve</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
