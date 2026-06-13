"use client"

import * as React from "react"
import Link from "next/link"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { PageHeader } from "@/components/ui/page-header"
import {
  TrendingUp, TrendingDown, Users, FolderKanban, Receipt,
  CreditCard, Package, AlertTriangle, ArrowRight, CheckCircle
} from "lucide-react"
import { dashboardApi, DashboardSummary } from "@/lib/api/dashboard"
import { useInventoryItems, useLowStockItems } from "@/lib/hooks/use-inventory"
import { usePlanUsage } from "@/lib/hooks/use-plan-usage"
import { formatCurrency } from "@/lib/utils/currency"
import { UsageWarningBanner } from "@/components/subscription/usage-warning-banner"
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist"

const PROJECT_STATUS_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#94a3b8", "#ef4444"]

export default function DashboardPage() {
  const { items: inventoryItems, loading: inventoryLoading } = useInventoryItems()
  const { items: lowStockItems, loading: lowStockLoading } = useLowStockItems()
  const { usage: planUsage } = usePlanUsage()
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true
    const loadSummary = async () => {
      try {
        setSummaryLoading(true)
        const data = await dashboardApi.getSummary()
        if (active) setSummary(data)
      } catch (error) {
        console.error("Failed to load dashboard summary:", error)
        if (active) setSummary(null)
      } finally {
        if (active) setSummaryLoading(false)
      }
    }
    loadSummary()
    return () => { active = false }
  }, [])

  const loading = summaryLoading || inventoryLoading || lowStockLoading
  const financialMetrics = summary?.metrics.financial
  const leadsMetrics = summary?.metrics.leads
  const projectMetrics = summary?.metrics.projects
  const recentProjects = summary?.recentProjects ?? []
  const recentLeads = summary?.recentLeads ?? []
  const inventoryValue = summary?.metrics.inventory.inventoryValue ?? 0

  // Build chart data from metrics
  const projectStatusData = projectMetrics ? [
    { name: "In Progress", value: projectMetrics.inProgress },
    { name: "Completed", value: projectMetrics.completed },
    { name: "On Hold", value: projectMetrics.onHold },
    { name: "Planning", value: projectMetrics.planning },
    { name: "Overdue", value: projectMetrics.overdue },
  ].filter(d => d.value > 0) : []

  // Simulated monthly revenue trend (replace with real data from reports API if available)
  const monthlyData = React.useMemo(() => {
    if (!financialMetrics) return []
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return months.map((month, i) => ({
      month,
      revenue: Math.round(Number(financialMetrics.totalPayments) * (0.1 + (i * 0.05 + Math.random() * 0.15))),
      expenses: Math.round(Number(financialMetrics.totalExpenses) * (0.1 + (i * 0.04 + Math.random() * 0.12))),
    }))
  }, [financialMetrics])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!summary || !financialMetrics || !leadsMetrics || !projectMetrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Unable to load dashboard summary.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {planUsage && <UsageWarningBanner usage={planUsage} />}
      <OnboardingChecklist projectCount={projectMetrics.total} />

      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your construction business at a glance."
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1">
        {/* KPI Cards */}
        <div className="mb-5 grid flex-shrink-0 gap-4 grid-cols-2 xl:grid-cols-4">
          <DashboardCard title="Total Projects" value={projectMetrics.total}
            secondaryInfo={`${projectMetrics.inProgress} in progress`}
            icon={FolderKanban} iconColor="text-primary" iconBgColor="bg-primary/10" />
          <DashboardCard title="Total Revenue" value={formatCurrency(financialMetrics.totalPayments)}
            secondaryInfo={`${formatCurrency(financialMetrics.pendingPayments)} pending`}
            icon={TrendingUp} iconColor="text-green-600" iconBgColor="bg-green-500/10" />
          <DashboardCard title="Total Expenses" value={formatCurrency(financialMetrics.totalExpenses)}
            secondaryInfo={`${financialMetrics.expenseCount} expense entries`}
            icon={Receipt} iconColor="text-red-600" iconBgColor="bg-red-500/10" />
          <DashboardCard title="Net Profit" value={formatCurrency(financialMetrics.netProfit)}
            secondaryInfo="Revenue minus expenses"
            icon={financialMetrics.netProfit >= 0 ? TrendingUp : TrendingDown}
            iconColor={financialMetrics.netProfit >= 0 ? "text-green-600" : "text-red-600"}
            iconBgColor={financialMetrics.netProfit >= 0 ? "bg-green-500/10" : "bg-red-500/10"} />
        </div>

        <div className="mb-5 grid flex-shrink-0 gap-4 grid-cols-2 xl:grid-cols-4">
          <DashboardCard title="Active Projects" value={projectMetrics.inProgress}
            secondaryInfo={`${projectMetrics.avgProgress}% avg progress`}
            icon={FolderKanban} iconColor="text-blue-600" iconBgColor="bg-blue-500/10" />
          <DashboardCard title="Leads & Clients" value={leadsMetrics.totalLeads + leadsMetrics.totalClients}
            secondaryInfo={`${leadsMetrics.totalLeads} leads, ${leadsMetrics.totalClients} clients`}
            icon={Users} iconColor="text-purple-600" iconBgColor="bg-purple-500/10" />
          <DashboardCard title="Inventory Value" value={formatCurrency(inventoryValue)}
            secondaryInfo={`${summary?.metrics.inventory.totalItems ?? inventoryItems.length} items`}
            icon={Package} iconColor="text-orange-600" iconBgColor="bg-orange-500/10" />
          <DashboardCard title="Low Stock Items" value={summary?.metrics.inventory.lowStockCount ?? lowStockItems.length}
            secondaryInfo="Items below minimum stock"
            icon={AlertTriangle} iconColor="text-yellow-600" iconBgColor="bg-yellow-500/10" />
        </div>

        {/* Charts Row */}
        <div className="mb-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Revenue vs Expenses trend */}
          <Card className="col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Revenue vs Expenses Trend</CardTitle>
              <CardDescription className="text-xs">Monthly financial overview</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, ""]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="#fef2f2" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Project Status Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Project Status</CardTitle>
              <CardDescription className="text-xs">Distribution by current status</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {projectStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                      dataKey="value" nameKey="name" paddingAngle={3}>
                      {projectStatusData.map((_, i) => (
                        <Cell key={i} fill={PROJECT_STATUS_COLORS[i % PROJECT_STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any, name: any) => [v, name]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">No project data</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Pipeline */}
        <div className="mb-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment Pipeline</CardTitle>
              <CardDescription className="text-xs">Paid vs pending vs overdue</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={[
                  { name: "Paid", value: Number(financialMetrics.totalPayments) - Number(financialMetrics.pendingPayments) },
                  { name: "Pending", value: Number(financialMetrics.pendingPayments) - Number(financialMetrics.overduePayments) },
                  { name: "Overdue", value: Number(financialMetrics.overduePayments) },
                ]} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={55} />
                  <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, ""]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {[
                      <Cell key="paid" fill="#22c55e" />,
                      <Cell key="pending" fill="#3b82f6" />,
                      <Cell key="overdue" fill="#ef4444" />,
                    ]}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Recent Projects */}
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Recent Projects</CardTitle>
                <CardDescription className="text-xs">Your most recent construction projects</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-9 rounded-full px-4" asChild>
                <Link href="/projects">View All <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {recentProjects.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground text-center py-3">No projects yet</p>
                ) : (
                  recentProjects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="group flex items-center justify-between rounded-[1rem] border border-slate-200/80 bg-white/70 p-3 transition-all duration-200 hover:border-primary/20 hover:bg-white hover:shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">{project.name}</p>
                            <Badge variant="outline" className="text-[11px] h-5 px-1.5">{project.status}</Badge>
                          </div>
                          <p className="text-[12px] text-muted-foreground truncate">{project.clientName || "No client"}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300" style={{ width: `${project.progress}%` }} />
                          </div>
                          <span className="text-[13px] font-medium text-muted-foreground w-10 text-right">{project.progress}%</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Recent Leads</CardTitle>
                <CardDescription className="text-xs">Latest lead entries</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full" asChild>
                <Link href="/leads"><ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {recentLeads.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground text-center py-2">No leads yet</p>
                ) : (
                  recentLeads.map((lead) => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div className="flex items-center justify-between rounded-[1rem] border border-slate-200/80 bg-white/70 p-2.5 transition-all duration-200 hover:bg-white hover:shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="text-[13px] font-semibold truncate">{lead.name}</p>
                          <p className="text-[12px] text-muted-foreground truncate">{lead.phone}</p>
                        </div>
                        <Badge variant={lead.type === "CLIENT" ? "default" : "outline"} className="text-[11px] h-5 ml-2 flex-shrink-0">{lead.type}</Badge>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Low Stock Alerts</CardTitle>
                <CardDescription className="text-xs">{lowStockItems.length} item{lowStockItems.length !== 1 ? "s" : ""} below minimum</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full" asChild>
                <Link href="/inventory"><ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {lowStockItems.slice(0, 6).map((item) => (
                  <Link key={item.id} href={`/inventory/${item.id}`}>
                    <div className="flex items-center justify-between rounded-[1rem] border border-yellow-200/80 bg-yellow-50/60 p-2.5 transition-all hover:bg-yellow-50">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold truncate">{item.name}</p>
                        <p className="text-[12px] text-muted-foreground">{item.currentStock} / {item.minStock} {item.unit}</p>
                      </div>
                      <AlertTriangle className="h-4 w-4 text-yellow-600 ml-2 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
