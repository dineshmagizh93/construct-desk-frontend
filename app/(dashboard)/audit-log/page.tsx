"use client"

import { useState } from "react"
import { Shield, Download, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useAuditLog } from "@/lib/hooks/use-audit-log"
import { downloadCsv, objectsToCsv } from "@/lib/utils/export-csv"
import { format } from "date-fns"

const MODULES = ["projects", "tasks", "payments", "expenses", "documents", "leads", "users", "inventory", "vendors"]
const ACTIONS = ["create", "update", "delete", "approve", "reject", "login", "export"]

const MODULE_COLORS: Record<string, string> = {
  projects: "bg-blue-100 text-blue-700",
  tasks: "bg-violet-100 text-violet-700",
  payments: "bg-green-100 text-green-700",
  expenses: "bg-orange-100 text-orange-700",
  documents: "bg-slate-100 text-slate-700",
  leads: "bg-pink-100 text-pink-700",
  users: "bg-cyan-100 text-cyan-700",
  inventory: "bg-amber-100 text-amber-700",
  vendors: "bg-teal-100 text-teal-700",
}

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  approve: "bg-green-100 text-green-700",
  reject: "bg-red-100 text-red-700",
  login: "bg-slate-100 text-slate-600",
  export: "bg-indigo-100 text-indigo-700",
}

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { entries, total, loading, filters, updateFilters, goToPage } = useAuditLog()

  const filtered = entries.filter((e) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      e.userEmail?.toLowerCase().includes(q) ||
      e.action?.toLowerCase().includes(q) ||
      e.entityName?.toLowerCase().includes(q) ||
      e.module?.toLowerCase().includes(q)
    )
  })

  const handleExport = () => {
    const csv = objectsToCsv(entries, [
      { key: "createdAt", label: "Timestamp" },
      { key: "userEmail", label: "User" },
      { key: "module", label: "Module" },
      { key: "action", label: "Action" },
      { key: "entityName", label: "Entity" },
      { key: "details", label: "Details" },
      { key: "ipAddress", label: "IP Address" },
    ])
    downloadCsv(csv, `audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`)
  }

  const totalPages = Math.ceil(total / (filters.limit || 50))
  const currentPage = filters.page || 1

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
            <Shield className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-800">Audit Log</h1>
            <p className="text-[13px] text-slate-500">{total} events recorded</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by user, action, entity..."
            className="pl-8 text-[13px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={filters.module || ""}
          onChange={(e) => updateFilters({ module: e.target.value || undefined })}
          className="w-[140px] text-[13px]"
        >
          <option value="">All modules</option>
          {MODULES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </Select>
        <Select
          value={filters.action || ""}
          onChange={(e) => updateFilters({ action: e.target.value || undefined })}
          className="w-[130px] text-[13px]"
        >
          <option value="">All actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </Select>
        <Input
          type="date"
          className="w-[150px] text-[13px]"
          value={filters.startDate || ""}
          onChange={(e) => updateFilters({ startDate: e.target.value || undefined })}
          placeholder="From date"
        />
        <Input
          type="date"
          className="w-[150px] text-[13px]"
          value={filters.endDate || ""}
          onChange={(e) => updateFilters({ endDate: e.target.value || undefined })}
          placeholder="To date"
        />
        {(filters.module || filters.action || filters.startDate || filters.endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateFilters({ module: undefined, action: undefined, startDate: undefined, endDate: undefined })}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Shield className="mb-3 h-10 w-10 text-slate-200" />
            <p className="text-[14px] font-medium text-slate-500">No audit events found</p>
            <p className="text-[13px] text-slate-400">Adjust your filters or check back later</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-4 py-3 font-medium text-slate-500">Timestamp</th>
                  <th className="px-4 py-3 font-medium text-slate-500">User</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Module</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Action</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Entity</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Details</th>
                  <th className="px-4 py-3 font-medium text-slate-500">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {format(new Date(entry.createdAt), "MMM d, HH:mm:ss")}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{entry.userEmail}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium capitalize ${
                          MODULE_COLORS[entry.module] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {entry.module}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium capitalize ${
                          ACTION_COLORS[entry.action] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{entry.entityName || "—"}</td>
                    <td className="max-w-[240px] truncate px-4 py-3 text-slate-500">
                      {entry.details || "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {entry.ipAddress || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[13px] text-slate-500">
          <span>
            Page {currentPage} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
