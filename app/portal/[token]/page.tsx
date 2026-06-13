"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  Building2,
  CheckSquare,
  CreditCard,
  FileText,
  Camera,
  AlertTriangle,
  Calendar,
  DollarSign,
} from "lucide-react"
import { clientPortalApi, ClientPortalView } from "@/lib/api/client-portal"
import { format, parseISO } from "date-fns"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    on_hold: "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-700",
    done: "bg-green-100 text-green-700",
    in_progress: "bg-blue-100 text-blue-700",
    todo: "bg-slate-100 text-slate-600",
    paid: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    overdue: "bg-red-100 text-red-700",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
        map[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  )
}

export default function ClientPortalPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<ClientPortalView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!token) return
    clientPortalApi
      .getProjectView(token as string)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-slate-300" />
        <h1 className="text-[18px] font-semibold text-slate-700">Portal not found</h1>
        <p className="mt-1 text-[14px] text-slate-400">
          This link may have expired or been revoked. Contact your contractor for a new link.
        </p>
      </div>
    )
  }

  const project = data.project || {}
  const tasks = data.tasks || []
  const payments = data.payments || []
  const documents = data.documents || []
  const siteProgress = data.siteProgress || []

  const doneTasks = tasks.filter((t: any) => t.status === "done").length
  const paidTotal = payments.filter((p: any) => p.status === "paid").reduce((s: number, p: any) => s + (p.amount || 0), 0)
  const pendingTotal = payments.filter((p: any) => p.status !== "paid").reduce((s: number, p: any) => s + (p.amount || 0), 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-800">{project.name || "Project"}</p>
              <p className="text-[12px] text-slate-500">Client Portal · Read-only view</p>
            </div>
          </div>
          <StatusPill status={project.status || "active"} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Summary KPIs */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Tasks Done", value: `${doneTasks}/${tasks.length}`, icon: CheckSquare, color: "blue" },
            { label: "Amount Paid", value: formatCurrency(paidTotal), icon: DollarSign, color: "green" },
            { label: "Amount Pending", value: formatCurrency(pendingTotal), icon: CreditCard, color: "amber" },
            { label: "Documents", value: String(documents.length), icon: FileText, color: "slate" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[12px] text-slate-500">{item.label}</p>
              <p className="mt-1 text-[20px] font-bold text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Tasks */}
        {tasks.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-slate-500" />
              <h2 className="text-[14px] font-semibold text-slate-800">Tasks</h2>
              <span className="ml-auto text-[12px] text-slate-400">{doneTasks} of {tasks.length} complete</span>
            </div>
            <div className="mb-3 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: tasks.length ? `${(doneTasks / tasks.length) * 100}%` : "0%" }}
              />
            </div>
            <div className="space-y-2">
              {tasks.map((task: any) => (
                <div key={task.id} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                  <span
                    className={`h-2 w-2 flex-shrink-0 rounded-full ${
                      task.status === "done" ? "bg-green-500" : task.status === "in_progress" ? "bg-blue-500" : "bg-slate-300"
                    }`}
                  />
                  <span className={`flex-1 text-[13px] ${task.status === "done" ? "text-slate-400 line-through" : "text-slate-700"}`}>
                    {task.title}
                  </span>
                  <StatusPill status={task.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payments */}
        {payments.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-500" />
              <h2 className="text-[14px] font-semibold text-slate-800">Payment Schedule</h2>
            </div>
            <div className="space-y-2">
              {payments.map((payment: any) => (
                <div key={payment.id} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5">
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-slate-700">{payment.description || payment.milestone || "Payment"}</p>
                    {payment.dueDate && (
                      <p className="text-[11px] text-slate-400">
                        Due: {format(parseISO(payment.dueDate), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-slate-800">{formatCurrency(payment.amount || 0)}</span>
                  <StatusPill status={payment.status || "pending"} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Site Progress Photos */}
        {siteProgress.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Camera className="h-4 w-4 text-slate-500" />
              <h2 className="text-[14px] font-semibold text-slate-800">Site Progress</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {siteProgress.map((entry: any) => (
                <div key={entry.id} className="overflow-hidden rounded-lg border border-slate-100">
                  {entry.photos?.[0] ? (
                    <img src={entry.photos[0]} alt={entry.description} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-slate-100">
                      <Camera className="h-6 w-6 text-slate-300" />
                    </div>
                  )}
                  <div className="px-2 py-1.5">
                    <p className="text-[11px] font-medium text-slate-600">{entry.description || "Update"}</p>
                    {entry.date && (
                      <p className="text-[10px] text-slate-400">{format(parseISO(entry.date), "MMM d")}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              <h2 className="text-[14px] font-semibold text-slate-800">Documents</h2>
            </div>
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5 hover:bg-slate-50"
                >
                  <FileText className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  <span className="flex-1 text-[13px] text-slate-700">{doc.name}</span>
                  <span className="text-[11px] text-slate-400">{doc.type}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <p className="pb-8 text-center text-[11px] text-slate-400">
          This is a read-only client view. Powered by ConstructDesk.
        </p>
      </main>
    </div>
  )
}
