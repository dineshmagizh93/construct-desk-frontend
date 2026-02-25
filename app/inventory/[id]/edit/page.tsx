"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { inventoryApi } from "@/lib/api/inventory"
import { InventoryItem } from "@/lib/api/inventory"
import { ApiError } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryItemForm } from "@/components/inventory/inventory-item-form"
import { useInventoryItems } from "@/lib/hooks/use-inventory"

export default function EditInventoryItemPage() {
  const params = useParams()
  const router = useRouter()
  const { updateItem } = useInventoryItems()
  const [item, setItem] = React.useState<InventoryItem | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadItem = async () => {
      if (params.id && typeof params.id === "string") {
        try {
          setLoading(true)
          setError(null)
          const data = await inventoryApi.getItemById(params.id)
          setItem(data)
        } catch (err) {
          const apiError = err as ApiError
          setError(apiError.message as string || "Failed to load item")
          console.error("Failed to load item:", err)
        } finally {
          setLoading(false)
        }
      }
    }
    loadItem()
  }, [params.id])

  const handleSubmit = async (data: any) => {
    if (!item) return

    await updateItem(item.id, data)
    router.push(`/inventory/${item.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading item...</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/inventory")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>
        <div className="text-center py-8">
          <p className="text-destructive mb-2">{error || "Item not found"}</p>
          <Button variant="outline" onClick={() => router.push("/inventory")}>
            Go to Inventory
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/inventory")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Item</h1>
          <p className="text-muted-foreground">Update inventory item information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryItemForm item={item} onSubmit={handleSubmit} onCancel={() => router.push("/inventory")} />
        </CardContent>
      </Card>
    </div>
  )
}
