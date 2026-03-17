"use client"

import * as React from "react"
import { formatCurrency } from "@/lib/utils/currency"
import { CreditCard, CheckCircle, Clock, AlertCircle, Download, Calendar } from "lucide-react"
import { reportsApi, PaymentSummary } from "@/lib/api/reports"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PaymentsSummary() {
  const [summary, setSummary] = React.useState<PaymentSummary | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [startDate, setStartDate] = React.useState<string>("")
  const [endDate, setEndDate] = React.useState<string>("")

  const loadSummary = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await reportsApi.getPaymentSummary(
        startDate || undefined,
        endDate || undefined
      )
      setSummary(data)
    } catch (error) {
      console.error("Failed to load payment summary:", error)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  React.useEffect(() => {
    loadSummary()
  }, [loadSummary])

  const handleExport = () => {
    if (!summary) return

    // Format number for CSV (plain number with 2 decimal places, no currency symbol)
    const formatNumber = (num: number) => num.toFixed(2)

    // Create CSV content - use plain numbers for Excel compatibility
    const rows = [
      ["Payment Summary Report"],
      ["Generated:", new Date().toLocaleString()],
      ...(startDate ? [["Start Date:", startDate]] : []),
      ...(endDate ? [["End Date:", endDate]] : []),
      [],
      ["Status", "Count", "Amount"],
      ["Paid", summary.paid.count.toString(), formatNumber(summary.paid.amount)],
      ["Pending", summary.pending.count.toString(), formatNumber(summary.pending.amount)],
      ["Overdue", summary.overdue.count.toString(), formatNumber(summary.overdue.amount)],
      ["Total", summary.total.count.toString(), formatNumber(summary.total.amount)],
    ]

    // Convert to CSV format with proper escaping
    const csv = rows
      .map(row => row.map(cell => {
        // Escape cells that contain commas or quotes
        const cellStr = String(cell)
        if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
          return `"${cellStr.replace(/"/g, '""')}"`
        }
        return cellStr
      }).join(","))
      .join("\n")

    // Add BOM for Excel UTF-8 compatibility
    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payment-summary-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payments Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">Loading payments summary...</div>
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payments Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-muted-foreground">No data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payments Summary
            </CardTitle>
            <CardDescription>Overview of all payment statuses</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Date Filters */}
          <div className="grid gap-4 md:grid-cols-3 items-end">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button variant="outline" onClick={() => { setStartDate(""); setEndDate(""); }}>
              <Calendar className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-muted-foreground">Paid</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(summary.paid.amount)}</p>
              <p className="text-xs text-muted-foreground mt-1">{summary.paid.count} payments</p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(summary.pending.amount)}</p>
              <p className="text-xs text-muted-foreground mt-1">{summary.pending.count} payments</p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(summary.overdue.amount)}</p>
              <p className="text-xs text-muted-foreground mt-1">{summary.overdue.count} payments</p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-muted-foreground">Total</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(summary.total.amount)}</p>
              <p className="text-xs text-muted-foreground mt-1">{summary.total.count} payments</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

