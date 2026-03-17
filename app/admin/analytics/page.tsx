"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { adminApi } from "@/lib/api/admin"
import { useSuperAdmin } from "@/lib/hooks/use-super-admin"
import { useRouter } from "next/navigation"
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  BarChart3,
  FileText,
  FolderKanban,
  HardDrive,
  ArrowRight,
  RefreshCw,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function AnalyticsPage() {
  const { isSuperAdmin } = useSuperAdmin()
  const router = useRouter()
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [selectedCompany, setSelectedCompany] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<"messages" | "projects" | "payments">("projects")

  React.useEffect(() => {
    if (!isSuperAdmin) {
      router.push("/admin")
      return
    }

    fetchAnalytics()
  }, [isSuperAdmin, router])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getDashboard()
      setStats(data)
      
      // Set first company as selected if available
      if (data.recentOnboardings && data.recentOnboardings.length > 0) {
        setSelectedCompany(data.recentOnboardings[0].id)
      }
    } catch (err: any) {
      console.error("Failed to fetch analytics:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!isSuperAdmin) {
    return null
  }

  // Generate sample activity data for charts
  const generateActivityData = (days: number = 30) => {
    const data = []
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      data.push({
        date: format(date, "MMM dd"),
        projects: Math.floor(Math.random() * 20) + 5,
        payments: Math.floor(Math.random() * 15) + 3,
        documents: Math.floor(Math.random() * 30) + 10,
        users: Math.floor(Math.random() * 10) + 2,
      })
    }
    return data
  }

  const activityData = generateActivityData(30)

  const overview = stats?.overview
  const recentOnboardings = stats?.recentOnboardings || []
  const plans = stats?.plans || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Analytics"
          description="Comprehensive analytics and insights for all companies"
        />
        <Button variant="outline" size="sm" onClick={fetchAnalytics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/admin/companies")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : overview?.totalCompanies || 0}
            </div>
            <Button variant="link" className="p-0 h-auto text-xs mt-2" asChild>
              <span className="text-primary">View details →</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/admin/companies?status=active")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? <Skeleton className="h-8 w-16" /> : overview?.activeCompanies || 0}
            </div>
            <Button variant="link" className="p-0 h-auto text-xs mt-2" asChild>
              <span className="text-primary">View details →</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/admin/companies?status=trial")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trial Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? <Skeleton className="h-8 w-16" /> : overview?.trialCompanies || 0}
            </div>
            <Button variant="link" className="p-0 h-auto text-xs mt-2" asChild>
              <span className="text-primary">View details →</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                Object.values(plans).reduce((sum: number, plan: any) => sum + (plan.active || 0), 0)
              )}
            </div>
            <Button variant="link" className="p-0 h-auto text-xs mt-2" asChild>
              <span className="text-primary">View details →</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : overview?.activeUsers || 0}
            </div>
            <Button variant="link" className="p-0 h-auto text-xs mt-2" asChild>
              <span className="text-primary">View details →</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">00</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
            <Button variant="link" className="p-0 h-auto text-xs mt-2" asChild>
              <span className="text-primary">View details →</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <div className="flex items-center gap-2">
            <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm">
              <option>All Plans</option>
              <option>Starter</option>
              <option>Growth</option>
              <option>Professional</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Top Active Companies List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Top Active Companies</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : recentOnboardings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No companies yet
                </p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {recentOnboardings.slice(0, 10).map((company: any, index: number) => (
                    <div
                      key={company.id}
                      onClick={() => setSelectedCompany(company.id)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-colors border",
                        selectedCompany === company.id
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-accent border-transparent"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm font-medium text-muted-foreground">
                            #{index + 1}
                          </span>
                          <span className="text-sm font-medium truncate">
                            {company.name}
                          </span>
                        </div>
                        <Badge
                          variant={
                            company.subscriptionPlan === "PROFESSIONAL"
                              ? "default"
                              : company.subscriptionPlan === "GROWTH"
                              ? "secondary"
                              : "outline"
                          }
                          className="ml-2"
                        >
                          {company.subscriptionPlan || "TRIAL"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {recentOnboardings.length > 10 && (
                    <Button
                      variant="ghost"
                      className="w-full mt-2"
                      onClick={() => router.push("/admin/companies")}
                    >
                      View All
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Graph Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  {selectedCompany && recentOnboardings.find((c: any) => c.id === selectedCompany) ? (
                    <>
                      <CardTitle className="text-base">
                        {recentOnboardings.find((c: any) => c.id === selectedCompany)?.name}
                      </CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {recentOnboardings.find((c: any) => c.id === selectedCompany)?.subscriptionPlan || "TRIAL"}
                      </Badge>
                    </>
                  ) : (
                    <CardTitle className="text-base">Select a company to view activity</CardTitle>
                  )}
                </div>
                {selectedCompany && (
                  <p className="text-xs text-muted-foreground">
                    Integrated On:{" "}
                    {recentOnboardings.find((c: any) => c.id === selectedCompany)?.createdAt
                      ? format(
                          new Date(
                            recentOnboardings.find((c: any) => c.id === selectedCompany)?.createdAt
                          ),
                          "MMM dd, yyyy"
                        )
                      : "N/A"}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedCompany ? (
                <>
                  <div className="mb-4">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded"></div>
                        <span className="text-sm font-medium">
                          Total Projects: {stats?.usage?.total?.projects || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 mb-4 border-b">
                    <button
                      onClick={() => setActiveTab("projects")}
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px]",
                        activeTab === "projects"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Total Projects
                    </button>
                    <button
                      onClick={() => setActiveTab("payments")}
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px]",
                        activeTab === "payments"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Total Payments
                    </button>
                    <button
                      onClick={() => setActiveTab("messages")}
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px]",
                        activeTab === "messages"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Documents
                    </button>
                  </div>

                  {/* Chart */}
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey={
                            activeTab === "projects"
                              ? "projects"
                              : activeTab === "payments"
                              ? "payments"
                              : "documents"
                          }
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p>Select a company from the list to view activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Analytics Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Plan Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Breakdown of companies by subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(plans).map(([plan, data]: [string, any]) => ({
                    name: plan || "TRIAL",
                    count: data.count || 0,
                    active: data.active || 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Total" />
                    <Bar dataKey="active" fill="#10b981" name="Active" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Statistics Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>Average usage across all companies</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Users",
                        average: stats?.usage?.average?.users || 0,
                        total: stats?.usage?.total?.users || 0,
                      },
                      {
                        name: "Projects",
                        average: stats?.usage?.average?.projects || 0,
                        total: stats?.usage?.total?.projects || 0,
                      },
                      {
                        name: "Storage (GB)",
                        average: stats?.usage?.average?.storage || 0,
                        total: stats?.usage?.total?.storage || 0,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average" fill="#8b5cf6" name="Average" />
                    <Bar dataKey="total" fill="#f59e0b" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
