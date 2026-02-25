"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { leadsApi } from "@/lib/api/leads"
import { Lead } from "@/types/lead"
import { LeadFormSchema } from "@/lib/validations/lead"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LeadForm } from "@/components/leads/lead-form"
import { useLeads } from "@/lib/hooks/use-leads"

export default function EditLeadPage() {
  const params = useParams()
  const router = useRouter()
  const { updateLead } = useLeads()
  const [lead, setLead] = React.useState<Lead | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadLead = async () => {
      if (params.id && typeof params.id === "string") {
        try {
          setLoading(true)
          const data = await leadsApi.getById(params.id)
          setLead(data)
        } catch (error) {
          console.error("Failed to load lead:", error)
        } finally {
          setLoading(false)
        }
      }
    }
    loadLead()
  }, [params.id])

  const handleSubmit = async (data: LeadFormSchema) => {
    if (!lead) return

    await updateLead(lead.id, {
      ...data,
      email: data.email || undefined,
      assignedTo: data.assignedTo || undefined,
      notes: data.notes || undefined,
    })

    router.push(`/leads/${lead.id}`)
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading lead...</div>
  }

  if (!lead) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/leads")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Button>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Lead not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/leads")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Lead/Client</h1>
          <p className="text-muted-foreground">Update lead or client information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead/Client Details</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadForm lead={lead} onSubmit={handleSubmit} onCancel={() => router.push("/leads")} />
        </CardContent>
      </Card>
    </div>
  )
}
