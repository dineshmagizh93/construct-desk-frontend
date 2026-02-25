"use client"

import { LeadList } from "@/components/leads/lead-list"
import { useLeads } from "@/lib/hooks/use-leads"
import { LeadFormSchema } from "@/lib/validations/lead"
import { Lead } from "@/types/lead"

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
      console.error("Error creating lead:", error)
      throw error // Re-throw to let the form handle the error
    }
  }

  return <LeadList onCreateLead={() => {}} />
}

