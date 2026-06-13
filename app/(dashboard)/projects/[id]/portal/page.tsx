"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Link2, Plus, Trash2, Copy, Check, Clock, ShieldOff, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { clientPortalApi, ClientPortalToken } from "@/lib/api/client-portal"
import toast from "react-hot-toast"
import { format, parseISO } from "date-fns"

export default function ClientPortalManagePage() {
  const { id: projectId } = useParams<{ id: string }>()
  const [tokens, setTokens] = useState<ClientPortalToken[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [label, setLabel] = useState("")
  const [expiresInDays, setExpiresInDays] = useState("")
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [newToken, setNewToken] = useState<ClientPortalToken | null>(null)

  const fetchTokens = async () => {
    try {
      const data = await clientPortalApi.listTokens(projectId)
      setTokens(data)
    } catch {
      toast.error("Failed to load portal links")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projectId) fetchTokens()
  }, [projectId])

  const portalUrl = (token: string) =>
    typeof window !== "undefined" ? `${window.location.origin}/portal/${token}` : `/portal/${token}`

  const handleCopy = (token: ClientPortalToken) => {
    navigator.clipboard.writeText(portalUrl(token.token))
    setCopiedId(token.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      const created = await clientPortalApi.generateToken(
        projectId,
        label || undefined,
        expiresInDays ? Number(expiresInDays) : undefined
      )
      setTokens((prev) => [created, ...prev])
      setNewToken(created)
      setCreateOpen(false)
      setLabel("")
      setExpiresInDays("")
      toast.success("Portal link created")
    } catch {
      toast.error("Failed to create portal link")
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (id: string) => {
    try {
      await clientPortalApi.revokeToken(id)
      setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: false } : t)))
      toast.success("Link revoked")
    } catch {
      toast.error("Failed to revoke link")
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <Link2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-800">Client Portal</h1>
            <p className="text-[13px] text-slate-500">Share a read-only project view with your client</p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Generate Link
        </Button>
      </div>

      {/* New token highlight */}
      {newToken && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-green-800">New portal link created!</p>
              <p className="mt-0.5 break-all font-mono text-[12px] text-green-700">{portalUrl(newToken.token)}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(portalUrl(newToken.token))
                toast.success("Copied!")
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <button
            className="mt-2 text-[11px] text-green-600 hover:text-green-800"
            onClick={() => setNewToken(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Token list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : tokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16 text-center">
          <Link2 className="mb-3 h-10 w-10 text-slate-200" />
          <p className="text-[14px] font-medium text-slate-500">No portal links yet</p>
          <p className="text-[13px] text-slate-400">Generate a link to share this project with your client.</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Generate First Link
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((t) => (
            <div
              key={t.id}
              className={`rounded-xl border p-4 ${
                t.isActive ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-slate-800">{t.label || "Client Portal Link"}</p>
                    {!t.isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600">
                        <ShieldOff className="h-3 w-3" /> Revoked
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">{portalUrl(t.token)}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Created {format(parseISO(t.createdAt), "MMM d, yyyy")}</span>
                    {t.expiresAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expires {format(parseISO(t.expiresAt), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  {t.isActive && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => window.open(portalUrl(t.token), "_blank")}
                        title="Preview"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => handleCopy(t)}
                        title="Copy link"
                      >
                        {copiedId === t.id ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-red-400 hover:text-red-600"
                        onClick={() => handleRevoke(t.id)}
                        title="Revoke"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Portal Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Label (optional)</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Main Client, Site Inspector"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Expires in (days, optional)</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                placeholder="e.g. 30 (leave blank for no expiry)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Generating..." : "Generate Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
