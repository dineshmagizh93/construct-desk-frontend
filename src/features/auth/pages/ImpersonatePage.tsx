import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { http } from '@/lib/http'
import type { Company, User } from '@/types'
import { useAuthStore } from '../store'

/**
 * Entry point for a super-admin impersonation session. The console opens this page with the
 * minted session tokens in the URL hash; we seed the auth store, resolve the impersonated user
 * via /auth/me, strip the tokens from the URL, then drop into the dashboard.
 */
export function ImpersonatePage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const raw = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
    const params = new URLSearchParams(raw)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    if (!accessToken || !refreshToken) {
      setError('This impersonation link is invalid.')
      return
    }

    ;(async () => {
      try {
        useAuthStore.getState().beginImpersonation(accessToken, refreshToken)
        const me = await http<{ user: User; company: Company | null }>('/auth/me')
        useAuthStore.getState().setUser(me.user)
        if (me.company) useAuthStore.getState().setCompany(me.company)
        window.history.replaceState(null, '', '/dashboard')
        navigate('/dashboard', { replace: true })
      } catch {
        useAuthStore.getState().logout()
        setError('Could not start the impersonation session — it may have expired. Please try again from the console.')
      }
    })()
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center text-sm text-muted-foreground">
      {error ?? 'Starting impersonation session…'}
    </div>
  )
}
