"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { vendorsApi } from "@/lib/api/vendors"
import { Vendor } from "@/types/vendor"
import { VendorFormSchema } from "@/lib/validations/vendor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VendorForm } from "@/components/vendors/vendor-form"
import { useVendors } from "@/lib/hooks/use-vendors"

export default function EditVendorPage() {
  const params = useParams()
  const router = useRouter()
  const { updateVendor } = useVendors()
  const [vendor, setVendor] = React.useState<Vendor | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadVendor = async () => {
      if (params.id && typeof params.id === "string") {
        try {
          setLoading(true)
          const data = await vendorsApi.getById(params.id)
          setVendor(data)
        } catch (error) {
          console.error("Failed to load vendor:", error)
        } finally {
          setLoading(false)
        }
      }
    }
    loadVendor()
  }, [params.id])

  const handleSubmit = async (data: VendorFormSchema) => {
    if (!vendor) return

    await updateVendor(vendor.id, {
      ...data,
      email: data.email || undefined,
      address: data.address || undefined,
      notes: data.notes || undefined,
    })

    router.push(`/vendors/${vendor.id}`)
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/vendors")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Vendor</h1>
          <p className="text-muted-foreground">Update vendor information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Details</CardTitle>
        </CardHeader>
        <CardContent>
          <VendorForm vendor={vendor} onSubmit={handleSubmit} onCancel={() => router.push("/vendors")} />
        </CardContent>
      </Card>
    </div>
  )
}
