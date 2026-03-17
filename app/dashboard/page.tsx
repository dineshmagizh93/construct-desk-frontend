"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { PageHeader } from "@/components/ui/page-header"
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  FolderKanban,
  Receipt,
  CreditCard,
  Package,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  FileText,
  Truck,
  HardHat,
  BarChart3,
  Plus,
  Eye
} from "lucide-react"
import { useProjects } from "@/lib/hooks/use-projects"
import { useExpenses } from "@/lib/hooks/use-expenses"
import { usePayments } from "@/lib/hooks/use-payments"
import { useLeads } from "@/lib/hooks/use-leads"
import { useInventoryItems, useLowStockItems } from "@/lib/hooks/use-inventory"
import { usePlanUsage } from "@/lib/hooks/use-plan-usage"
import { formatCurrency } from "@/lib/utils/currency"
import { Project } from "@/types/project"
import { Payment } from "@/types/payment"
import { Expense } from "@/types/expense"
import { Lead } from "@/types/lead"
import { InventoryItem } from "@/lib/api/inventory"
import { UsageWarningBanner } from "@/components/subscription/usage-warning-banner"
import { UsageTracker } from "@/components/subscription/usage-tracker"

export default function DashboardPage() {
  const { projects, loading: projectsLoading } = useProjects()
  const { expenses, loading: expensesLoading } = useExpenses()
  const { payments, loading: paymentsLoading } = usePayments()
  const { leads, loading: leadsLoading } = useLeads()
  const { items: inventoryItems, loading: inventoryLoading } = useInventoryItems()
  const { items: lowStockItems, loading: lowStockLoading } = useLowStockItems()
  const { usage: planUsage } = usePlanUsage()

  const loading = projectsLoading || expensesLoading || paymentsLoading || leadsLoading || inventoryLoading

  // Calculate financial metrics
  const financialMetrics = React.useMemo(() => {
    const totalPayments = payments
      .filter(p => p.status === "Paid")
      .reduce((sum, p) => sum + p.amount, 0)
    
    const pendingPayments = payments
      .filter(p => p.status === "Pending")
      .reduce((sum, p) => sum + p.amount, 0)
    
    const overduePayments = payments
      .filter(p => p.status === "Overdue")
      .reduce((sum, p) => sum + p.amount, 0)
    
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    
    const netProfit = totalPayments - totalExpenses

    return {
      totalPayments,
      pendingPayments,
      overduePayments,
      totalExpenses,
      netProfit,
    }
  }, [payments, expenses])

  // Calculate leads metrics
  const leadsMetrics = React.useMemo(() => {
    const totalLeads = leads.filter(l => l.type === "LEAD").length
    const totalClients = leads.filter(l => l.type === "CLIENT").length
    const newLeads = leads.filter(l => l.status === "New").length
    const converted = leads.filter(l => l.status === "Converted").length

    return {
      totalLeads,
      totalClients,
      newLeads,
      converted,
    }
  }, [leads])

  // Calculate project metrics
  const projectMetrics = React.useMemo(() => {
    const total = projects.length
    const inProgress = projects.filter(p => p.status === "In Progress").length
    const completed = projects.filter(p => p.status === "Completed").length
    const planning = projects.filter(p => p.status === "Planning").length
    const onHold = projects.filter(p => p.status === "On Hold").length
    
    const totalBudget = projects.reduce((sum, p) => {
      return sum + (p.estimatedBudget || 0)
    }, 0)
    
    const avgProgress = projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0

    return {
      total,
      inProgress,
      completed,
      planning,
      onHold,
      totalBudget,
      avgProgress,
    }
  }, [projects])

  // Get recent projects
  const recentProjects = React.useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [projects])

  // Get recent payments
  const recentPayments = React.useMemo(() => {
    return [...payments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [payments])

  // Get recent expenses
  const recentExpenses = React.useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [expenses])

  // Get recent leads
  const recentLeads = React.useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [leads])

  // Inventory value
  const inventoryValue = React.useMemo(() => {
    return inventoryItems.reduce((sum, item) => {
      const stockValue = item.unitPrice ? item.currentStock * item.unitPrice : 0
      return sum + stockValue
    }, 0)
  }, [inventoryItems])

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

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Usage Warning Banner */}
      {planUsage && <UsageWarningBanner usage={planUsage} />}
      
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's an overview of your construction business."
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1">
        {/* Primary Metrics Grid */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4 flex-shrink-0">
          <DashboardCard
            title="Total Projects"
            value={projectMetrics.total}
            secondaryInfo={`${projectMetrics.inProgress} in progress`}
            icon={FolderKanban}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
          <DashboardCard
            title="Total Revenue"
            value={formatCurrency(financialMetrics.totalPayments)}
            secondaryInfo={`${formatCurrency(financialMetrics.pendingPayments)} pending`}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBgColor="bg-green-500/10"
          />
          <DashboardCard
            title="Total Expenses"
            value={formatCurrency(financialMetrics.totalExpenses)}
            secondaryInfo={`${expenses.length} expense entries`}
            icon={Receipt}
            iconColor="text-red-600"
            iconBgColor="bg-red-500/10"
          />
          <DashboardCard
            title="Net Profit"
            value={formatCurrency(financialMetrics.netProfit)}
            secondaryInfo="Revenue - Expenses"
            icon={financialMetrics.netProfit >= 0 ? TrendingUp : TrendingDown}
            iconColor={financialMetrics.netProfit >= 0 ? "text-green-600" : "text-red-600"}
            iconBgColor={financialMetrics.netProfit >= 0 ? "bg-green-500/10" : "bg-red-500/10"}
            className={financialMetrics.netProfit >= 0 ? "" : ""}
          />
        </div>

        {/* Secondary Metrics Grid */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4 flex-shrink-0">
          <DashboardCard
            title="Active Projects"
            value={projectMetrics.inProgress}
            secondaryInfo={`${projectMetrics.avgProgress}% avg progress`}
            icon={FolderKanban}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-500/10"
          />
          <DashboardCard
            title="Leads & Clients"
            value={leadsMetrics.totalLeads + leadsMetrics.totalClients}
            secondaryInfo={`${leadsMetrics.totalLeads} leads, ${leadsMetrics.totalClients} clients`}
            icon={Users}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-500/10"
          />
          <DashboardCard
            title="Inventory Value"
            value={formatCurrency(inventoryValue)}
            secondaryInfo={`${inventoryItems.length} items`}
            icon={Package}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-500/10"
          />
          <DashboardCard
            title="Low Stock Items"
            value={lowStockItems.length}
            secondaryInfo="Items below minimum stock"
            icon={AlertTriangle}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-500/10"
          />
        </div>

        {/* Main Content Grid - Expands to fill remaining space */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-4">
          {/* Recent Projects */}
          <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Recent Projects</CardTitle>
                <CardDescription className="text-xs">Your most recent construction projects</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8" asChild>
                <Link href="/projects">
                  View All <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {recentProjects.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground text-center py-3">No projects found</p>
                ) : (
                  recentProjects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="flex items-center justify-between p-2.5 rounded-[8px] border border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-150 group">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">{project.name}</p>
                            <Badge variant="outline" className="text-[11px] h-5 px-1.5">
                              {project.status}
                            </Badge>
                          </div>
                          <p className="text-[12px] text-muted-foreground truncate">
                            {project.clientName || "No client"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          <div className="w-20 bg-secondary rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-[13px] font-medium text-muted-foreground w-10 text-right">
                            {project.progress}%
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className="col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Financial Summary</CardTitle>
              <CardDescription className="text-xs">Revenue and expenses overview</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Total Revenue</span>
                  <span className="text-[13px] font-semibold text-green-600">
                    {formatCurrency(financialMetrics.totalPayments)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Total Expenses</span>
                  <span className="text-[13px] font-semibold text-red-600">
                    {formatCurrency(financialMetrics.totalExpenses)}
                  </span>
                </div>
                <div className="h-px bg-border my-1.5" />
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold">Net Profit</span>
                  <span className={`text-[13px] font-bold ${financialMetrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(financialMetrics.netProfit)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Pending Payments</span>
                  <span className="text-[13px] font-semibold">
                    {formatCurrency(financialMetrics.pendingPayments)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Overdue Payments</span>
                  <span className="text-[13px] font-semibold text-red-600">
                    {formatCurrency(financialMetrics.overduePayments)}
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-1.5">
                <Button variant="outline" className="w-full justify-start h-8 text-[13px]" asChild>
                  <Link href="/payments">
                    <CreditCard className="mr-2 h-3.5 w-3.5" />
                    View Payments
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-8 text-[13px]" asChild>
                  <Link href="/expenses">
                    <Receipt className="mr-2 h-3.5 w-3.5" />
                    View Expenses
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Sections */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
          {/* Recent Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Recent Leads</CardTitle>
                <CardDescription className="text-xs">Latest lead entries</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8" asChild>
                <Link href="/leads">
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {recentLeads.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground text-center py-2">No leads found</p>
                ) : (
                  recentLeads.map((lead) => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div className="flex items-center justify-between p-2 rounded-[8px] border border-border/50 hover:bg-accent/50 transition-colors">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="text-[13px] font-semibold truncate">{lead.name}</p>
                          <p className="text-[12px] text-muted-foreground truncate">{lead.phone}</p>
                        </div>
                        <Badge variant={lead.type === "CLIENT" ? "default" : "outline"} className="text-[11px] h-5 ml-2 flex-shrink-0">
                          {lead.type}
                        </Badge>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Low Stock Alerts</CardTitle>
                <CardDescription className="text-xs">Items below minimum stock</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8" asChild>
                <Link href="/inventory">
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {lowStockItems.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground text-center py-2">All items in stock</p>
                ) : (
                  lowStockItems.slice(0, 5).map((item) => (
                    <Link key={item.id} href={`/inventory/${item.id}`}>
                      <div className="flex items-center justify-between p-2 rounded-[8px] border border-border/50 hover:bg-accent/50 transition-colors">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="text-[13px] font-semibold truncate">{item.name}</p>
                          <p className="text-[12px] text-muted-foreground">
                            {item.currentStock} {item.unit} / {item.minStock} {item.unit}
                          </p>
                        </div>
                        <AlertTriangle className="h-4 w-4 text-yellow-600 ml-2 flex-shrink-0" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Status Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Project Status</CardTitle>
              <CardDescription className="text-xs">Distribution by status</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-[13px]">In Progress</span>
                  </div>
                  <span className="text-[13px] font-semibold">{projectMetrics.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-[13px]">Completed</span>
                  </div>
                  <span className="text-[13px] font-semibold">{projectMetrics.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                    <span className="text-[13px]">Planning</span>
                  </div>
                  <span className="text-[13px] font-semibold">{projectMetrics.planning}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="text-[13px]">On Hold</span>
                  </div>
                  <span className="text-[13px] font-semibold">{projectMetrics.onHold}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
