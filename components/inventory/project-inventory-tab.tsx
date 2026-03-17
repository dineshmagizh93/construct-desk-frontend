"use client"

import * as React from "react"
import { useInventoryTransactions } from "@/lib/hooks/use-inventory"
import { InventoryTransactionList } from "./inventory-transaction-list"
import { inventoryApi, CreateInventoryTransactionDto } from "@/lib/api/inventory"

interface ProjectInventoryTabProps {
  projectId: string
}

export function ProjectInventoryTab({ projectId }: ProjectInventoryTabProps) {
  const { createTransaction, loadTransactions } = useInventoryTransactions()

  const handleCreateTransaction = async (data: CreateInventoryTransactionDto) => {
    try {
      // Ensure projectId is set
      const transactionData = {
        ...data,
        projectId: projectId, // Always use the project from context
      }
      await createTransaction(transactionData)
      await loadTransactions(undefined, projectId)
    } catch (error) {
      console.error("Error creating transaction:", error)
      throw error
    }
  }

  return (
    <InventoryTransactionList
      projectId={projectId}
      onCreateTransaction={handleCreateTransaction}
    />
  )
}
