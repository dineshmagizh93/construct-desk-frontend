import { useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store'

/** Persistent bar shown whenever a super admin is impersonating a tenant, with a one-click exit. */
export function ImpersonationBanner() {
  const impersonating = useAuthStore((s) => s.impersonating)
  const company = useAuthStore((s) => s.company)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  if (!impersonating) return null

  return (
    <div className="flex shrink-0 items-center justify-center gap-3 bg-amber-500 px-4 py-1.5 text-center text-xs font-semibold text-amber-950">
      <Eye className="size-3.5 shrink-0" />
      <span>
        Impersonation mode — viewing as {company?.name ?? 'a tenant company'}. Actions you take affect their live data.
      </span>
      <button
        type="button"
        onClick={() => {
          logout()
          navigate('/login', { replace: true })
        }}
        className="rounded bg-amber-950/15 px-2 py-0.5 font-bold transition-colors hover:bg-amber-950/25"
      >
        Exit
      </button>
    </div>
  )
}
