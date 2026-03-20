"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import toast from "react-hot-toast"

export interface BulkUploadModalProps<T> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  requiredHeaders: string[]
  onDownloadTemplate: () => void
  onParseCsv: (text: string) => T[]
  onUpload: (rows: T[]) => Promise<{ created?: number; skipped?: number } | void>
  summaryFormatter?: (rows: T[]) => React.ReactNode
}

export function BulkUploadModal<T>({
  open,
  onOpenChange,
  title,
  description,
  requiredHeaders,
  onDownloadTemplate,
  onParseCsv,
  onUpload,
  summaryFormatter,
}: BulkUploadModalProps<T>) {
  const [error, setError] = React.useState<string | null>(null)
  const [rows, setRows] = React.useState<T[]>([])

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setError(null)
      setRows([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-3 rounded-md bg-muted/50 p-4 text-sm border">
            <div>
              <span className="font-semibold text-foreground">Required headers:</span>
              <p className="text-muted-foreground mt-1 text-xs break-all">
                {requiredHeaders.map((h, i) => (
                  <React.Fragment key={h}>
                    <code className="bg-background px-1 py-0.5 rounded border">{h}</code>
                    {i < requiredHeaders.length - 1 && ", "}
                  </React.Fragment>
                ))}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={onDownloadTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              Download CSV Template
            </Button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bulk-upload">Choose CSV file</Label>
            <Input
              id="bulk-upload"
              type="file"
              accept=".csv,text/csv"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setError(null)
                setRows([])
                try {
                  const text = await file.text()
                  const parsedRows = onParseCsv(text)
                  if (!parsedRows || parsedRows.length === 0) {
                    throw new Error("No valid rows found. Check your CSV headers and values.")
                  }
                  setRows(parsedRows)
                } catch (err: any) {
                  setError(err?.message || "Failed to parse CSV.")
                }
                e.target.value = ""
              }}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {rows.length > 0 && (
            <div className="rounded-md border border-border/40 p-3 text-sm">
              <div className="font-medium">Parsed CSV summary</div>
              <div className="text-muted-foreground mt-1 text-xs">
                {summaryFormatter ? (
                  summaryFormatter(rows)
                ) : (
                  <>Valid rows ready to upload: <span className="font-semibold text-foreground">{rows.length}</span></>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={rows.length === 0}
            onClick={async () => {
              try {
                setError(null)
                const res = await onUpload(rows)
                if (res && res.created !== undefined && res.skipped !== undefined) {
                  toast.success(`Bulk upload complete. Created: ${res.created}, Skipped: ${res.skipped}`)
                } else {
                  toast.success("Bulk upload complete.")
                }
                handleOpenChange(false)
              } catch (err: any) {
                const raw = (err?.message as string) || "Bulk upload failed."
                const cleaned = raw.includes(":") ? raw.split(":").slice(1).join(":").trim() : raw
                setError(cleaned)
              }
            }}
          >
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
