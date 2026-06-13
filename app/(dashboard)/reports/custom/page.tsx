"use client"

import { useState } from "react"
import { BarChart3, Play, Download, Table2, PieChart, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { apiClient } from "@/lib/api/client"
import { downloadCsv, objectsToCsv } from "@/lib/utils/export-csv"
import { toast } from "react-hot-toast"
import Link from "next/link"

type Module = "projects" | "payments" | "expenses" | "tasks" | "leads"
type ChartType = "bar" | "pie" | "table"
type Metric = "count" | "sum_amount" | "avg_amount"
type GroupBy = "status" | "category" | "projectId" | "month" | "priority"

const MODULE_OPTIONS: { value: Module; label: string }[] = [
  { value: "projects", label: "Projects" },
  { value: "payments", label: "Payments" },
  { value: "expenses", label: "Expenses" },
  { value: "tasks", label: "Tasks" },
  { value: "leads", label: "Leads" },
]

const METRIC_OPTIONS: { value: Metric; label: string; modules: Module[] }[] = [
  { value: "count", label: "Count", modules: ["projects", "payments", "expenses", "tasks", "leads"] },
  { value: "sum_amount", label: "Total Amount", modules: ["payments", "expenses"] },
  { value: "avg_amount", label: "Average Amount", modules: ["payments", "expenses"] },
]

const GROUP_BY_OPTIONS: { value: GroupBy; label: string; modules: Module[] }[] = [
  { value: "status", label: "Status", modules: ["projects", "payments", "tasks", "leads"] },
  { value: "category", label: "Category", modules: ["expenses"] },
  { value: "projectId", label: "Project", modules: ["payments", "expenses", "tasks"] },
  { value: "month", label: "Month", modules: ["projects", "payments", "expenses", "tasks", "leads"] },
  { value: "priority", label: "Priority", modules: ["tasks"] },
]

const CHART_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"]

interface ReportResult {
  label: string
  value: number
}

interface ReportConfig {
  module: Module
  metric: Metric
  groupBy: GroupBy
  startDate: string
  endDate: string
  chartType: ChartType
  title: string
}

export default function CustomReportPage() {
  const [config, setConfig] = useState<ReportConfig>({
    module: "payments",
    metric: "sum_amount",
    groupBy: "status",
    startDate: "",
    endDate: "",
    chartType: "bar",
    title: "Custom Report",
  })
  const [results, setResults] = useState<ReportResult[] | null>(null)
  const [loading, setLoading] = useState(false)

  const update = (key: keyof ReportConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setResults(null)
  }

  const availableMetrics = METRIC_OPTIONS.filter((m) => m.modules.includes(config.module))
  const availableGroupBy = GROUP_BY_OPTIONS.filter((g) => g.modules.includes(config.module))

  const handleRun = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams({
        module: config.module,
        metric: config.metric,
        groupBy: config.groupBy,
        ...(config.startDate && { startDate: config.startDate }),
        ...(config.endDate && { endDate: config.endDate }),
      })
      const data = await apiClient.get<ReportResult[]>(`/reports/custom?${query}`)
      setResults(Array.isArray(data) ? data : [])
    } catch {
      // Fallback: generate mock data to demonstrate the UI
      setResults(generateMockData(config))
      toast(“Using preview data — connect backend for live results”)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!results) return
    const csv = objectsToCsv(results, [
      { key: "label", label: config.groupBy },
      { key: "value", label: config.metric },
    ])
    downloadCsv(csv, `${config.title.replace(/\s+/g, "-").toLowerCase()}.csv`)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-800">Custom Report Builder</h1>
            <p className="text-[13px] text-slate-500">Build and export tailored reports from your data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/reports">
            <Button variant="outline" size="sm">Back to Reports</Button>
          </Link>
          {results && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Config panel */}
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[13px] font-semibold text-slate-700">Report Configuration</p>

          <div className="space-y-1.5">
            <Label className="text-[12px]">Report Title</Label>
            <Input
              value={config.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Monthly Payment Summary"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px]">Data Module</Label>
            <Select
              value={config.module}
              onChange={(e) => update("module", e.target.value)}
              className="text-[13px]"
            >
              {MODULE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px]">Metric</Label>
            <Select
              value={availableMetrics.find((m) => m.value === config.metric) ? config.metric : availableMetrics[0]?.value ?? ""}
              onChange={(e) => update("metric", e.target.value)}
              className="text-[13px]"
            >
              {availableMetrics.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px]">Group By</Label>
            <Select
              value={availableGroupBy.find((g) => g.value === config.groupBy) ? config.groupBy : availableGroupBy[0]?.value ?? ""}
              onChange={(e) => update("groupBy", e.target.value)}
              className="text-[13px]"
            >
              {availableGroupBy.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[12px]">From Date</Label>
              <Input
                type="date"
                value={config.startDate}
                onChange={(e) => update("startDate", e.target.value)}
                className="text-[12px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">To Date</Label>
              <Input
                type="date"
                value={config.endDate}
                onChange={(e) => update("endDate", e.target.value)}
                className="text-[12px]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px]">Visualisation</Label>
            <div className="flex gap-2">
              {[
                { type: "bar", Icon: BarChart2, label: "Bar" },
                { type: "pie", Icon: PieChart, label: "Pie" },
                { type: "table", Icon: Table2, label: "Table" },
              ].map(({ type, Icon, label }) => (
                <button
                  key={type}
                  onClick={() => update("chartType", type)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-lg border py-2.5 text-[11px] font-medium transition-colors ${
                    config.chartType === type
                      ? "border-blue-200 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleRun} disabled={loading}>
            <Play className="mr-1.5 h-4 w-4" />
            {loading ? "Running..." : "Run Report"}
          </Button>
        </div>

        {/* Results panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          {!results ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BarChart3 className="mb-3 h-10 w-10 text-slate-200" />
              <p className="text-[14px] font-medium text-slate-400">Configure and run your report</p>
              <p className="text-[13px] text-slate-300">Results will appear here</p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-[14px] font-semibold text-slate-800">{config.title}</p>

              {config.chartType === "bar" && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={results} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {results.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {config.chartType === "pie" && (
                <ResponsiveContainer width="100%" height={300}>
                  <RPieChart>
                    <Pie data={results} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={110} label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}>
                      {results.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                  </RPieChart>
                </ResponsiveContainer>
              )}

              {config.chartType === "table" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-left">
                        <th className="px-3 py-2.5 font-medium text-slate-500 capitalize">{config.groupBy}</th>
                        <th className="px-3 py-2.5 font-medium text-slate-500 capitalize text-right">{config.metric.replace(/_/g, " ")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {results.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2.5 font-medium text-slate-700">{row.label}</td>
                          <td className="px-3 py-2.5 text-right text-slate-600">
                            {config.metric === "count"
                              ? row.value
                              : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(row.value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-200">
                        <td className="px-3 py-2.5 text-[12px] font-semibold text-slate-600">Total</td>
                        <td className="px-3 py-2.5 text-right text-[12px] font-semibold text-slate-800">
                          {config.metric === "count"
                            ? results.reduce((s, r) => s + r.value, 0)
                            : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
                                results.reduce((s, r) => s + r.value, 0)
                              )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Summary stats */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: "Groups", value: results.length },
                  { label: "Total", value: results.reduce((s, r) => s + r.value, 0) },
                  { label: "Average", value: results.length ? Math.round(results.reduce((s, r) => s + r.value, 0) / results.length) : 0 },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5 text-center">
                    <p className="text-[12px] text-slate-400">{stat.label}</p>
                    <p className="text-[16px] font-bold text-slate-700">{stat.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function generateMockData(config: ReportConfig): ReportResult[] {
  const statusMocks: Record<string, ReportResult[]> = {
    projects: [
      { label: "Active", value: 12 },
      { label: "Completed", value: 8 },
      { label: "On Hold", value: 3 },
      { label: "Planning", value: 5 },
    ],
    payments: [
      { label: "Paid", value: 2450000 },
      { label: "Pending", value: 870000 },
      { label: "Overdue", value: 320000 },
    ],
    expenses: [
      { label: "Material", value: 1200000 },
      { label: "Labour", value: 750000 },
      { label: "Equipment", value: 450000 },
      { label: "Transport", value: 180000 },
      { label: "Other", value: 95000 },
    ],
    tasks: [
      { label: "Done", value: 47 },
      { label: "In Progress", value: 23 },
      { label: "Todo", value: 31 },
      { label: "Blocked", value: 5 },
    ],
    leads: [
      { label: "New", value: 18 },
      { label: "Contacted", value: 12 },
      { label: "Qualified", value: 8 },
      { label: "Won", value: 5 },
      { label: "Lost", value: 3 },
    ],
  }
  return statusMocks[config.module] || []
}

