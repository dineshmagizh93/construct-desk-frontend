"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { adminApi } from "@/lib/api/admin"
import { useSuperAdmin } from "@/lib/hooks/use-super-admin"
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Users,
  FolderKanban,
  FileText,
  HardDrive,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  DollarSign,
  TrendingUp,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CompanyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { isSuperAdmin } = useSuperAdmin()
  const companyId = params.id as string
  const [company, setCompany] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isSuperAdmin) {
      router.push("/admin")
      return
    }

    if (companyId) {
      fetchCompanyDetails()
    }
  }, [isSuperAdmin, router, companyId])

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getCompanyDetails(companyId)
      setCompany(data)
    } catch (err: any) {
      setError(err.message || "Failed to load company details")
    } finally {
      setLoading(false)
    }
  }

  if (!isSuperAdmin) {
    return null
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Company Details" />
        <div className="grid gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="space-y-6">
        <PageHeader title="Company Details" />
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error || "Company not found"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>
      case "trial":
        return <Badge variant="secondary">Trial</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "expired":
        return <Badge variant="outline">Expired</Badge>
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>
    }
  }

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      STARTER: "bg-blue-500",
      GROWTH: "bg-purple-500",
      PROFESSIONAL: "bg-orange-500",
      ENTERPRISE: "bg-red-500",
    }
    return (
      <Badge className={colors[plan] || "bg-gray-500"}>
        {plan || "TRIAL"}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin/companies")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span>{company.name}</span>
            </div>
          }
          description="Complete company information and usage statistics"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{company.email}</span>
                  </div>
                  {company.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{company.phone}</span>
                    </div>
                  )}
                  {company.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="text-muted-foreground">Address: </span>
                        <span className="font-medium">{company.address}</span>
                        {(company.city || company.state) && (
                          <div className="text-muted-foreground">
                            {company.city}
                            {company.city && company.state && ", "}
                            {company.state} {company.zipCode}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Website:</span>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                  {company.taxId && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Tax ID:</span>
                      <span className="font-medium">{company.taxId}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Users</span>
                    </div>
                    <span className="font-semibold">{company._count?.users || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Projects</span>
                    </div>
                    <span className="font-semibold">{company._count?.projects || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Documents</span>
                    </div>
                    <span className="font-semibold">{company._count?.documents || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Tasks</span>
                    </div>
                    <span className="font-semibold">{company._count?.tasks || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Leads</span>
                    </div>
                    <span className="font-semibold">{company._count?.leads || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Plan Name</label>
                  <div className="mt-1">{getPlanBadge(company.subscriptionPlan || "TRIAL")}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(company.subscriptionStatus)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Subscription Start Date
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {company.subscriptionStartDate
                        ? format(
                            new Date(company.subscriptionStartDate),
                            "MMM dd, yyyy 'at' hh:mm a"
                          )
                        : "Not set"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Subscription End Date
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {company.subscriptionEndDate
                        ? format(
                            new Date(company.subscriptionEndDate),
                            "MMM dd, yyyy 'at' hh:mm a"
                          )
                        : "Not set"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Trial Start Date
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {company.createdAt
                        ? format(new Date(company.createdAt), "MMM dd, yyyy 'at' hh:mm a")
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Account Created
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {company.createdAt
                        ? format(new Date(company.createdAt), "MMM dd, yyyy 'at' hh:mm a")
                        : "N/A"}
                    </span>
                  </div>
                </div>
                {company.razorpayCustomerId && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Razorpay Customer ID
                    </label>
                    <div className="mt-1 font-mono text-sm">{company.razorpayCustomerId}</div>
                  </div>
                )}
                {company.razorpaySubscriptionId && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Razorpay Subscription ID
                    </label>
                    <div className="mt-1 font-mono text-sm">{company.razorpaySubscriptionId}</div>
                  </div>
                )}
              </div>

              {company.storageInfo && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Storage Information</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Base Storage
                      </label>
                      <div className="mt-1 font-medium">
                        {company.storageInfo.baseStorage} GB
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Extra Storage
                      </label>
                      <div className="mt-1 font-medium">
                        {company.storageInfo.extraStorage} GB
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Total Limit
                      </label>
                      <div className="mt-1 font-medium">
                        {company.storageInfo.totalLimit === Infinity
                          ? "Unlimited"
                          : `${company.storageInfo.totalLimit} GB`}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Used</label>
                      <div className="mt-1 font-medium">
                        {company.storageInfo.used.toFixed(2)} GB
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Available</label>
                      <div className="mt-1 font-medium">
                        {company.storageInfo.available === Infinity
                          ? "Unlimited"
                          : `${company.storageInfo.available.toFixed(2)} GB`}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Usage</label>
                      <div className="mt-1 font-medium">{company.storageInfo.usagePercent}%</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Statistics Tab */}
        <TabsContent value="usage" className="space-y-4">
          {company.usage ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{company.usage.users.current}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    of {company.usage.users.limit === Infinity
                      ? "∞"
                      : company.usage.users.limit}{" "}
                    limit
                  </p>
                  <div className="mt-2 w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min(company.usage.users.percentage, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {company.usage.users.percentage}% used
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{company.usage.projects.current}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    of {company.usage.projects.limit === Infinity
                      ? "∞"
                      : company.usage.projects.limit}{" "}
                    limit
                  </p>
                  <div className="mt-2 w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min(company.usage.projects.percentage, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {company.usage.projects.percentage}% used
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Storage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {company.usage.storage.current.toFixed(2)} GB
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    of {company.usage.storage.limit === Infinity
                      ? "∞"
                      : `${company.usage.storage.limit.toFixed(2)} GB`}{" "}
                    limit
                  </p>
                  <div className="mt-2 w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min(company.usage.storage.percentage, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {company.usage.storage.percentage}% used
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Usage statistics not available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Users</CardTitle>
              <CardDescription>
                {company.users?.length || 0} user(s) in this company
              </CardDescription>
            </CardHeader>
            <CardContent>
              {company.users && company.users.length > 0 ? (
                <div className="space-y-2">
                  {company.users.map((user: any) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{user.role}</Badge>
                          {user.isActive ? (
                            <Badge variant="default" className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          {user.isApproved ? (
                            <Badge variant="default" className="bg-blue-500">Approved</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.createdAt
                          ? format(new Date(user.createdAt), "MMM dd, yyyy")
                          : "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No users found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Projects</CardTitle>
              <CardDescription>
                {company.projects?.length || 0} project(s) in this company
              </CardDescription>
            </CardHeader>
            <CardContent>
              {company.projects && company.projects.length > 0 ? (
                <div className="space-y-2">
                  {company.projects.map((project: any) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{project.status}</Badge>
                          {project.progress !== null && (
                            <Badge variant="secondary">{project.progress}% Complete</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {project.createdAt
                          ? format(new Date(project.createdAt), "MMM dd, yyyy")
                          : "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No projects found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
