"use client"

import * as React from "react"
import { formatCurrency } from "@/lib/utils/currency"
import { Plus, Users, DollarSign } from "lucide-react"
import { useLabour } from "@/lib/hooks/use-labour"
import { Labour } from "@/types/labour"
import { LabourFormSchema } from "@/lib/validations/labour"
import { projectsApi } from "@/lib/api/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LabourForm } from "./labour-form"
import { X } from "lucide-react"
import { LabourList } from "./labour-list"
import { useRole } from "@/lib/hooks/use-role"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { parseCsv, normalizeDateToYmd, normalizeHeaderKey } from "@/lib/utils/csv"
import { CreateLabourDto } from "@/lib/api/labour"
import { LabourCategory } from "@/types/labour"

interface ProjectLabourTabProps {
  projectId: string
}

export function ProjectLabourTab({ projectId }: ProjectLabourTabProps) {
  const { createLabour, loadLabourByProject } = useLabour()
  const { isAdmin } = useRole()
  const [projectLabour, setProjectLabour] = React.useState<Labour[]>([])
  const [loading, setLoading] = React.useState(true)

  const [bulkOpen, setBulkOpen] = React.useState(false)
  const [bulkError, setBulkError] = React.useState<string | null>(null)
  const [bulkRows, setBulkRows] = React.useState<CreateLabourDto[]>([])

  React.useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await loadLabourByProject(projectId)
      setProjectLabour(data)
      setLoading(false)
    }
    load()
  }, [projectId, loadLabourByProject])

  const handleCreateLabour = async (data: LabourFormSchema) => {
    const project = await projectsApi.getById(data.projectId || projectId)
    if (!project) return

    await createLabour({
      projectId: data.projectId || projectId,
      projectName: project.name,
      category: data.category,
      headcount: data.headcount,
      costPerDay: data.costPerDay,
      date: data.date,
      notes: data.notes || undefined,
    } as Omit<Labour, "id" | "createdAt" | "updatedAt">)

    // Reload labour
    const updated = await loadLabourByProject(projectId)
    setProjectLabour(updated)
  }

  const downloadBulkTemplate = () => {
    const headers = ["projectId", "category", "headcount", "costPerDay", "date", "notes"]
    const sample = [
      projectId || "YOUR_PROJECT_ID",
      "Mason",
      "3",
      "1200",
      "2024-01-15",
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
    a.download = "labour-bulk-upload-template.csv"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const parseBulkLabourFromCsv = (csvText: string): CreateLabourDto[] => {
    const parsed = parseCsv(csvText)
    if (parsed.length === 0) return []

    const [headerRow, ...dataRows] = parsed
    const headerMap = new Map<string, number>()
    headerRow.forEach((h, idx) => headerMap.set(normalizeHeaderKey(h), idx))

    const required = ["category", "headcount", "costperday", "date"]
    const missing = required.filter((h) => !headerMap.has(h))
    if (missing.length > 0) throw new Error(`Missing required CSV headers: ${missing.join(", ")}`)

    const get = (row: string[], key: string) => {
      const idx = headerMap.get(key)
      if (idx === undefined) return ""
      return (row[idx] ?? "").trim()
    }

    const normalizeCategory = (raw: string): LabourCategory | "" => {
      const s = raw.trim()
      if (!s) return ""
      const compact = s.toLowerCase().replace(/\s+/g, "")
      const variants: Record<string, LabourCategory> = {
        mason: "Mason",
        helper: "Helper",
        carpenter: "Carpenter",
        electrician: "Electrician",
        plumber: "Plumber",
        painter: "Painter",
        other: "Other",
      }
      return variants[compact] || ""
    }

    const rows: CreateLabourDto[] = []
    const mismatch: string[] = []

    for (const row of dataRows) {
      const rowProjectIdRaw = get(row, "projectid")
      if (rowProjectIdRaw && rowProjectIdRaw !== projectId) mismatch.push(rowProjectIdRaw)
      const finalProjectId = rowProjectIdRaw || projectId

      const category = normalizeCategory(get(row, "category"))
      const date = normalizeDateToYmd(get(row, "date"))
      const headcount = parseInt(get(row, "headcount"), 10)
      const costPerDay = parseFloat(get(row, "costperday"))
      const notes = get(row, "notes")

      if (!category || !date || Number.isNaN(headcount) || headcount <= 0 || Number.isNaN(costPerDay) || costPerDay < 0) {
        continue
      }

      rows.push({
        projectId: finalProjectId,
        category,
        headcount,
        costPerDay,
        date,
        notes: notes || undefined,
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
        await createLabour({
          projectId,
          category: row.category,
          headcount: row.headcount,
          costPerDay: row.costPerDay,
          date: row.date,
          notes: row.notes,
        })
      }

      const updated = await loadLabourByProject(projectId)
      setProjectLabour(updated)
      toast.success("Bulk labour uploaded successfully")
      setBulkOpen(false)
      setBulkRows([])
    } catch (err: any) {
      const raw = err?.message as string
      const cleaned = raw?.includes(":") ? raw.split(":").slice(1).join(":").trim() : raw
      setBulkError(cleaned || "Bulk upload failed")
    }
  }

  const totalHeadcount = projectLabour.reduce((sum, l) => sum + l.headcount, 0)
  const totalCost = projectLabour.reduce((sum, l) => sum + l.headcount * l.costPerDay, 0)

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading labour entries...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Labour</h3>
          <p className="text-sm text-muted-foreground">Track labour entries and costs for this project</p>
        </div>
        <div className="flex items-center gap-2">
          <CreateLabourButton onCreate={handleCreateLabour} projectId={projectId} />
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
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Total Headcount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{totalHeadcount}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {projectLabour.length} labour entr{projectLabour.length !== 1 ? "ies" : "y"} recorded
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Total Labour Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{formatCurrency(totalCost)}</p>
            <p className="text-sm text-muted-foreground mt-1">Total cost across all entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Labour List */}
      <LabourList projectId={projectId} onCreateLabour={() => {}} />

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
            <DialogTitle>Bulk Upload Labour</DialogTitle>
            <DialogDescription className="text-xs">
              Upload CSV for this project only. If any row has a different `projectId`, upload will not proceed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Button type="button" variant="outline" onClick={downloadBulkTemplate}>
                Download CSV Template
              </Button>
              <div className="text-xs text-muted-foreground">Required: category,headcount,costPerDay,date</div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="bulk-labour">Choose CSV file</Label>
              <Input
                id="bulk-labour"
                type="file"
                accept=".csv,text/csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setBulkError(null)
                  setBulkRows([])
                  try {
                    const text = await file.text()
                    const rows = parseBulkLabourFromCsv(text)
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
    </div>
  )
}

function CreateLabourButton({
  onCreate,
  projectId,
}: {
  onCreate: (data: Omit<Labour, "id" | "createdAt" | "updatedAt">) => Promise<void>
  projectId: string
}) {
  const [open, setOpen] = React.useState(false)

  const handleSubmit = async (data: LabourFormSchema) => {
    const project = await projectsApi.getById(data.projectId || projectId)
    if (!project) return

    await onCreate({
      projectId: data.projectId || projectId,
      projectName: project.name,
      category: data.category,
      headcount: data.headcount,
      costPerDay: data.costPerDay,
      date: data.date,
      notes: data.notes || undefined,
    } as Omit<Labour, "id" | "createdAt" | "updatedAt">)
    setOpen(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Labour Entry
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Labour Entry</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <LabourForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} projectId={projectId} />
          </div>
        </>
      )}
    </>
  )
}

