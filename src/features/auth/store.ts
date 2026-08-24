import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Company, User } from '@/types'
import type { LoginPayload } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

interface AuthResponse {
  user: User
  company: Company | null
  accessToken: string
  refreshToken: string
}

async function postAuth(path: string, body: unknown): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? 'Something went wrong')
  }
  return res.json()
}

interface AuthState {
  user: User | null
  company: Company | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  /** True when a super admin is viewing this session via impersonation (shows an exit banner). */
  impersonating: boolean
  login: (payload: LoginPayload) => Promise<User>
  logout: () => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setCompany: (company: Company) => void
  setUser: (user: User) => void
  /** Seed a session from impersonation tokens (user/company are fetched separately via /auth/me). */
  beginImpersonation: (accessToken: string, refreshToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      company: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      impersonating: false,
      login: async (payload) => {
        const data = await postAuth('/auth/login', payload)
        set({
          user: data.user,
          company: data.company,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          impersonating: false,
        })
        return data.user
      },
      logout: () => set({ user: null, company: null, accessToken: null, refreshToken: null, isAuthenticated: false, impersonating: false }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setCompany: (company) => set({ company }),
      setUser: (user) => set({ user }),
      beginImpersonation: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true, impersonating: true }),
    }),
    { name: 'constructdesk-auth' },
  ),
)
