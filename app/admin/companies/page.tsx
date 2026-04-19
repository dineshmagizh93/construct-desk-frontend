"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { adminApi, Company } from "@/lib/api/admin"
import { useSuperAdmin } from "@/lib/hooks/use-super-admin"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Calendar,
  MoreVertical,
  Trash2,
  Ban,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { formatDateDMY, formatDateTimeDMY } from "@/lib/utils/date"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type TabType = "active" | "delete-requests" | "deleted" | "cancellation" | "cancelled"

export default function AdminCompaniesPage() {
  const { isSuperAdmin } = useSuperAdmin()
  const router = useRouter()
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<TabType>("active")
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set())
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [totalPages, setTotalPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [dateRange, setDateRange] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState(0)

  React.useEffect(() => {
    if (!isSuperAdmin) {
      router.push("/admin")
      return
    }

    fetchCompanies()
  }, [isSuperAdmin, router, page, limit, activeTab, search])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const filters: any = {
        page,
        limit,
      }

      // Apply tab-based filtering
      if (activeTab === "active") {
        filters.status = "active"
      } else if (activeTab === "deleted") {
        // Filter deleted companies
        filters.deleted = true
      }

      if (search) {
        filters.search = search
      }

      const response = await adminApi.getCompanies(filters)
      setCompanies(response.companies)
      setTotalPages(response.pagination.totalPages)
      setTotal(response.pagination.total)
    } catch (err: any) {
      setError(err.message || "Failed to load companies")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(companies.map((c) => c.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (companyId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(companyId)
    } else {
      newSelected.delete(companyId)
    }
    setSelectedRows(newSelected)
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting companies:", Array.from(selectedRows))
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
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

  // Calculate cancellation requests count (mock for now)
  const cancellationCount = 2

  if (!isSuperAdmin) {
    return null
  }

  const startIndex = (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, total)

  return (
    <div className="flex flex-col h-full min-h-0 space-y-3">
      <div className="flex-shrink-0">
        <PageHeader
          title="Companies"
          description="Manage all customer companies and their subscriptions"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b flex-shrink-0">
        <button
          onClick={() => {
            setActiveTab("active")
            setPage(1)
          }}
          className={cn(
            "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors",
            activeTab === "active"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Active / Inactive
        </button>
        <button
          onClick={() => {
            setActiveTab("delete-requests")
            setPage(1)
          }}
          className={cn(
            "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors",
            activeTab === "delete-requests"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Delete Requests
        </button>
        <button
          onClick={() => {
            setActiveTab("deleted")
            setPage(1)
          }}
          className={cn(
            "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors",
            activeTab === "deleted"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Deleted Accounts
        </button>
        <button
          onClick={() => {
            setActiveTab("cancellation")
            setPage(1)
          }}
          className={cn(
            "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors relative",
            activeTab === "cancellation"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Cancellation Requests
          {cancellationCount > 0 && (
            <Badge
              variant="destructive"
              className="ml-1.5 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]"
            >
              {cancellationCount}
            </Badge>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("cancelled")
            setPage(1)
          }}
          className={cn(
            "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors",
            activeTab === "cancelled"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Subscription Cancelled
        </button>
      </div>

      {/* Search and Filter Bar */}
      <Card className="flex-shrink-0">
        <CardContent className="pt-3 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by business name, name, email, phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-7 h-8 text-xs"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="MM/DD/YYYY - MM/DD/YYYY"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="pl-7 w-[200px] h-8 text-xs"
              />
            </div>
            <select className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs">
              <option>Date Type</option>
              <option>Created Date</option>
              <option>Last Payment Date</option>
              <option>Payment Due Date</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              className="relative h-8 px-2 text-xs"
              onClick={() => setActiveFilters(activeFilters > 0 ? 0 : 2)}
            >
              <Filter className="h-3 w-3 mr-1.5" />
              More Filters
              {activeFilters > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]"
                >
                  {activeFilters}
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={fetchCompanies}
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={handleExport}>
              <Download className="h-3 w-3 mr-1.5" />
              Export
            </Button>
            <Button size="sm" className="h-8 px-2 text-xs" onClick={() => router.push("/admin/companies/new")}>
              <Plus className="h-3 w-3 mr-1.5" />
              Add Company
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="flex-1 min-h-0 flex flex-col">
        <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
          {loading ? (
            <div className="p-4 space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-destructive text-xs">
              <p>{error}</p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="overflow-auto flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8 px-2">
                        <input
                          type="checkbox"
                          checked={selectedRows.size === companies.length && companies.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 w-3.5 h-3.5"
                        />
                      </TableHead>
                      <TableHead className="w-16 px-2 text-[11px] font-semibold">ID</TableHead>
                      <TableHead className="min-w-[140px] px-2 text-[11px] font-semibold">BUSINESS NAME</TableHead>
                      <TableHead className="min-w-[120px] px-2 text-[11px] font-semibold">FULL NAME</TableHead>
                      <TableHead className="min-w-[160px] px-2 text-[11px] font-semibold">EMAIL</TableHead>
                      <TableHead className="min-w-[110px] px-2 text-[11px] font-semibold">PHONE</TableHead>
                      <TableHead className="min-w-[110px] px-2 text-[11px] font-semibold">INTEGRATION DATE</TableHead>
                      <TableHead className="min-w-[100px] px-2 text-[11px] font-semibold">CREATED DATE</TableHead>
                      <TableHead className="min-w-[90px] px-2 text-[11px] font-semibold">PLAN</TableHead>
                      <TableHead className="min-w-[120px] px-2 text-[11px] font-semibold">LAST PAYMENT</TableHead>
                      <TableHead className="min-w-[120px] px-2 text-[11px] font-semibold">PAYMENT DUE</TableHead>
                      <TableHead className="min-w-[80px] px-2 text-[11px] font-semibold">STATUS</TableHead>
                      <TableHead className="w-8 px-2"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={13} className="text-center py-6 text-muted-foreground text-xs">
                          No companies found
                        </TableCell>
                      </TableRow>
                    ) : (
                      companies.map((company) => {
                        const primaryUser = company.users?.[0]
                        const isSelected = selectedRows.has(company.id)

                        return (
                          <TableRow
                            key={company.id}
                            className={cn(
                              "cursor-pointer hover:bg-accent/50 h-8",
                              isSelected && "bg-accent"
                            )}
                            onClick={() => router.push(`/admin/companies/${company.id}`)}
                          >
                            <TableCell className="px-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  handleSelectRow(company.id, e.target.checked)
                                }}
                                className="rounded border-gray-300 w-3.5 h-3.5"
                              />
                            </TableCell>
                            <TableCell className="font-mono text-[11px] px-2 whitespace-nowrap">
                              {company.id.slice(-5).toUpperCase()}
                            </TableCell>
                            <TableCell className="px-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/admin/companies/${company.id}`)
                                }}
                                className="text-primary hover:underline font-medium text-[11px] text-left"
                              >
                                {company.name}
                              </button>
                            </TableCell>
                            <TableCell className="text-[11px] px-2 whitespace-nowrap">
                              {primaryUser
                                ? `${primaryUser.firstName} ${primaryUser.lastName}`
                                : "N/A"}
                            </TableCell>
                            <TableCell className="px-2">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[11px]">{company.email}</span>
                                {company.email && (
                                  <Badge
                                    variant="outline"
                                    className="w-fit text-[9px] h-4 px-1 bg-green-50 text-green-700 border-green-200"
                                  >
                                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-[11px] px-2 whitespace-nowrap">
                              {company.phone || "N/A"}
                            </TableCell>
                            <TableCell className="text-[11px] px-2 whitespace-nowrap">
                              {company.createdAt
                                ? formatDateDMY(company.createdAt)
                                : "N/A"}
                            </TableCell>
                            <TableCell className="text-[11px] px-2 whitespace-nowrap">
                              {company.createdAt
                                ? formatDateDMY(company.createdAt)
                                : "N/A"}
                            </TableCell>
                            <TableCell className="px-2">
                              <div className="text-[10px]">
                                {getPlanBadge(company.subscriptionPlan || "TRIAL")}
                              </div>
                            </TableCell>
                            <TableCell className="text-[11px] px-2 whitespace-nowrap">
                              {company.subscriptionStartDate
                                ? formatDateTimeDMY(company.subscriptionStartDate)
                                : "N/A"}
                            </TableCell>
                            <TableCell className="text-[11px] px-2 whitespace-nowrap">
                              {company.subscriptionEndDate
                                ? formatDateTimeDMY(company.subscriptionEndDate)
                                : "N/A"}
                            </TableCell>
                            <TableCell className="px-2">
                              <div className="text-[10px]">
                                {getStatusBadge(company.subscriptionStatus)}
                              </div>
                            </TableCell>
                            <TableCell className="px-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // TODO: Show dropdown menu
                                }}
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between flex-shrink-0 py-2 border-t">
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            Showing {startIndex}-{endIndex} of {total} results
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Results per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
              className="h-7 rounded-md border border-input bg-background px-2 py-1 text-xs"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="h-7 w-7 p-0 text-xs"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
