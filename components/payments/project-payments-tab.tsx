"use client"

import * as React from "react"
import { PaymentList } from "./payment-list"
import { usePayments } from "@/lib/hooks/use-payments"
import { PaymentFormSchema } from "@/lib/validations/payment"
import { Payment } from "@/types/payment"
import { projectsApi } from "@/lib/api/projects"
import { useRole } from "@/lib/hooks/use-role"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import toast from "react-hot-toast"
import { parseCsv, normalizeHeaderKey, normalizeDateToYmd } from "@/lib/utils/csv"
import { CreatePaymentDto } from "@/lib/api/payments"

interface ProjectPaymentsTabProps {
  projectId: string
}

export function ProjectPaymentsTab({ projectId }: ProjectPaymentsTabProps) {
  const { createPayment, loadPayments } = usePayments()
  const { isAdmin } = useRole()

  const [bulkOpen, setBulkOpen] = React.useState(false)
  const [bulkError, setBulkError] = React.useState<string | null>(null)
  const [bulkRows, setBulkRows] = React.useState<CreatePaymentDto[]>([])

  const downloadBulkTemplate = () => {
    const headers = ["projectId", "milestone", "amount", "dueDate", "status", "paidDate", "notes"]
    const sample = [
      projectId || "YOUR_PROJECT_ID",
      "Milestone 1",
      "5000",
      "2024-01-15",
      "Pending",
      "",
      "Optional notes",
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
    a.download = "payments-bulk-upload-template.csv"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const parseBulkPaymentsFromCsv = (csvText: string): CreatePaymentDto[] => {
    const parsed = parseCsv(csvText)
    if (parsed.length === 0) return []

    const [headerRow, ...dataRows] = parsed
    const headerMap = new Map<string, number>()
    headerRow.forEach((h, idx) => headerMap.set(normalizeHeaderKey(h), idx))

    const required = ["milestone", "amount", "duedate"]
    const missing = required.filter((h) => !headerMap.has(h))
    if (missing.length > 0) {
      throw new Error(`Missing required CSV headers: ${missing.join(", ")}`)
    }

    const get = (row: string[], key: string) => {
      const idx = headerMap.get(key)
      if (idx === undefined) return ""
      return (row[idx] ?? "").trim()
    }

    const normalizeStatus = (raw: string) => {
      const s = raw.trim().toLowerCase().replace(/[^a-z]/g, "")
      if (!s) return "Pending"
      if (s === "pending") return "Pending"
      if (s === "paid") return "Paid"
      if (s === "overdue") return "Overdue"
      return ""
    }

    const rows: CreatePaymentDto[] = []
    const mismatch: string[] = []

    for (const row of dataRows) {
      const rowProjectIdRaw = get(row, "projectid")
      const rowProjectId = rowProjectIdRaw || projectId

      if (rowProjectIdRaw && rowProjectIdRaw !== projectId) {
        mismatch.push(`${rowProjectIdRaw}`)
      }

      const milestone = get(row, "milestone")
      const dueDate = normalizeDateToYmd(get(row, "duedate"))
      const amountRaw = get(row, "amount")
      const amount = parseFloat(amountRaw)
      const status = normalizeStatus(get(row, "status"))
      const paidDate = normalizeDateToYmd(get(row, "paiddate"))
      const notes = get(row, "notes")

      if (!milestone || !dueDate || !amountRaw || Number.isNaN(amount) || amount <= 0 || !status) continue

      // If status is Paid but paidDate missing -> skip that row
      if (status === "Paid" && !paidDate) continue

      rows.push({
        projectId: projectId,
        milestone,
        amount,
        dueDate,
        status,
        paidDate: status === "Paid" ? paidDate : undefined,
        notes: notes || undefined,
      })
    }

    if (mismatch.length > 0) {
      throw new Error(`CSV projectId mismatch. All rows must match current project (${projectId}).`)
    }

    return rows
  }

  const handleCreatePayment = async (data: PaymentFormSchema) => {
    const project = await projectsApi.getById(data.projectId || projectId)
    await createPayment({
      ...data,
      projectId: data.projectId || projectId,
      projectName: project?.name || "",
      amount: typeof data.amount === "string" ? parseFloat(data.amount) : data.amount,
      paidDate: data.paidDate || undefined,
      notes: data.notes || undefined,
    } as Omit<Payment, "id" | "createdAt" | "updatedAt">)
  }

  const handleBulkUpload = async () => {
    setBulkError(null)
    try {
      if (bulkRows.length === 0) {
        setBulkError("No valid rows to upload.")
        return
      }

      // Create sequentially to keep UI predictable and avoid huge request bursts.
      for (const row of bulkRows) {
        await createPayment({
          projectId,
          milestone: row.milestone,
          amount: row.amount,
          dueDate: row.dueDate,
          status: row.status,
          paidDate: row.paidDate,
          notes: row.notes,
        })
      }

      await loadPayments(projectId, true)
      toast.success("Bulk payments uploaded successfully")
      setBulkOpen(false)
      setBulkRows([])
    } catch (err: any) {
      const msg = (err?.message as string) || "Bulk upload failed"
      setBulkError(msg.includes(":") ? msg.split(":").slice(1).join(":").trim() : msg)
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-2">
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
      <PaymentList projectId={projectId} onCreatePayment={handleCreatePayment as any} />

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
            <DialogTitle>Bulk Upload Payments</DialogTitle>
            <DialogDescription className="text-xs">
              Upload CSV for this project only. If any row has a different `projectId`, upload will not proceed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Button type="button" variant="outline" onClick={downloadBulkTemplate}>
                Download CSV Template
              </Button>
              <div className="text-xs text-muted-foreground">Headers: projectId,milestone,amount,dueDate</div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="bulk-payments">Choose CSV file</Label>
              <Input
                id="bulk-payments"
                type="file"
                accept=".csv,text/csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setBulkError(null)
                  setBulkRows([])
                  try {
                    const text = await file.text()
                    const rows = parseBulkPaymentsFromCsv(text)
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

