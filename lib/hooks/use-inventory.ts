"use client"

import { useState, useEffect, useCallback } from "react"
import { InventoryItem, InventoryTransaction, inventoryApi, CreateInventoryItemDto, UpdateInventoryItemDto, CreateInventoryTransactionDto } from "@/lib/api/inventory"
import { ApiError } from "@/lib/api/client"

export function useInventoryItems(category?: string) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await inventoryApi.getAllItems(category)
      setItems(data)
    } catch (err) {
      const apiError = err as ApiError
      let errorMessage = apiError.message as string || "Failed to load inventory items"
      
      if (apiError.statusCode === 401) {
        errorMessage = "Authentication required. Please login first."
      } else if (apiError.statusCode === 404) {
        errorMessage = "Inventory API not found. Please ensure the backend server is running."
      } else if (apiError.statusCode === 0) {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      }
      
      setError(errorMessage)
      console.error("Error loading inventory items:", err)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const createItem = useCallback(async (item: CreateInventoryItemDto) => {
    try {
      setError(null)
      const newItem = await inventoryApi.createItem(item)
      setItems((prev) => [...prev, newItem])
      return newItem
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to create inventory item"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const updateItem = useCallback(async (id: string, updates: UpdateInventoryItemDto) => {
    try {
      setError(null)
      const updated = await inventoryApi.updateItem(id, updates)
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)))
      return updated
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to update inventory item"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const deleteItem = useCallback(async (id: string) => {
    try {
      setError(null)
      await inventoryApi.deleteItem(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to delete inventory item"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    items,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    deleteItem,
  }
}

export function useInventoryTransactions(itemId?: string) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await inventoryApi.getAllTransactions(itemId)
      setTransactions(data)
    } catch (err) {
      const apiError = err as ApiError
      let errorMessage = apiError.message as string || "Failed to load transactions"
      
      if (apiError.statusCode === 401) {
        errorMessage = "Authentication required. Please login first."
      } else if (apiError.statusCode === 404) {
        errorMessage = "Transactions API not found. Please ensure the backend server is running."
      } else if (apiError.statusCode === 0) {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      }
      
      setError(errorMessage)
      console.error("Error loading transactions:", err)
    } finally {
      setLoading(false)
    }
  }, [itemId])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const createTransaction = useCallback(async (transaction: CreateInventoryTransactionDto) => {
    try {
      setError(null)
      const newTransaction = await inventoryApi.createTransaction(transaction)
      setTransactions((prev) => [newTransaction, ...prev])
      return newTransaction
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to create transaction"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setError(null)
      await inventoryApi.deleteTransaction(id)
      setTransactions((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to delete transaction"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    transactions,
    loading,
    error,
    loadTransactions,
    createTransaction,
    deleteTransaction,
  }
}

export function useLowStockItems() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLowStockItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await inventoryApi.getLowStockItems()
      setItems(data)
    } catch (err) {
      const apiError = err as ApiError
      let errorMessage = apiError.message as string || "Failed to load low stock items"
      setError(errorMessage)
      console.error("Error loading low stock items:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLowStockItems()
  }, [loadLowStockItems])

  return {
    items,
    loading,
    error,
    loadLowStockItems,
  }
}

