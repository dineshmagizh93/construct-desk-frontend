"use client"

import * as React from "react"
import { useInventoryTransactions } from "@/lib/hooks/use-inventory"
import { InventoryTransactionList } from "./inventory-transaction-list"
import { CreateInventoryTransactionDto, TransactionType } from "@/lib/api/inventory"
import { useRole } from "@/lib/hooks/use-role"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { parseCsv, normalizeDateToYmd, normalizeHeaderKey } from "@/lib/utils/csv"

interface ProjectInventoryTabProps {
  projectId: string
}

export function ProjectInventoryTab({ projectId }: ProjectInventoryTabProps) {
  const { createTransaction, loadTransactions } = useInventoryTransactions()
  const { isAdmin } = useRole()
  const [refreshKey, setRefreshKey] = React.useState(0)

  const [bulkOpen, setBulkOpen] = React.useState(false)
  const [bulkError, setBulkError] = React.useState<string | null>(null)
  const [bulkRows, setBulkRows] = React.useState<CreateInventoryTransactionDto[]>([])

  const handleCreateTransaction = async (data: CreateInventoryTransactionDto) => {
    try {
      // Ensure projectId is set
      const transactionData = {
        ...data,
        projectId: projectId, // Always use the project from context
      }
      await createTransaction(transactionData)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      console.error("Error creating transaction:", error)
      throw error
    }
  }

  const downloadBulkTemplate = () => {
    const headers = ["projectId", "itemId", "type", "quantity", "reference", "notes", "transactionDate"]
    const sample = [
      projectId || "YOUR_PROJECT_ID",
      "ITEM_ID",
      "IN",
      "10",
      "PO-123",
      "Optional notes",
      "2024-01-15",
    ]

    const escapeCell = (v: string) => {
      const needsQuotes = v.includes(",") || v.includes('"') || v.includes("\n") || v.includes("\r")
      const escaped = v.replace(/"/g, '""')
      return needsQuotes ? `"${escaped}"` : escaped
    }

    const csv = `${headers.map(escapeCell).join(",")}\n${sample.map((c) => escapeCell(String(c))).join(",")}\n`
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "inventory-transactions-bulk-upload-template.csv"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const parseBulkInventoryTransactionsFromCsv = (csvText: string): CreateInventoryTransactionDto[] => {
    const parsed = parseCsv(csvText)
    if (parsed.length === 0) return []

    const [headerRow, ...dataRows] = parsed
    const headerMap = new Map<string, number>()
    headerRow.forEach((h, idx) => headerMap.set(normalizeHeaderKey(h), idx))

    const required = ["itemid", "type", "quantity"]
    const missing = required.filter((h) => !headerMap.has(h))
    if (missing.length > 0) {
      throw new Error(`Missing required CSV headers: ${missing.join(", ")}`)
    }

    const hasProjectIdColumn = headerMap.has("projectid")

    const get = (row: string[], key: string) => {
      const idx = headerMap.get(key)
      if (idx === undefined) return ""
      return (row[idx] ?? "").trim()
    }

    const normalizeType = (raw: string): TransactionType | "" => {
      const s = raw.trim().toUpperCase().replace(/[^A-Z]/g, "")
      if (!s) return ""
      if (s === "IN") return TransactionType.IN
      if (s === "OUT") return TransactionType.OUT
      if (s === "ADJUSTMENT") return TransactionType.ADJUSTMENT
      return ""
    }

    const rows: CreateInventoryTransactionDto[] = []
    const mismatch: string[] = []

    for (const row of dataRows) {
      const csvProjectId = hasProjectIdColumn ? get(row, "projectid") : ""

      if (csvProjectId && csvProjectId !== projectId) {
        mismatch.push(csvProjectId)
      }

      const finalProjectId = csvProjectId || projectId

      const itemId = get(row, "itemid")
      const type = normalizeType(get(row, "type"))
      const quantityRaw = get(row, "quantity")
      const quantity = parseFloat(quantityRaw)
      const reference = get(row, "reference") || undefined
      const notes = get(row, "notes") || undefined
      const transactionDate = normalizeDateToYmd(get(row, "transactiondate")) || undefined

      if (!itemId || !type || Number.isNaN(quantity)) continue

      rows.push({
        projectId: finalProjectId,
        itemId,
        type,
        quantity,
        reference,
        notes,
        transactionDate,
      })
    }

    if (mismatch.length > 0) {
      throw new Error(`CSV projectId mismatch. All rows must match current project (${projectId}).`)
    }

    return rows
  }

  const handleBulkUpload = async () => {
    setBulkError(null)
    try {
      if (bulkRows.length === 0) {
        setBulkError("No valid rows to upload.")
        return
      }

      for (const row of bulkRows) {
        await createTransaction({
          ...row,
          projectId,
        })
      }

      await loadTransactions(undefined, projectId)
      setRefreshKey((k) => k + 1)
      toast.success("Bulk inventory transactions uploaded successfully")
      setBulkOpen(false)
      setBulkRows([])
    } catch (err: any) {
      const raw = err?.message as string
      const cleaned = raw?.includes(":") ? raw.split(":").slice(1).join(":").trim() : raw
      setBulkError(cleaned || "Bulk upload failed")
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <h3 className="text-lg font-semibold">Project Inventory</h3>
          <p className="text-sm text-muted-foreground">Track inventory transactions for this project</p>
        </div>
        {isAdmin && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setBulkOpen(true)
              setBulkError(null)
              setBulkRows([])
            }}
          >
            Bulk Upload
          </Button>
        )}
      </div>

      <InventoryTransactionList
        key={refreshKey}
        projectId={projectId}
        onCreateTransaction={handleCreateTransaction}
      />

      <Dialog
        open={bulkOpen}
        onOpenChange={(open) => {
          setBulkOpen(open)
          if (!open) {
            setBulkError(null)
            setBulkRows([])
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[calc(100vh-1rem)] p-3 hide-scrollbar gap-2">
          <DialogHeader>
            <DialogTitle>Bulk Upload Inventory Transactions</DialogTitle>
            <DialogDescription className="text-xs">
              Upload CSV for this project only. If any row has a different `projectId`, upload will not proceed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Button type="button" variant="outline" onClick={downloadBulkTemplate}>
                Download CSV Template
              </Button>
              <div className="text-xs text-muted-foreground">Required: itemId,type,quantity</div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="bulk-inventory-transactions">Choose CSV file</Label>
              <Input
                id="bulk-inventory-transactions"
                type="file"
                accept=".csv,text/csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setBulkError(null)
                  setBulkRows([])
                  try {
                    const text = await file.text()
                    const rows = parseBulkInventoryTransactionsFromCsv(text)
                    setBulkRows(rows)
                    if (rows.length === 0) setBulkError("No valid rows found. Check CSV values.")
                  } catch (err: any) {
                    setBulkError(err?.message || "Failed to parse CSV.")
                  }
                }}
              />
            </div>

            {bulkError && <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{bulkError}</div>}

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setBulkOpen(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={bulkRows.length === 0} onClick={handleBulkUpload}>
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
