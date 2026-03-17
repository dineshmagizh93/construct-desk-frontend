"use client"

import * as React from "react"
import { useLeads } from "@/lib/hooks/use-leads"
import { LeadFormSchema } from "@/lib/validations/lead"
import { Lead } from "@/types/lead"
import { TableSkeleton } from "@/components/ui/loading-skeleton"

// Lazy load heavy component to speed up navigation
const LeadList = React.lazy(() => 
  import("@/components/leads/lead-list").then(module => ({ default: module.LeadList }))
)

export default function LeadsPage() {
  const { createLead, loadLeads } = useLeads()

  const handleCreateLead = async (data: LeadFormSchema) => {
    try {
      // Create lead - this updates the hook state immediately
      await createLead({
        ...data,
        type: "LEAD",
        email: data.email || undefined,
        assignedTo: data.assignedTo || undefined,
        notes: data.notes || undefined,
      } as Omit<Lead, "id" | "createdAt" | "updatedAt">)
      // Immediately refresh to ensure LeadList component sees the update
      await loadLeads()
    } catch (error) {
      throw error // Re-throw to let the form handle the error
    }
  }

  return (
    <React.Suspense fallback={<TableSkeleton />}>
      <LeadList onCreateLead={() => {}} />
    </React.Suspense>
  )
}

