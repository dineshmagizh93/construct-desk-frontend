"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ChecklistItem {
  id: string
  label: string
  description: string
  href: string
  done: boolean
}

interface OnboardingChecklistProps {
  projectCount: number
}

export function OnboardingChecklist({ projectCount }: OnboardingChecklistProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("onboarding_dismissed") === "true"
    }
    return false
  })

  const items: ChecklistItem[] = [
    {
      id: "project",
      label: "Create your first project",
      description: "Set up a project to track work, budgets, and timelines.",
      href: "/projects/new",
      done: projectCount > 0,
    },
    {
      id: "team",
      label: "Invite a team member",
      description: "Add your crew so they can log tasks and updates.",
      href: "/settings/users",
      done: false,
    },
    {
      id: "payment",
      label: "Record a payment",
      description: "Track incoming payments against your projects.",
      href: "/payments",
      done: false,
    },
    {
      id: "document",
      label: "Upload a document",
      description: "Store contracts, plans, or permits in one place.",
      href: "/documents",
      done: false,
    },
    {
      id: "client",
      label: "Share client portal",
      description: "Give your client a read-only view of their project.",
      href: "/projects",
      done: false,
    },
  ]

  const completedCount = items.filter((i) => i.done).length
  const allDone = completedCount === items.length

  const handleDismiss = () => {
    localStorage.setItem("onboarding_dismissed", "true")
    setDismissed(true)
  }

  if (dismissed || allDone) return null

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <Rocket className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-slate-800">Get started with ConstructDesk</p>
            <p className="text-[12px] text-slate-500">
              {completedCount} of {items.length} steps complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded p-1 text-slate-400 hover:bg-blue-100 hover:text-slate-600"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 w-full rounded-full bg-blue-100">
        <div
          className="h-1.5 rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>

      {!collapsed && (
        <div className="mt-4 space-y-1">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-blue-100/70",
                item.done && "opacity-60"
              )}
            >
              {item.done ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-300" />
              )}
              <div>
                <p className={cn("text-[13px] font-medium text-slate-700", item.done && "line-through")}>
                  {item.label}
                </p>
                <p className="text-[12px] text-slate-500">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-[12px] text-slate-400 hover:text-slate-600">
          Dismiss
        </Button>
      </div>
    </div>
  )
}
