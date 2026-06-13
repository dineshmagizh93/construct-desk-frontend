"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { TrendingUp, ArrowLeft, AlertTriangle, CheckCircle2, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Legend,
} from "recharts"
import { apiClient } from "@/lib/api/client"
import { projectsApi } from "@/lib/api/projects"

interface BudgetForecast {
  projectId: string
  projectName: string
  budget: number
  actualSpend: number
  estimatedSpend: number
  forecastedFinalCost: number
  variance: number
  burnRate: number
  progress: number
  monthlyBreakdown?: Array<{ month: string; actual: number; estimated: number }>
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
}

function StatCard({
  label,
  value,
  sub,
  highlight,
  danger,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
  danger?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        danger
          ? "border-red-100 bg-red-50"
          : highlight
          ? "border-blue-100 bg-blue-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-[12px] font-medium text-slate-500">{label}</p>
      <p
        className={`mt-1 text-[22px] font-bold ${
          danger ? "text-red-600" : highlight ? "text-blue-600" : "text-slate-800"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[12px] text-slate-400">{sub}</p>}
    </div>
  )
}

export default function BudgetForecastPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<BudgetForecast | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    apiClient
      .get<BudgetForecast>(`/projects/${id}/budget-forecast`)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle className="mb-3 h-10 w-10 text-slate-300" />
        <p className="text-[14px] font-medium text-slate-500">Budget data unavailable</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    )
  }

  const isOverBudget = data.forecastedFinalCost > data.budget
  const variancePct = data.budget > 0 ? ((data.variance / data.budget) * 100).toFixed(1) : "0"

  // Build burn chart if not provided
  const burnData = data.monthlyBreakdown || generateBurnData(data)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-[18px] font-semibold text-slate-800">Budget Forecast</h1>
          <p className="text-[13px] text-slate-500">{data.projectName}</p>
        </div>
      </div>

      {/* Status banner */}
      {isOverBudget ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <div>
            <p className="text-[13px] font-semibold text-red-700">Forecasted to exceed budget</p>
            <p className="text-[12px] text-red-500">
              Projected overrun: {formatCurrency(Math.abs(data.variance))} ({Math.abs(Number(variancePct))}%)
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
          <div>
            <p className="text-[13px] font-semibold text-green-700">Within budget</p>
            <p className="text-[12px] text-green-500">
              Remaining buffer: {formatCurrency(data.variance)} ({variancePct}%)
            </p>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Budget" value={formatCurrency(data.budget)} sub="Approved budget" />
        <StatCard
          label="Actual Spend"
          value={formatCurrency(data.actualSpend)}
          sub={`${data.progress}% project complete`}
          highlight
        />
        <StatCard
          label="Forecasted Final Cost"
          value={formatCurrency(data.forecastedFinalCost)}
          sub="At current burn rate"
          danger={isOverBudget}
        />
        <StatCard
          label="Burn Rate"
          value={`${formatCurrency(data.burnRate)}/mo`}
          sub="Monthly average spend"
        />
      </div>

      {/* Budget utilisation bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-3 text-[13px] font-semibold text-slate-700">Budget Utilisation</p>
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-[12px] text-slate-500">
              <span>Actual spend</span>
              <span>{formatCurrency(data.actualSpend)}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-blue-500"
                style={{ width: `${Math.min(100, (data.actualSpend / data.budget) * 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-[12px] text-slate-500">
              <span>Forecasted final cost</span>
              <span>{formatCurrency(data.forecastedFinalCost)}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100">
              <div
                className={`h-3 rounded-full ${isOverBudget ? "bg-red-400" : "bg-amber-400"}`}
                style={{ width: `${Math.min(100, (data.forecastedFinalCost / data.budget) * 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-1 text-right text-[11px] text-slate-400">Budget: {formatCurrency(data.budget)}</div>
        </div>
      </div>

      {/* Burn chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-[13px] font-semibold text-slate-700">Actual vs Estimated Spend Over Time</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={burnData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="estimatedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v: any) => [formatCurrency(v), ""]}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={data.budget} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Budget", fontSize: 10, fill: "#ef4444" }} />
            <Area
              type="monotone"
              dataKey="estimated"
              stroke="#94a3b8"
              strokeWidth={1.5}
              fill="url(#estimatedGrad)"
              name="Estimated"
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#actualGrad)"
              name="Actual"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function generateBurnData(data: BudgetForecast) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const progress = data.progress / 100
  const totalMonths = 6
  const actualMonths = Math.round(progress * totalMonths)
  return months.slice(0, totalMonths).map((month, i) => ({
    month,
    estimated: Math.round((data.budget / totalMonths) * (i + 1)),
    actual: i < actualMonths ? Math.round((data.actualSpend / Math.max(1, actualMonths)) * (i + 1)) : undefined,
  }))
}
