"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Phone, Mail, MapPin, FileText, Edit, Power, PowerOff, FolderKanban } from "lucide-react"
import { vendorsApi } from "@/lib/api/vendors"
import { Vendor } from "@/types/vendor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useVendors } from "@/lib/hooks/use-vendors"
import { useProjects } from "@/lib/hooks/use-projects"
import Link from "next/link"
import { formatDateDMY } from "@/lib/utils/date"

export default function VendorDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toggleVendorStatus } = useVendors()
  const { projects } = useProjects()
  const [vendor, setVendor] = React.useState<Vendor | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false)

  React.useEffect(() => {
    const loadVendor = async () => {
      if (params.id && typeof params.id === "string") {
        try {
          setLoading(true)
          const data = await vendorsApi.getById(params.id)
          setVendor(data)
        } catch (error) {
        } finally {
          setLoading(false)
        }
      }
    }
    loadVendor()
  }, [params.id])

  const handleToggleStatus = async () => {
    if (vendor) {
      await toggleVendorStatus(vendor.id)
      const updated = await vendorsApi.getById(vendor.id)
      setVendor(updated)
      setStatusDialogOpen(false)
    }
  }

  const linkedProjects = React.useMemo(() => {
    return projects.slice(0, 3)
  }, [projects])

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading vendor...</div>
  }

  if (!vendor) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/vendors")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vendors
        </Button>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Vendor not found</p>
        </div>
      </div>
    )
  }

  const getTypeBadgeVariant = (type: Vendor["type"]) => {
    switch (type) {
      case "Material Supplier":
        return "default"
      case "Contractor":
        return "secondary"
      case "Electrician":
      case "Plumber":
        return "success"
      case "Transport":
        return "outline"
      case "Equipment Rental":
        return "warning"
      case "Other":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4 pt-3 sm:pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/vendors")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{vendor.name}</h1>
            <div className="flex items-center gap-2 mt-0">
              <Badge variant={getTypeBadgeVariant(vendor.type)}>{vendor.type}</Badge>
              <Badge variant={vendor.status === "Active" ? "success" : "destructive"}>
                {vendor.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/vendors/${vendor.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant={vendor.status === "Active" ? "outline" : "default"}
            onClick={() => setStatusDialogOpen(true)}
          >
            {vendor.status === "Active" ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
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
                <p className="text-sm text-muted-foreground">{vendor.phone}</p>
              </div>
            </div>
            {vendor.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{vendor.email}</p>
                </div>
              </div>
            )}
            {vendor.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{vendor.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium mb-1">Vendor Type</p>
              <Badge variant={getTypeBadgeVariant(vendor.type)}>{vendor.type}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Status</p>
              <Badge variant={vendor.status === "Active" ? "success" : "destructive"}>
                {vendor.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Created</p>
              <p className="text-sm text-muted-foreground">
                {formatDateDMY(vendor.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Last Updated</p>
              <p className="text-sm text-muted-foreground">
                {formatDateDMY(vendor.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {vendor.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{vendor.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Linked Projects
          </CardTitle>
          <CardDescription>Projects that may be using this vendor</CardDescription>
        </CardHeader>
        <CardContent>
          {linkedProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No linked projects</p>
          ) : (
            <div className="space-y-2">
              {linkedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block p-2 rounded-md border hover:bg-accent transition-colors"
                >
                  <p className="text-sm font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.status}</p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {statusDialogOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setStatusDialogOpen(false)} />
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <h2 className="text-base font-semibold">
              {vendor.status === "Active" ? "Deactivate" : "Activate"} Vendor
            </h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to {vendor.status === "Active" ? "deactivate" : "activate"}{" "}
              "{vendor.name}"?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleToggleStatus}>
                {vendor.status === "Active" ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
