"use client"

import * as React from "react"
import { InventoryItemList } from "@/components/inventory/inventory-item-list"
import { InventoryTransactionList } from "@/components/inventory/inventory-transaction-list"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-header"
import { useInventoryTransactions } from "@/lib/hooks/use-inventory"
import { inventoryApi, CreateInventoryTransactionDto } from "@/lib/api/inventory"
import { Plus } from "lucide-react"

export default function InventoryPage() {
  const { createTransaction, loadTransactions } = useInventoryTransactions()
  const [activeTab, setActiveTab] = React.useState<"items" | "transactions">("items")
  const [triggerAddItem, setTriggerAddItem] = React.useState(false)
  const [triggerAddTransaction, setTriggerAddTransaction] = React.useState(false)

  const handleCreateTransaction = async (data: CreateInventoryTransactionDto) => {
    try {
      await createTransaction(data)
      await loadTransactions()
    } catch (error) {
      throw error
    }
  }

  const handleActionClick = () => {
    if (activeTab === "items") {
      setTriggerAddItem(true)
    } else {
      setTriggerAddTransaction(true)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader
        title={activeTab === "items" ? "Inventory Items" : "Inventory Transactions"}
        subtitle={activeTab === "items" ? "Manage your inventory items and stock levels" : "Manage all inventory stock changes"}
        action={{
          label: activeTab === "items" ? "Add Item" : "Add Transaction",
          icon: Plus,
          onClick: handleActionClick,
        }}
      />
      
      <div className="flex-shrink-0 mb-2">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="h-9">
            <TabsTrigger value="items" className="text-[13px]">Items</TabsTrigger>
            <TabsTrigger value="transactions" className="text-[13px]">Transactions</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 min-h-0 flex flex-col pt-2">
        {activeTab === "items" ? (
          <InventoryItemList 
            onAddClick={triggerAddItem} 
            onAddClickClear={() => setTriggerAddItem(false)} 
          />
        ) : (
          <InventoryTransactionList 
            onCreateTransaction={handleCreateTransaction} 
            onAddClick={triggerAddTransaction}
            onAddClickClear={() => setTriggerAddTransaction(false)}
          />
        )}
      </div>
    </div>
  )
}

