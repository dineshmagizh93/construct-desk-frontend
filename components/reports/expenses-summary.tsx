"use client"

import * as React from "react"
import { Receipt, DollarSign, Download, Calendar } from "lucide-react"
import { reportsApi, ExpenseSummary as ExpenseSummaryType } from "@/lib/api/reports"
import { ExpenseCategory } from "@/types/expense"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils/currency"

export function ExpensesSummary() {
  const [summary, setSummary] = React.useState<ExpenseSummaryType | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [startDate, setStartDate] = React.useState<string>("")
  const [endDate, setEndDate] = React.useState<string>("")

  const loadSummary = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await reportsApi.getExpenseSummary(
        startDate || undefined,
        endDate || undefined
      )
      setSummary(data)
    } catch (error) {
      console.error("Failed to load expense summary:", error)
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
      ["Expense Summary Report"],
      ["Generated:", new Date().toLocaleString()],
      ...(startDate ? [["Start Date:", startDate]] : []),
      ...(endDate ? [["End Date:", endDate]] : []),
      [],
      ["Total Expenses", formatNumber(summary.total)],
      ["Total Count", summary.count.toString()],
      [],
      ["Category", "Amount", "Percentage"],
      ...Object.entries(summary.byCategory).map(([category, amount]) => [
        category,
        formatNumber(amount),
        `${((amount / summary.total) * 100).toFixed(1)}%`,
      ]),
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
    a.download = `expense-summary-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const getCategoryBadgeVariant = (category: ExpenseCategory) => {
    switch (category) {
      case "Material":
        return "default"
      case "Labour":
        return "secondary"
      case "Transport":
        return "outline"
      case "Equipment":
        return "success"
      case "Other":
        return "warning"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Expenses Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">Loading expenses summary...</div>
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Expenses Summary
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
              <Receipt className="h-5 w-5" />
              Expenses Summary
            </CardTitle>
            <CardDescription>Total expenses and category breakdown</CardDescription>
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
              <Label htmlFor="expense-start-date">Start Date</Label>
              <Input
                id="expense-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="expense-end-date">End Date</Label>
              <Input
                id="expense-end-date"
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

          {/* Total Expenses */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(summary.total)}</p>
            <p className="text-xs text-muted-foreground mt-1">{summary.count} expense entries</p>
          </div>

          {/* Category Breakdown */}
          <div>
            <p className="text-sm font-medium mb-3">Category Breakdown</p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              {Object.entries(summary.byCategory).map(([category, amount]) => (
                <div key={category} className="rounded-lg border bg-card p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={getCategoryBadgeVariant(category as ExpenseCategory)}>
                      {category}
                    </Badge>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(amount)}</p>
                  {summary.total > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {((amount / summary.total) * 100).toFixed(1)}% of total
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

