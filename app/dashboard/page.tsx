"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { formatCurrency } from "@/lib/utils/currency"
import { Project } from "@/types/project"
import { Payment } from "@/types/payment"
import { Expense } from "@/types/expense"
import { Lead } from "@/types/lead"
import { InventoryItem } from "@/lib/api/inventory"

export default function DashboardPage() {
  const { projects, loading: projectsLoading } = useProjects()
  const { expenses, loading: expensesLoading } = useExpenses()
  const { payments, loading: paymentsLoading } = usePayments()
  const { leads, loading: leadsLoading } = useLeads()
  const { items: inventoryItems, loading: inventoryLoading } = useInventoryItems()
  const { items: lowStockItems, loading: lowStockLoading } = useLowStockItems()

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-border/40">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Welcome back! Here's an overview of your construction business.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in">
        {/* Total Projects */}
        <Card className="group hover:border-primary/20 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{projectMetrics.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {projectMetrics.inProgress} in progress
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="group hover:border-green-500/20 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{formatCurrency(financialMetrics.totalPayments)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(financialMetrics.pendingPayments)} pending
            </p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="group hover:border-red-500/20 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
              <Receipt className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{formatCurrency(financialMetrics.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.length} expense entries
            </p>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className={`group transition-all duration-300 ${financialMetrics.netProfit >= 0 ? 'hover:border-green-500/20' : 'hover:border-red-500/20'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${financialMetrics.netProfit >= 0 ? 'bg-green-500/10 group-hover:bg-green-500/20' : 'bg-red-500/10 group-hover:bg-red-500/20'}`}>
              {financialMetrics.netProfit >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold tracking-tight ${financialMetrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(financialMetrics.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue - Expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in" style={{ animationDelay: '0.1s' }}>
        {/* Active Projects */}
        <Card className="group hover:border-blue-500/20 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <FolderKanban className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{projectMetrics.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {projectMetrics.avgProgress}% avg progress
            </p>
          </CardContent>
        </Card>

        {/* Leads & Clients */}
        <Card className="group hover:border-purple-500/20 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leads & Clients</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{leadsMetrics.totalLeads + leadsMetrics.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {leadsMetrics.totalLeads} leads, {leadsMetrics.totalClients} clients
            </p>
          </CardContent>
        </Card>

        {/* Inventory Value */}
        <Card className="group hover:border-orange-500/20 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{formatCurrency(inventoryValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {inventoryItems.length} items
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="group hover:border-yellow-500/20 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Items below minimum stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Projects */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your most recent construction projects</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No projects found</p>
              ) : (
                recentProjects.map((project, index) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div 
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent hover:border-primary/20 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">{project.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {project.clientName || "No client"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24 bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-500 group-hover:bg-primary/80"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground w-12 text-right">
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
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Revenue and expenses overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(financialMetrics.totalPayments)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Expenses</span>
                <span className="text-sm font-semibold text-red-600">
                  {formatCurrency(financialMetrics.totalExpenses)}
                </span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net Profit</span>
                <span className={`text-sm font-bold ${financialMetrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financialMetrics.netProfit)}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Payments</span>
                <span className="text-sm font-semibold">
                  {formatCurrency(financialMetrics.pendingPayments)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overdue Payments</span>
                <span className="text-sm font-semibold text-red-600">
                  {formatCurrency(financialMetrics.overduePayments)}
                </span>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/payments">
                  <CreditCard className="mr-2 h-4 w-4" />
                  View Payments
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/expenses">
                  <Receipt className="mr-2 h-4 w-4" />
                  View Expenses
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>Latest lead entries</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/leads">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">No leads found</p>
              ) : (
                recentLeads.map((lead) => (
                  <Link key={lead.id} href={`/leads/${lead.id}`}>
                    <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.phone}</p>
                      </div>
                      <Badge variant={lead.type === "CLIENT" ? "default" : "outline"}>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Items below minimum stock</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/inventory">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">All items in stock</p>
              ) : (
                lowStockItems.slice(0, 5).map((item) => (
                  <Link key={item.id} href={`/inventory/${item.id}`}>
                    <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.currentStock} {item.unit} / {item.minStock} {item.unit}
                        </p>
                      </div>
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">In Progress</span>
                </div>
                <span className="text-sm font-semibold">{projectMetrics.inProgress}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Completed</span>
                </div>
                <span className="text-sm font-semibold">{projectMetrics.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  <span className="text-sm">Planning</span>
                </div>
                <span className="text-sm font-semibold">{projectMetrics.planning}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">On Hold</span>
                </div>
                <span className="text-sm font-semibold">{projectMetrics.onHold}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex flex-col items-start p-5 text-left hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group" asChild>
              <Link href="/projects" className="flex flex-col items-start gap-2 w-full">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FolderKanban className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold block text-base">New Project</span>
                <span className="text-xs text-muted-foreground block leading-relaxed">Start a new project</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-start p-5 text-left hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group" asChild>
              <Link href="/leads" className="flex flex-col items-start gap-2 w-full">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold block text-base">Add Lead</span>
                <span className="text-xs text-muted-foreground block leading-relaxed">Register a new lead</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-start p-5 text-left hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group" asChild>
              <Link href="/payments" className="flex flex-col items-start gap-2 w-full">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold block text-base">Record Payment</span>
                <span className="text-xs text-muted-foreground block leading-relaxed">Log payment transaction</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-start p-5 text-left hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group" asChild>
              <Link href="/inventory" className="flex flex-col items-start gap-2 w-full">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold block text-base">Manage Inventory</span>
                <span className="text-xs text-muted-foreground block leading-relaxed">View inventory items</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
