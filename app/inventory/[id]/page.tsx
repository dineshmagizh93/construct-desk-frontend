"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Package, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { inventoryApi, InventoryItem, InventoryTransaction, TransactionType } from "@/lib/api/inventory"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils/currency"
import { useInventoryTransactions } from "@/lib/hooks/use-inventory"
import { formatDateDMY } from "@/lib/utils/date"

export default function InventoryItemDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string
  const [item, setItem] = React.useState<InventoryItem | null>(null)
  const [loading, setLoading] = React.useState(true)
  const { transactions, loading: transactionsLoading } = useInventoryTransactions(itemId)

  React.useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true)
        const data = await inventoryApi.getItemById(itemId)
        setItem(data)
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }
    loadItem()
  }, [itemId])

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading inventory item...</div>
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/inventory")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Item not found</p>
        </div>
      </div>
    )
  }

  const isLowStock = item.currentStock <= item.minStock
  const stockValue = item.unitPrice ? item.currentStock * item.unitPrice : 0

  return (
    <div className="space-y-4 pt-3 sm:pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/inventory")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{item.name}</h1>
            <p className="text-muted-foreground text-xs mt-0">{item.description || "No description"}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/inventory/${itemId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Item
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {item.currentStock} {item.unit}
            </div>
            {isLowStock && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3" />
                Low Stock Alert
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Min Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {item.minStock} {item.unit}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unit Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {item.unitPrice ? formatCurrency(item.unitPrice) : "-"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {stockValue > 0 ? formatCurrency(stockValue) : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <Badge variant="outline">{item.category}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SKU</p>
              <p className="font-medium">{item.sku || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{item.location || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vendor ID</p>
              <p className="font-medium">{item.vendorId || "-"}</p>
            </div>
            {item.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="font-medium">{item.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Last 10 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <p className="text-sm text-muted-foreground">Loading transactions...</p>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            ) : (
              <div className="space-y-2.5">
                {transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      {transaction.type === TransactionType.IN && (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      )}
                      {transaction.type === TransactionType.OUT && (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      {transaction.type === TransactionType.ADJUSTMENT && (
                        <Minus className="h-4 w-4 text-yellow-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {transaction.type} - {transaction.quantity} {item.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateDMY(transaction.transactionDate)}
                        </p>
                      </div>
                    </div>
                    {transaction.reference && (
                      <Badge variant="outline" className="text-xs">
                        {transaction.reference}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
