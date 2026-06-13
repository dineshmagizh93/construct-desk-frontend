"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Phone, Mail, User, FileText, Edit, UserPlus, FolderPlus } from "lucide-react"
import { leadsApi } from "@/lib/api/leads"
import { Lead } from "@/types/lead"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLeads } from "@/lib/hooks/use-leads"
import { formatDateDMY } from "@/lib/utils/date"

export default function LeadDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { convertToClient } = useLeads()
  const [lead, setLead] = React.useState<Lead | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [convertDialogOpen, setConvertDialogOpen] = React.useState(false)

  React.useEffect(() => {
    const loadLead = async () => {
      if (params.id && typeof params.id === "string") {
        try {
          setLoading(true)
          const data = await leadsApi.getById(params.id)
          setLead(data)
        } catch (error) {
        } finally {
          setLoading(false)
        }
      }
    }
    loadLead()
  }, [params.id])

  const handleConvert = async () => {
    if (lead) {
      await convertToClient(lead.id)
      setConvertDialogOpen(false)
      const updated = await leadsApi.getById(lead.id)
      setLead(updated)
    }
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

  const getStatusBadgeVariant = (status: Lead["status"]) => {
    switch (status) {
      case "Converted":
        return "success"
      case "Qualified":
        return "default"
      case "Contacted":
        return "secondary"
      case "New":
        return "outline"
      case "Lost":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getSourceBadgeVariant = (source: Lead["source"]) => {
    switch (source) {
      case "Broker":
        return "default"
      case "Portal":
        return "secondary"
      case "Referral":
        return "success"
      case "Direct":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4 pt-3 sm:pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/leads")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{lead.name}</h1>
            <div className="flex items-center gap-2 mt-0">
              <Badge variant={lead.type === "CLIENT" ? "default" : "outline"}>
                {lead.type === "CLIENT" ? "Client" : "Lead"}
              </Badge>
              <Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</Badge>
              <Badge variant={getSourceBadgeVariant(lead.source)}>{lead.source}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/leads/${lead.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {lead.type === "LEAD" && (
            <Button onClick={() => setConvertDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Convert to Client
            </Button>
          )}
          {lead.type === "CLIENT" && (
            <Button variant="default" onClick={() => router.push("/projects?client=" + lead.id)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{lead.phone}</p>
              </div>
            </div>
            {lead.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{lead.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Assigned To</p>
                <p className="text-sm text-muted-foreground">{lead.assignedTo || "Unassigned"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium mb-1">Source</p>
              <Badge variant={getSourceBadgeVariant(lead.source)}>{lead.source}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Status</p>
              <Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Created</p>
              <p className="text-sm text-muted-foreground">
                {formatDateDMY(lead.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Last Updated</p>
              <p className="text-sm text-muted-foreground">
                {formatDateDMY(lead.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lead.notes ? (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No notes available</p>
          )}
        </CardContent>
      </Card>

      {convertDialogOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setConvertDialogOpen(false)} />
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <h2 className="text-base font-semibold">Convert Lead to Client</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to convert "{lead.name}" to a client? This will change their
              status to "Converted" and type to "CLIENT".
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConvert}>
                <UserPlus className="mr-2 h-4 w-4" />
                Convert to Client
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
