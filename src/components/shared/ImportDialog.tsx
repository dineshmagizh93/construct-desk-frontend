import { useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { downloadTemplate, parseExcelFile } from '@/lib/excel'
import { toast } from '@/hooks/use-toast'
import type { ImportColumn } from './types'

interface ParsedRow {
  index: number
  values: Record<string, unknown>
  error: string | null
}

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityLabel: string
  columns: ImportColumn[]
  fileName?: string
  validateRow?: (values: Record<string, unknown>) => string | null
  onConfirm: (rows: Record<string, unknown>[]) => Promise<void>
}

function coerceValue(raw: unknown, type: ImportColumn['type']) {
  if (raw === undefined || raw === null || raw === '') return undefined
  if (type === 'number') {
    const num = Number(raw)
    return Number.isNaN(num) ? raw : num
  }
  return raw
}

export function ImportDialog({
  open,
  onOpenChange,
  entityLabel,
  columns,
  fileName,
  validateRow,
  onConfirm,
}: ImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ParsedRow[] | null>(null)
  const [importing, setImporting] = useState(false)

  const reset = () => {
    setRows(null)
    setImporting(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleClose = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleFile = async (file: File) => {
    try {
      const rawRows = await parseExcelFile(file)
      const parsed: ParsedRow[] = rawRows.map((raw, index) => {
        const values: Record<string, unknown> = {}
        columns.forEach((col) => {
          values[col.key] = coerceValue(raw[col.header], col.type)
        })

        const missing = columns.find((col) => col.required && (values[col.key] === undefined || values[col.key] === ''))
        let error: string | null = missing ? `Missing required field: ${missing.header}` : null
        if (!error && validateRow) {
          error = validateRow(values)
        }

        return { index: index + 2, values, error }
      })
      setRows(parsed)
    } catch {
      toast({ title: 'Could not read file', description: 'Make sure you uploaded a valid .xlsx file.', variant: 'destructive' })
    }
  }

  const validRows = rows?.filter((r) => !r.error) ?? []
  const invalidRows = rows?.filter((r) => r.error) ?? []

  const handleImport = async () => {
    if (validRows.length === 0) return
    setImporting(true)
    try {
      await onConfirm(validRows.map((r) => r.values))
      toast({
        title: 'Import complete',
        description: `${validRows.length} ${entityLabel}${validRows.length === 1 ? '' : 's'} imported successfully.`,
        variant: 'success',
      })
      handleClose(false)
    } catch (err) {
      toast({ title: 'Import failed', description: err instanceof Error ? err.message : 'Something went wrong.', variant: 'destructive' })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Import {entityLabel}s from Excel</DialogTitle>
          <DialogDescription>
            Download the template, fill it in following the Instructions sheet, then upload it here.
          </DialogDescription>
        </DialogHeader>

        <Button
          variant="outline"
          onClick={() => downloadTemplate(columns, fileName ?? `${entityLabel}-template.xlsx`)}
        >
          <Download /> Download Template
        </Button>

        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-4 py-6 text-center hover:bg-secondary/50"
        >
          <Upload className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">Click to upload a filled-in .xlsx file</p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </div>

        {rows && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm">
              <FileSpreadsheet className="size-4 text-muted-foreground" />
              <Badge variant="success">{validRows.length} valid</Badge>
              {invalidRows.length > 0 && <Badge variant="destructive">{invalidRows.length} with errors</Badge>}
            </div>
            <div className="max-h-52 space-y-1 overflow-y-auto rounded-md border border-border p-2">
              {rows.map((row) => (
                <div key={row.index} className="flex items-start gap-2 text-xs">
                  {row.error ? (
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                  )}
                  <span className={row.error ? 'text-destructive' : 'text-muted-foreground'}>
                    Row {row.index}: {row.error ?? 'Ready to import'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={validRows.length === 0 || importing}>
            {importing ? 'Importing…' : `Import ${validRows.length} record${validRows.length === 1 ? '' : 's'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
