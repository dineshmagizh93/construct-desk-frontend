"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { adminApi, AdminDashboardStats } from "@/lib/api/admin"
import { useSuperAdmin } from "@/lib/hooks/use-super-admin"
import { useRouter } from "next/navigation"
import { formatDateDMY } from "@/lib/utils/date"
import {
  Building2,
  Users,
  FolderKanban,
  TrendingUp,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  BarChart3,
  Shield,
  Activity,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardPage() {
  const { isSuperAdmin } = useSuperAdmin()
  const router = useRouter()
  const [stats, setStats] = React.useState<AdminDashboardStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isSuperAdmin) {
      router.push("/dashboard")
      return
    }

    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await adminApi.getDashboard()
        setStats(data)
      } catch (err: any) {
        setError(err.message || "Failed to load admin dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [isSuperAdmin, router])

  if (!isSuperAdmin) {
    return null
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Super Admin Dashboard"
          description="Comprehensive analytics and customer management"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Super Admin Dashboard"
          description="Comprehensive analytics and customer management"
        />
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const storageStatusColor = {
    OK: "bg-green-500",
    WARNING: "bg-yellow-500",
    CRITICAL: "bg-red-500",
  }[stats.storage.physical.status]

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span>Super Admin Dashboard</span>
          </div>
        }
        description="Track customer onboarding, usage, and system analytics"
      />

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalCompanies}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.overview.activeCompanies} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.overview.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Companies</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.trialCompanies}</div>
            <p className="text-xs text-muted-foreground mt-1">
              On trial period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Storage Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Analytics
          </CardTitle>
          <CardDescription>Physical and virtual storage usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Physical Storage</span>
                <Badge variant={stats.storage.physical.status === "CRITICAL" ? "destructive" : stats.storage.physical.status === "WARNING" ? "default" : "secondary"}>
                  {stats.storage.physical.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-medium">{stats.storage.physical.used.toFixed(2)} GB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-medium">{stats.storage.physical.available.toFixed(2)} GB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Limit</span>
                  <span className="font-medium">{stats.storage.physical.limit} GB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${storageStatusColor}`}
                    style={{ width: `${Math.min(stats.storage.physical.usagePercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.storage.physical.usagePercent.toFixed(1)}% used
                </p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Virtual Storage</span>
                <Badge variant="outline">Oversell Ratio: {stats.storage.virtual.oversellRatio.toFixed(1)}x</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sold</span>
                  <span className="font-medium">{stats.storage.virtual.sold.toFixed(2)} GB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-medium">{stats.storage.virtual.used.toFixed(2)} GB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Utilization</span>
                  <span className="font-medium">
                    {((stats.storage.virtual.used / stats.storage.virtual.sold) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          {stats.storage.alert && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{stats.storage.alert}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Plan Distribution
          </CardTitle>
          <CardDescription>Customer distribution across subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(stats.plans).map(([plan, data]) => (
              <div key={plan} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{plan}</h3>
                  <Badge variant="outline">{data.count} total</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active</span>
                    <span className="font-medium text-green-600">{data.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trial</span>
                    <span className="font-medium text-yellow-600">{data.trial}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Usage Statistics
          </CardTitle>
          <CardDescription>Average and total usage across all companies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-3">Average Usage</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Users per company</span>
                  <span className="font-medium">{stats.usage.average.users.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Projects per company</span>
                  <span className="font-medium">{stats.usage.average.projects.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Storage per company</span>
                  <span className="font-medium">{stats.usage.average.storage.toFixed(2)} GB</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Total Usage</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total users</span>
                  <span className="font-medium">{stats.usage.total.users}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total projects</span>
                  <span className="font-medium">{stats.usage.total.projects}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total storage</span>
                  <span className="font-medium">{stats.usage.total.storage.toFixed(2)} GB</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Onboardings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Onboardings
          </CardTitle>
          <CardDescription>Latest customer signups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.recentOnboardings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent onboardings</p>
            ) : (
              stats.recentOnboardings.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{company.name}</p>
                      <Badge variant="outline">{company.subscriptionPlan || "TRIAL"}</Badge>
                      {company.subscriptionStatus === "trial" && (
                        <Badge variant="secondary">Trial</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{company.email}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{company._count.users} users</span>
                      <span>{company._count.projects} projects</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDateDMY(company.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
