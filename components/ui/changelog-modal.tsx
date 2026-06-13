"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sparkles, Zap, Bug, ArrowRight } from "lucide-react"

interface ChangeEntry {
  version: string
  date: string
  items: Array<{ type: "feature" | "improvement" | "fix"; text: string }>
}

const CHANGELOG: ChangeEntry[] = [
  {
    version: "1.4.0",
    date: "May 2026",
    items: [
      { type: "feature", text: "Client Portal — share a read-only project view with your client via a secure link" },
      { type: "feature", text: "Two-Factor Authentication (TOTP) — add an extra layer of security to your account" },
      { type: "feature", text: "Gantt Chart — visual timeline view of tasks across all projects" },
      { type: "feature", text: "Project Templates — create reusable task blueprints for faster project setup" },
      { type: "feature", text: "Document Version History — track changes to documents over time" },
      { type: "feature", text: "Expense Approval Workflow — approve or reject submitted expenses" },
      { type: "improvement", text: "Budget Forecasting — real-time burn rate analysis and overrun warnings" },
      { type: "improvement", text: "Audit Log — full activity trail with filters by module, user, and date" },
      { type: "improvement", text: "Export CSV on all list pages — Projects, Payments, Expenses, Documents" },
      { type: "improvement", text: "Command Palette (Ctrl+K) — navigate quickly across the entire app" },
      { type: "improvement", text: "In-app Notifications — real-time bell icon with unread count" },
      { type: "fix", text: "Payment reminders now fire daily at 8AM for due dates 1 and 7 days out" },
    ],
  },
  {
    version: "1.3.0",
    date: "April 2026",
    items: [
      { type: "feature", text: "Dashboard charts — Revenue vs Expenses, Project Status, Payment Pipeline" },
      { type: "feature", text: "Razorpay payment integration with webhook support" },
      { type: "improvement", text: "Sidebar reorganised into logical groups with collapsible sections" },
      { type: "fix", text: "Pagination no longer jumps to wrong page after deleting an item" },
    ],
  },
]

const TYPE_CONFIG = {
  feature: { label: "New", color: "bg-blue-100 text-blue-700", icon: Sparkles },
  improvement: { label: "Improved", color: "bg-green-100 text-green-700", icon: Zap },
  fix: { label: "Fixed", color: "bg-amber-100 text-amber-700", icon: Bug },
}

interface ChangelogModalProps {
  open: boolean
  onClose: () => void
}

export function ChangelogModal({ open, onClose }: ChangelogModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            What&apos;s New in ConstructDesk
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-2">
          {CHANGELOG.map((entry) => (
            <div key={entry.version}>
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-[13px] font-bold text-slate-800">Version {entry.version}</span>
                <span className="text-[12px] text-slate-400">{entry.date}</span>
              </div>
              <div className="space-y-2">
                {entry.items.map((item, i) => {
                  const config = TYPE_CONFIG[item.type]
                  const Icon = config.icon
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 flex-shrink-0 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${config.color}`}
                      >
                        <Icon className="h-2.5 w-2.5" />
                        {config.label}
                      </span>
                      <span className="text-[13px] text-slate-600">{item.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
